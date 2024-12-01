import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import { getSourceInfo } from "lib/species";

const DRY_RUN = true;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const results = await Species.find({}).sort({ order: 1 }).lean();

  const bulkWrites: any[] = [];

  for (const species of results) {
    const info = await getSourceInfo(species.source, species.sourceId, species.iNatObsId);
  }

  if (DRY_RUN) {
    console.log("Total writes", bulkWrites.length);
  } else {
    await Species.bulkWrite(bulkWrites);
  }

  res.status(200).json({ success: true });
}
