import Hotspot from "../models/Hotspot";
import Group from "../models/Group";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import dayjs from "dayjs";
import fs from "fs";
dotenv.config();

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const initHotspotSchema = Hotspot;

const exportGroupHotspotsCsv = async () => {
  await connect();

  const groups = await Group.find({}, ["locationId", "hotspots"])
    .populate("hotspots", ["locationId", "countyCode", "stateCode"])
    .lean();

  const csvHeader = "groupLocationId,hotspotLocationId,countyCode,stateCode";

  const hotspotGroupCount: Record<string, number> = {};

  const csvRows: string[] = [];
  for (const group of groups) {
    for (const hotspot of group.hotspots) {
      if (!hotspot?.locationId) continue;
      csvRows.push(
        `${group.locationId},${hotspot.locationId},${hotspot.countyCode || ""},${hotspot.stateCode || ""}`
      );
      hotspotGroupCount[hotspot.locationId] = (hotspotGroupCount[hotspot.locationId] || 0) + 1;
    }
  }

  const multiGroupCount = Object.values(hotspotGroupCount).filter((count) => count > 1).length;
  console.log(`Unique hotspots appearing in more than one group: ${multiGroupCount}`);

  const fileName = `group-hotspots-${dayjs().format("YYYY-MM-DD-HH-mm-ss")}.csv`;
  try {
    if (!fs.existsSync("exports")) {
      fs.mkdirSync("exports");
    }
    fs.writeFileSync(`exports/${fileName}`, `${csvHeader}\n${csvRows.join("\n")}`);
    console.log(`File written to exports/${fileName}`);
  } catch (error) {
    console.error(`Failed to write file: ${error}`);
    process.exit(1);
  }

  process.exit();
};

exportGroupHotspotsCsv();
