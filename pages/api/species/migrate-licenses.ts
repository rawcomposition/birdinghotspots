import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";

const LIMIT = 20000;
const DRY_RUN = false;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const results = await Species.find({
    source: "wikipedia",
    license: { $exists: true },
  })
    .limit(LIMIT)
    .lean();

  const bulkWrites: any[] = [];

  for (const species of results) {
    const license = species.license as any;
    let newLicense = license;
    let version = null;

    if (license === "pd") {
      newLicense = "cc0";
    } else if (
      license === "cc-by-sa-2.0" ||
      license === "cc-by-sa-3.0" ||
      license === "cc-by-sa-4.0" ||
      license === "cc-by-sa-2.5" ||
      license === "cc-by-sa-3.0-de" ||
      license === "cc-by-sa-2.5-in" ||
      license === "cc-by-sa-2.5-br" ||
      license === "cc-by-sa-1.0" ||
      license === "cc-by-sa-3.0-nz" ||
      license === "cc-by-sa-2.0-de" ||
      license === "cc-by-sa-2.5-au" ||
      license === "cc-by-sa-2.5-se" ||
      license === "cc-by-sa-3.0-au"
    ) {
      newLicense = "cc-by-sa";
      version = license.replace("cc-by-sa-", "");
    } else if (
      license === "cc-by-2.0" ||
      license === "cc-by-3.0" ||
      license === "cc-by-2.5" ||
      license === "cc-by-4.0" ||
      license === "cc-by-3.0-us" ||
      license === "cc-by-1.0" ||
      license === "cc-by-2.0-de" ||
      license === "cc-by-3.0-de"
    ) {
      newLicense = "cc-by";
      version = license.replace("cc-by-", "");
    } else if (license === "cc-sa-1.0") {
      newLicense = "cc-sa";
      version = license.replace("cc-sa-", "");
    }

    if (newLicense !== license) {
      bulkWrites.push({
        updateOne: { filter: { _id: species._id }, update: { $set: { license: newLicense, licenseVer: version } } },
      });
    }
  }

  if (DRY_RUN) {
    console.log(JSON.stringify(bulkWrites, null, 2));
  } else {
    await Species.bulkWrite(bulkWrites);
  }

  res.status(200).json({ success: true });
}
