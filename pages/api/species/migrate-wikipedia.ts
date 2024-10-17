import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import { fetchWikipediaMetadata } from "./get-source-info";

const LIMIT = 200;
const DRY_RUN = true;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const results = await Species.find({
    source: "wikipedia",
    $or: [{ license: null }, { author: null }],
  })
    .limit(LIMIT)
    .lean();

  const bulkWrites: any[] = [];

  for (const species of results) {
    const fileName = (species.sourceId as string).split("px-").pop();
    if (!fileName) throw new Error("Invalid sourceId");
    try {
      const { author, license } = await fetchWikipediaMetadata(fileName);
      if ((!author && license !== "pd") || !license) {
        throw new Error();
      }
      bulkWrites.push({
        updateOne: {
          filter: { _id: species._id },
          update: {
            $set: { author: author || "Unknown", license: license === "pd" ? "cc0" : license, isMigrated: true },
          },
        },
      });
    } catch (error) {
      console.error("----No metadata found for", fileName);
    }
  }

  if (DRY_RUN) {
    console.log(JSON.stringify(bulkWrites, null, 2));
  } else {
    await Species.bulkWrite(bulkWrites);
  }

  res.status(200).json({ success: true });
}
