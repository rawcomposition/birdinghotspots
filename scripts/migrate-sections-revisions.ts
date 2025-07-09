import Revision from "../models/Revision";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const LIMIT = 10000;
const LOG = false;

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const migrateSections = async () => {
  await connect();

  const revisions = await Revision.find({
    $or: [{ tips: { $exists: true } }, { birds: { $exists: true } }, { hikes: { $exists: true } }],
  })
    .sort({ createdAt: -1 })
    .limit(LIMIT);

  console.log(`Found ${revisions.length} revisions`);

  const bulkWrites: any[] = [];

  for (const revision of revisions) {
    if (revision.birding?.new && revision.birding.new.trim()) {
      console.log(`Skipping ${revision.id} because it already has 'birding' content`);
      continue;
    }
    // @ts-ignore
    const birdingOld = [revision.tips?.old, revision.birds?.old, revision.hikes?.old].filter(Boolean).join("\n");
    // @ts-ignore
    const birdingNew = [revision.tips?.new, revision.birds?.new, revision.hikes?.new].filter(Boolean).join("\n");

    bulkWrites.push({
      updateOne: {
        filter: { _id: revision._id },
        update:
          birdingNew || birdingOld
            ? {
                $set: { birding: { old: birdingOld || "", new: birdingNew || "" } },
                $unset: { tips: "", birds: "", hikes: "" },
              }
            : { $unset: { tips: "", birds: "", hikes: "" } },
      },
    });

    if (LOG) {
      console.log("Updated", revision.id);
    }
  }

  await Revision.bulkWrite(bulkWrites);

  console.log("Done!");
  process.exit();
};

migrateSections();
