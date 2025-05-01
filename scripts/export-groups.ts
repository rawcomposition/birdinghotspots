import Hotspot from "../models/Hotspot";
import Group from "../models/Group";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import dayjs from "dayjs";
import fs from "fs";
dotenv.config();

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const initHotspotSchema = Hotspot; // Trick to make sure the Hotspot model is loaded

const exportGroupsCsv = async () => {
  await connect();

  const groups = await Group.find({}, ["locationId", "name", "hotspots", "primaryHotspot", "countryCode", "stateCodes"])
    .populate("primaryHotspot", ["locationId", "name"])
    .lean();

  const csvHeader =
    "Group ID,Name,Primary Hotspot ID,Primary Hotspot Name,Hotspots,Country,State1,State2,State3,State4";

  const csvBody = groups.map((group) => {
    return `${group.locationId},"${group.name}",${group.primaryHotspot?.locationId || ""},"${
      group.primaryHotspot?.name || ""
    }",${group.hotspots.length},${group.countryCode},${group.stateCodes.join(",")}`;
  });

  const fileName = `groups-${dayjs().format("YYYY-MM-DD-HH-mm-ss")}.csv`;
  try {
    if (!fs.existsSync("exports")) {
      fs.mkdirSync("exports");
    }
    fs.writeFileSync(`exports/${fileName}`, `${csvHeader}\n${csvBody.join("\n")}`);
    console.log(`File written to exports/${fileName}`);
  } catch (error) {
    console.error(`Failed to write file: ${error}`);
    process.exit(1);
  }

  process.exit();
};

exportGroupsCsv();
