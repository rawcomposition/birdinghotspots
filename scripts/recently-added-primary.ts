import Group from "../models/Group";
import Hotspot from "../models/Hotspot";
import mongoose from "mongoose";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const initHotspotSchema = Hotspot; // Trick to make sure the Hotspot model is loaded

const findFalseNeedsPrimary = async () => {
  await connect();

  const groups = await Group.find(
    { needsPrimaryHotspot: true, primaryHotspot: { $exists: true, $ne: null } },
    ["locationId", "name", "primaryHotspot"]
  )
    .populate("primaryHotspot", ["name", "locationId"])
    .lean();

  const rows = groups
    .filter((g: any) => g.primaryHotspot?.locationId)
    .map((g: any) => ({
      groupLocationId: g.locationId,
      primaryLocationId: g.primaryHotspot.locationId,
      groupName: g.name,
      primaryHotspotName: g.primaryHotspot.name,
    }));

  const header = "groupLocationId,primaryLocationId,groupName,primaryHotspotName";
  const csvLines = rows.map(
    (r) => `${r.groupLocationId},${r.primaryLocationId},"${r.groupName}","${r.primaryHotspotName}"`
  );
  const csv = [header, ...csvLines].join("\n");

  fs.writeFileSync("recently-added-primary.csv", csv);
  console.log(`Wrote ${rows.length} rows to recently-added-primary.csv`);

  process.exit();
};

findFalseNeedsPrimary();
