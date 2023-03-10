import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Species from "models/Species";
import AbaSpecies from "data/aba-species-8-11.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { key }: any = req.query;
  if (process.env.CRON_KEY && key !== process.env.CRON_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const taxonomyReq = await fetch("https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json");
    const taxonomy = await taxonomyReq.json();

    await connect();
    const species = await Species.find({}, ["_id"]).lean();
    const currentSpecies = species.map((s: any) => s.name.toLowerCase());

    const inserts: any = [];

    for (const species of AbaSpecies) {
      const taxon = taxonomy.find((t: any) => t.comName.toLowerCase() === species.toLowerCase());
      if (!taxon) {
        console.log("Missing taxon", species);
        continue;
      }
      if (!currentSpecies.includes(species.toLowerCase()) && taxon?.category === "species") {
        inserts.push({
          _id: taxon.speciesCode,
          name: taxon.comName,
          sciName: taxon.sciName,
          order: taxon.taxonOrder,
        });
      }
    }

    await Species.insertMany(inserts);

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
