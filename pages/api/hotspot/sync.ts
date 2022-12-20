import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import States from "data/states.json";
import Logs from "models/Log";

const getHotspotsForRegion = async (region: string) => {
  console.log(`Fetching eBird hotspots for ${region}`);
  const response = await fetch(`https://api.ebird.org/v2/ref/hotspot/${region}?fmt=json`);
  const json = await response.json();

  if ("errors" in json) {
    throw "Error fetching eBird photos";
  }

  return json.map((hotspot: any) => ({
    locationId: hotspot.locId,
    name: hotspot.locName.trim(),
    lat: hotspot.lat,
    lng: hotspot.lng,
    total: hotspot.numSpeciesAllTime || 0,
    subnational1Code: hotspot.subnational1Code,
    subnational2Code: hotspot.subnational2Code,
  }));
};

const updateHotspot = (dbHotspot: any, ebird: any) => {
  const { name, lat, lng, total } = ebird;
  const hasChanged =
    name !== dbHotspot.name || lat !== dbHotspot.lat || lng !== dbHotspot.lng || total !== dbHotspot.species;
  if (!hasChanged) return;
  let location = null;
  if (lat && lng) {
    location = {
      type: "Point",
      coordinates: [lng, lat],
    };
  }
  console.log(`Updating hotspot ${dbHotspot.locationId}`);
  return {
    updateOne: {
      filter: { _id: dbHotspot._id },
      update: {
        name,
        lat,
        lng,
        species: total,
        location,
      },
    },
  };
};

const deleteHotspot = (id: any) => {
  console.log(`Deleting hotspot ${id}`);
  return {
    updateOne: {
      filter: { _id: id },
      update: { needsDeleting: true },
    },
  };
};

const insertHotspot = ({ lat, lng, locationId, name, total, ...data }: any) => {
  if (!lat || !lng || !locationId || !name) return;
  console.log(`Inserting hotspot ${locationId}`);
  const stateCode = data?.subnational1Code;
  const countyCode = data?.subnational2Code;
  let location = null;
  if (lat && lng) {
    location = {
      type: "Point",
      coordinates: [lng, lat],
    };
  }
  return {
    insertOne: {
      document: {
        name,
        zoom: 14,
        lat,
        lng,
        countryCode: data.subnational1Code?.split("-")?.[0],
        stateCode,
        countyCode,
        locationId,
        url: `/hotspot/${locationId}`,
        location,
        noContent: true,
        species: total,
      },
    },
  };
};

type DateType = {
  date: string;
  region: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { key, state }: any = req.query;
  if (process.env.CRON_KEY && key !== process.env.CRON_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  await connect();
  try {
    const activeStates = States.filter((state) => state.active);

    const dates: DateType[] = [];
    await Promise.all(
      activeStates.map(async (state: any) => {
        const result = await Logs.findOne({ message: { $regex: new RegExp(`^synced ${state.code}`) } }).sort({
          createdAt: -1,
        });
        dates.push({
          date: result?.createdAt,
          region: state.code,
        });
      })
    );

    let nextState = state;

    if (!state) {
      const sortedDates = dates.sort((a, b) => a.date.localeCompare(b.date));
      nextState = sortedDates[0]?.region;
    }

    console.log(`Syncing ${nextState}`);
    const hotspots = await getHotspotsForRegion(nextState);
    const fields = ["locationId", "name", "lat", "lng", "species"];
    const dbHotspots = await Hotspot.find({ stateCode: nextState }, fields);
    const dbHotspotIds: string[] = dbHotspots.map((hotspot) => hotspot.locationId);
    const ebirdIds = hotspots.map(({ locationId }: any) => locationId);

    const bulkWrites: any = [];
    let insertCount = 0;

    hotspots.forEach((ebird: any) => {
      const index = dbHotspotIds.indexOf(ebird.locationId);
      if (index > -1) {
        const dbHotspot = dbHotspots[index];
        const updateOp = updateHotspot(dbHotspot, ebird);
        if (updateOp) bulkWrites.push(updateOp);
        return;
      }
      const insertOp = insertHotspot(ebird);
      if (insertOp) {
        bulkWrites.push(insertOp);
        insertCount++;
      }
    });

    dbHotspots.forEach(async (dbHotspot: any) => {
      if (dbHotspot.isGroup || ebirdIds.includes(dbHotspot.locationId)) return;
      bulkWrites.push(deleteHotspot(dbHotspot._id));
    });

    await Hotspot.bulkWrite(bulkWrites);

    await Logs.create({
      user: "BirdBot",
      type: "sync",
      message: `synced ${nextState}. Found ${insertCount || 0} new ${insertCount === 1 ? "hotspot" : "hotspots"}.`,
    });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
