import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import { getSourceInfo } from "lib/species";

const DRY_RUN = true;
const LIMIT = 10;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const results = await Species.find({ source: "inat" }).sort({ order: 1 }).limit(LIMIT).lean();

  const bulkWrites: any[] = [];

  for (const species of results) {
    const info = await getSourceInfo(species.source, species.sourceId, species.iNatObsId);
    if (!info) {
      console.log("NO INFO", species._id);
      continue;
    }
    const { author, license, iNatUserId, speciesName } = info;
    if (speciesName !== species.sciName) {
      console.log("NAME MISMATCH", species._id);
      continue;
    }
    if (author !== species.author) {
      console.log("Author update", species.author, "->", author);
    }
    if (license !== species.license) {
      console.log("License update", species.license, "->", license);
    }
    bulkWrites.push({ updateOne: { filter: { _id: species._id }, update: { $set: { author, license, iNatUserId } } } });
  }

  if (DRY_RUN) {
    console.log("Total writes", bulkWrites.length);
  } else {
    await Species.bulkWrite(bulkWrites);
    console.log("Total writes", bulkWrites.length);
  }

  res.status(200).json({ success: true });
}
