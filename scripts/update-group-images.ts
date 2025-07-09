import Hotspot from "../models/Hotspot";
import Group from "../models/Group";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { uploadGroupMapImg } from "lib/s3";
dotenv.config();

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const initHotspotSchema = Hotspot; // Trick to make sure the Hotspot model is loaded

const updateGroupImages = async () => {
  await connect();

  const groups = await Group.find({})
    .sort({ updatedAt: -1 })
    .populate("hotspots", ["lat", "lng", "species"])
    .limit(150)
    .lean();

  const bulkWrites: any[] = [];

  for (const group of groups) {
    const mapImgUrl = await uploadGroupMapImg(group.hotspots);
    bulkWrites.push({
      updateOne: {
        filter: { _id: group._id },
        update: { $set: { mapImgUrl } },
      },
    });
    console.log("Updated", group.name);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  await Group.bulkWrite(bulkWrites);

  console.log("Done!");
  process.exit();
};

updateGroupImages();
