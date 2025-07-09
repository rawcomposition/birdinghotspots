import Group from "../models/Group";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const LIMIT = 10000;
const LOG = false;

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const migrateSections = async () => {
  await connect();

  const groups = await Group.find().limit(LIMIT);

  console.log(`Found ${groups.length} groups`);

  const bulkWrites: any[] = [];

  for (const group of groups) {
    if (group.birding && group.birding.trim()) {
      console.log(`Skipping ${group.name} because it already has 'birding' content`);
      continue;
    }
    // @ts-ignore
    const birding = [group.tips, group.birds, group.hikes].filter(Boolean).join("\n");
    bulkWrites.push({
      updateOne: {
        filter: { _id: group._id },
        update: { $set: { plan: "", birding }, $unset: { tips: "", birds: "", hikes: "" } },
      },
    });
    if (LOG) {
      console.log(`http://localhost:3000/group/${group.locationId}`);
    }
  }

  await Group.bulkWrite(bulkWrites);

  console.log("Done!");
  process.exit();
};

migrateSections();
