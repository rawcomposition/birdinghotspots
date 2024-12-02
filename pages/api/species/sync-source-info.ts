import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import { getSourceInfo } from "lib/species";

const DRY_RUN = false;
const OFFSET = 25;
const LIMIT = 1000;
const DELAY = 2000;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const results = await Species.find({ source: "inat", iNatUserId: { $exists: false } })
    .sort({ order: 1 })
    .skip(OFFSET)
    .limit(LIMIT)
    .lean();

  for (const species of results) {
    await new Promise((resolve) => setTimeout(resolve, DELAY)); // Throttle requests
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
  }

  if (DRY_RUN) {
    console.log("DONE");
  } else {
    console.log("DONE");
  }

  res.status(200).json({ success: true });
}
