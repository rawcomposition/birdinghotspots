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
    ["locationId", "name", "countryCode", "stateCode", "countyCode", "lat", "lng", "groupIds", "images", "noContent"]
  ).lean();

  const csvHeader =
    "LocationId,Hotspot Name,Lat,Lng,Group ID,Group Name,Country,State,County,Groups Count,Has Content,Has Images";

  let csvRows: string[] = [];

  hotspots.forEach((hotspot) => {
    if (!hotspot.groupIds || hotspot.groupIds.length === 0) {
      csvRows.push(
        `${hotspot.locationId},"${hotspot.name}",${hotspot.lat},${hotspot.lng},,,${hotspot.countryCode},${
          hotspot.stateCode
        },${hotspot.countyCode},0,${hotspot.noContent ? 0 : 1},${!!hotspot.images?.length ? 1 : 0}`
      );
      return;
    }

    hotspot.groupIds.forEach((groupId) => {
      const group = groups.find((g) => g._id.toString() === groupId.toString());
      if (group) {
        csvRows.push(
          `${hotspot.locationId},"${hotspot.name}",${hotspot.lat},${hotspot.lng},${group.locationId},"${group.name}",${
            hotspot.countryCode
          },${hotspot.stateCode},${hotspot.countyCode},${hotspot.groupIds?.length || 0},${hotspot.noContent ? 0 : 1},${
            !!hotspot.images?.length ? 1 : 0
          }`
        );
      }
    });
  });

  const fileName = `hotspots-duplicated-${dayjs().format("YYYY-MM-DD-HH-mm-ss")}.csv`;
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

exportHotspotsCsv();
