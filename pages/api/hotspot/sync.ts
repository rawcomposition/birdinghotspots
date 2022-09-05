import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot.mjs";
import States from "data/states.json";

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

const updateHotspot = async (dbHotspot: any, ebird: any) => {
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
  await Hotspot.updateOne(
    { _id: dbHotspot._id },
    {
      $set: {
        name,
        lat,
        lng,
        species: total,
        location,
      },
    },
    { writeConcern: { w: 0 } }
  );
};

const deleteHotspot = async (id: any) => {
  console.log(`Deleting hotspot ${id}`);
  await Hotspot.updateOne(
    { _id: id },
    {
      $set: {
        needsDeleting: true,
      },
    },
    { writeConcern: { w: 0 } }
  );
};

const insertHotspot = async ({ lat, lng, locationId, name, total, ...data }: any) => {
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
  try {
    await Hotspot.create(
      {
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
      { writeConcern: { w: 0 } }
    );
  } catch (e: any) {
    console.log(e.message);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { key }: any = req.query;
  if (process.env.CRON_KEY && key !== process.env.CRON_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  await connect();
  try {
    const activeStates = States.filter((state) => state.active);
    await Promise.all(
      activeStates.map(async (state) => {
        console.log(`Syncing ${state.code}`);
        const hotspots = await getHotspotsForRegion(state.code);
        const fields = ["locationId", "name", "lat", "lng", "species"];
        const dbHotspots = await Hotspot.find({ isGroup: { $ne: true }, stateCode: state.code }, fields);
        const ebirdIds = hotspots.map(({ locationId }: any) => locationId);

        await Promise.all(
          hotspots.map(async (ebird: any) => {
            const dbHotspot = dbHotspots.find((it) => it.locationId === ebird.locationId);
            if (dbHotspot) {
              await updateHotspot(dbHotspot, ebird);
              return;
            }
            await insertHotspot(ebird);
          })
        );
        await Promise.all(
          dbHotspots.map(async (dbHotspot: any) => {
            if (dbHotspot.isGroup || ebirdIds.includes(dbHotspot.locationId)) return;
            await deleteHotspot(dbHotspot._id);
          })
        );
      })
    );
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
