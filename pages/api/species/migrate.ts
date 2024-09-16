import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const unsetCodes: string[] = [
    "mcclon",
    "chbbun1",
    "ortbun1",
    "ccbfin",
    "purspi",
    "batoro1",
    "resbla1",
    "colwar",
    "conwar",
    "rehtan2",
    "lestan",
    "rabgro1",
    "fustan1",
    "whbdac1",
    "whbdac1",
    "grehon1",
    "whcsee1",
    "shbgrf3",
  ];

  await Species.updateMany({ _id: { $in: unsetCodes } }, { $unset: { source: "", sourceId: "", hasImg: "" } });

  res.status(200).json({ success: true });
}
