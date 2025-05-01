import Hotspot from "../models/Hotspot";
import Group from "../models/Group";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import dayjs from "dayjs";
import fs from "fs";
dotenv.config();

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const exportHotspotsCsv = async () => {
  await connect();

  const groups = await Group.find({}, ["locationId", "name", "primaryHotspot"]).lean();
  const hotspots = await Hotspot.find(
    { $or: [{ noContent: { $ne: true } }, { "groupIds.0": { $exists: true } }, { "images.0": { $exists: true } }] },
    ["locationId", "name", "countryCode", "stateCode", "countyCode", "lat", "lng", "groupIds"]
  ).lean();

  const csvHeader = "LocationId,Name,Lat,Lng,Country,State,County,Groups,Group1,Group2,Group3,Group4";

  const csvBody = hotspots.map((hotspot) => {
    const groupIds =
      hotspot.groupIds?.map((id) => groups.find((group) => group._id.toString() === id.toString())?.locationId) || [];
    return `${hotspot.locationId},"${hotspot.name}",${hotspot.lat},${hotspot.lng},${hotspot.countryCode},${
      hotspot.stateCode
    },${hotspot.countyCode},${groupIds.length},${groupIds.join(",")}`;
  });

  const fileName = `hotspots-aggregated-${dayjs().format("YYYY-MM-DD-HH-mm-ss")}.csv`;
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

exportHotspotsCsv();
