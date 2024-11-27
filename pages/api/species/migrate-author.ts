import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";

const DRY_RUN = false;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const results = await Species.find({
    $and: [{ author: { $regex: " \\(" } }, { author: { $regex: "http" } }],
  }).lean();

  const bulkWrites: any[] = [];

  for (const species of results) {
    const author = species.author.split(" (")[0]?.trim();
    if (author) {
      bulkWrites.push({ updateOne: { filter: { _id: species._id }, update: { $set: { author } } } });
    }
    console.log(species._id, author);
  }

  if (DRY_RUN) {
    console.log("Total writes", bulkWrites.length);
  } else {
    await Species.bulkWrite(bulkWrites);
  }

  res.status(200).json({ success: true });
}
