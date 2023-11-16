import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Species from "models/Species";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    if (process.env.NODE_ENV !== "development") throw new Error("Not in development mode");

    const taxonomyReq = await fetch("https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&cat=species");
    const taxonomy = await taxonomyReq.json();

    await connect();
    const species = await Species.find({}, ["_id"]).lean();
    const currentIds = species.map((s: any) => s._id);
    const taxonIds = taxonomy.map((t: any) => t.speciesCode);

    const bulkWrites: any = [];

    for (const taxon of taxonomy) {
      if (currentIds.includes(taxon.speciesCode)) {
        continue;
      }

      bulkWrites.push({
        insertOne: {
          document: {
            _id: taxon.speciesCode,
            name: taxon.comName,
            sciName: taxon.sciName,
            order: taxon.taxonOrder,
          },
        },
      });
    }

    for (const species of currentIds) {
      if (taxonIds.includes(species)) {
        continue;
      }

      bulkWrites.push({
        updateOne: {
          filter: { _id: species },
          update: { active: false },
        },
      });
    }

    await Species.bulkWrite(bulkWrites);

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
