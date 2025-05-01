import Hotspot from "../models/Hotspot";
import Group from "../models/Group";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const initHotspotSchema = Hotspot; // Trick to make sure the Hotspot model is loaded

const sanitizeName = (name: string) => {
  let result = name
    .replaceAll("NP", "National Park")
    .replaceAll("NWR", "National Wildlife Refuge")
    .replaceAll("RA", "Recreation Area")
    .replaceAll("SP", "State Park")
    .replaceAll("PN", "Parque Nacional")
    .replaceAll("WMA", "Wildlife Managment Area")
    .replaceAll("Rd.", "Road")
    .replaceAll("Pt.", "Point")
    .replaceAll("Co.", "County");

  result = result.toLowerCase().trim();

  const parenthesisIndex = result.indexOf("(");
  if (parenthesisIndex !== -1) {
    result = result.substring(0, parenthesisIndex).trim();
  }

  return result;
};

const findGroupPrimaryHotspot = async () => {
  await connect();

  let matchCount = 0;
  let noMatchCount = 0;

  const groups = await Group.find({ primaryHotspot: { $exists: false } }, [
    "locationId",
    "name",
    "primaryHotspot",
    "hotspots",
  ])
    .populate("hotspots", ["name"])
    .lean();

  const bulkWrites: any[] = [];

  for (const group of groups) {
    const primaryHotspot = group.hotspots.find(
      (hotspot: any) => sanitizeName(hotspot.name) === sanitizeName(group.name)
    );
    if (primaryHotspot) {
      matchCount++;
      console.log("MATCH", `https://birdinghotspots.org/group/${group.locationId}`, group.name, primaryHotspot.name);
      bulkWrites.push({
        updateOne: {
          filter: { _id: group._id },
          update: { $set: { primaryHotspot: primaryHotspot._id } },
        },
      });
    } else {
      noMatchCount++;
    }
  }

  await Group.bulkWrite(bulkWrites);

  console.log("Done!");
  console.log(`Match count: ${matchCount}`);
  console.log(`No match count: ${noMatchCount}`);
  process.exit();
};

findGroupPrimaryHotspot();
