import Hotspot from "../models/Hotspot";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const LIMIT = 1;
const LOG = true;

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const migrateSections = async () => {
  await connect();

  const hotspots = await Hotspot.find({
    $and: [
      { noContent: false },
      {
        $or: [{ tips: { $ne: "" } }, { birds: { $ne: "" } }, { hikes: { $ne: "" } }],
      },
    ],
  }).limit(LIMIT);

  console.log(`Found ${hotspots.length} hotspots`);

  const bulkWrites: any[] = [];

  for (const hotspot of hotspots) {
    if (hotspot.birding && hotspot.birding.trim()) {
      console.log(`Skipping ${hotspot.name} because it already has 'birding' content`);
      continue;
    }
    // @ts-ignore
    const birding = [hotspot.tips, hotspot.birds, hotspot.hikes].filter(Boolean).join("\n");
    bulkWrites.push({
      updateOne: {
        filter: { _id: hotspot._id },
        update: { $set: { plan: "", birding }, $unset: { tips: "", birds: "", hikes: "" } },
      },
    });
    if (LOG) {
      console.log(`http://localhost:3000/hotspot/${hotspot.locationId}`);
    }
  }

  await Hotspot.bulkWrite(bulkWrites);

  console.log("Done!");
  process.exit();
};

migrateSections();
