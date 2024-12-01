import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import { getSourceInfo } from "lib/species";

const DRY_RUN = false;
const LIMIT = 10000;
const REQUESTS_PER_MINUTE = 50;
const DELAY = 60000 / REQUESTS_PER_MINUTE;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const results = await Species.find({ source: "inat", iNatUserId: { $exists: false } })
    .sort({ order: 1 })
    .limit(LIMIT)
    .lean();

  for (const species of results) {
    const startTime = Date.now();
    try {
      const info = await getSourceInfo(species.source, species.sourceId, species.iNatObsId);

      if (!info) {
        console.log("NO INFO", species._id);
        continue;
      }
      const { author, license, iNatUserId, speciesName } = info;
      if (speciesName !== species.sciName) {
        console.log("NAME MISMATCH", species._id, species.sciName, "->", speciesName);
        continue;
      }
      if (author !== species.author) {
        console.log("Author update", species._id, species.author, "->", author);
      }
      if (license !== species.license) {
        console.log("License update", species._id, species.license, "->", license);
      }
      await Species.updateOne({ _id: species._id }, { $set: { author, license, iNatUserId } });

      const elapsedTime = Date.now() - startTime;
      const remainingDelay = DELAY - elapsedTime;
      if (remainingDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingDelay)); // Throttle requests
      }
    } catch (e) {
      console.log("ERROR", species._id, e);
      continue;
    }
  }

  if (DRY_RUN) {
    console.log("DONE");
  } else {
    console.log("DONE");
  }

  res.status(200).json({ success: true });
}
