import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Settings from "models/Settings";
import SyncRegions from "data/sync-regions.json";
import Logs from "models/Log";
import { getHotspotsForRegion } from "lib/helpers";

// Mostly stakeouts that don't follow the naming convention, or are otherwise are obvious mistakes on eBird hotspot reviewers part.
const blockedLocationIds = ["L3934548", "L7929720", "L10823928", "L7820108", "L109212", "L109221", "L30522405"];

const updateHotspot = (dbHotspot: any, ebird: any) => {
  const { name, lat, lng, total, subnational2Code } = ebird;
  const hasChanged =
    name !== dbHotspot.name ||
    lat !== dbHotspot.lat ||
    lng !== dbHotspot.lng ||
    total !== dbHotspot.species ||
    subnational2Code !== dbHotspot.countyCode;
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
        countyCode: subnational2Code,
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
  const hasValidStateCode = (data?.subnational1Code?.split("-")?.filter(Boolean)?.length || 0) > 1;
  const stateCode = hasValidStateCode ? data?.subnational1Code : null;
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

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { key, state }: any = req.query;

  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}` && key !== process.env.CRON_SECRET) {
    return res.status(401).end("Unauthorized");
  }
  await connect();
  try {
    const settings = await Settings.findOne({}, "lastSyncRegion");
    const lastSyncRegion = settings?.lastSyncRegion;

    const lastSyncRegionIndex = SyncRegions.indexOf(lastSyncRegion);
    const nextRegion = state || SyncRegions[lastSyncRegionIndex + 1] || SyncRegions[0];

    console.log(`Syncing ${nextRegion}`);
    const fields = ["locationId", "name", "lat", "lng", "species", "countyCode"];
    const [unfilteredHotspots, dbHotspots] = await Promise.all([
      getHotspotsForRegion(nextRegion),
      Hotspot.find({ $or: [{ stateCode: nextRegion }, { countryCode: nextRegion }] }, fields),
    ]);
    const hotspots = unfilteredHotspots.filter(
      (hotspot: any) =>
        !hotspot.name.toLowerCase().startsWith("stakeout") && !blockedLocationIds.includes(hotspot.locationId)
    );
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

    dbHotspots.forEach((dbHotspot: any) => {
      if (dbHotspot.isGroup || ebirdIds.includes(dbHotspot.locationId)) return;
      bulkWrites.push(deleteHotspot(dbHotspot._id));
    });

    await Hotspot.bulkWrite(bulkWrites);

    await Promise.all([
      Logs.create({
        user: "BirdBot",
        type: "sync",
        message: `synced ${nextRegion}. Found ${insertCount || 0} new ${insertCount === 1 ? "hotspot" : "hotspots"}.`,
      }),
      Settings.updateOne({}, { lastSyncRegion: nextRegion }),
    ]);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
