import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import fs from "fs";
import path from "path";

const VERSION = 2024;
const DRY_RUN = true;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const taxonomyRes = await fetch(
    `https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&version=${VERSION}&cat=species`
  );
  const taxonomy = await taxonomyRes.json();

  const species = await Species.find({}).lean();

  const families: {
    code: string;
    name: string;
    count: number;
  }[] = [];

  const bulkwrites: any[] = [];
  const versionSpecies: string[] = [];
  let insertCount = 0;
  let updateCount = 0;
  let unchangedCount = 0;

  for (const item of taxonomy) {
    versionSpecies.push(item.speciesCode);
    if (!families.find((f) => f.code === item.familyCode)) {
      families.push({ code: item.familyCode, name: item.familyComName, count: 1 });
    } else {
      families.find((f) => f.code === item.familyCode)!.count++;
    }
    const speciesItem = species.find((s) => s._id === item.speciesCode);
    if (speciesItem) {
      const needsUpdate =
        speciesItem.familyCode !== item.familyCode ||
        speciesItem.name !== item.comName ||
        speciesItem.sciName !== item.sciName ||
        speciesItem.order !== item.taxonOrder ||
        !speciesItem.taxonVersions?.includes(VERSION.toString());

      if (needsUpdate) {
        bulkwrites.push({
          updateOne: {
            filter: { _id: item.speciesCode },
            update: {
              $set: { familyCode: item.familyCode, name: item.comName, sciName: item.sciName, order: item.taxonOrder },
              $addToSet: { taxonVersions: VERSION.toString() },
            },
          },
        });
        updateCount++;
      } else {
        unchangedCount++;
      }
    } else {
      bulkwrites.push({
        insertOne: {
          document: {
            _id: item.speciesCode,
            familyCode: item.familyCode,
            name: item.comName,
            sciName: item.sciName,
            order: item.taxonOrder,
            taxonVersions: [VERSION.toString()],
          },
        },
      });
      insertCount++;
    }
  }

  const inactiveSpeciesCodes = species.filter((s) => !versionSpecies.includes(s._id)).map((s) => s._id);

  if (!DRY_RUN) {
    await Species.bulkWrite(bulkwrites);
    await Species.updateMany({ _id: { $in: inactiveSpeciesCodes } }, { $set: { active: false } });
    const filePath = path.join(process.cwd(), "data", "taxon-families.json");
    fs.writeFileSync(filePath, JSON.stringify(families, null, 2));
  }

  if (DRY_RUN) {
    console.log("DRY RUN");
  }

  console.log("Inserted", insertCount);
  console.log("Updated", updateCount);
  console.log("Inactivated", inactiveSpeciesCodes.length);
  console.log("Unchanged", unchangedCount);
  console.log("Families", families.length);

  res
    .status(200)
    .json({ success: true, insertCount, updateCount, inactiveCount: inactiveSpeciesCodes.length, unchangedCount });
}
