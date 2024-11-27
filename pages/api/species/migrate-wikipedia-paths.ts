import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";

const LIMIT = 9000;
const DRY_RUN = false;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const results = await Species.find({
    source: "wikipedia",
  })
    .limit(LIMIT)
    .lean();

  const bulkWrites: any[] = [];

  for (const species of results) {
    const fileName = (species.sourceId as string).split("/320px").shift();
    if (!fileName) throw new Error("Invalid sourceId");
    bulkWrites.push({
      updateOne: {
        filter: { _id: species._id },
        update: {
          $set: { sourceId: fileName },
        },
      },
    });
  }

  if (DRY_RUN) {
    console.log(JSON.stringify(bulkWrites, null, 2));
  } else {
    await Species.bulkWrite(bulkWrites);
  }

  res.status(200).json({ success: true });
}
