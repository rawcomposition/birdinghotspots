import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Drive from "models/Drive";
import Hotspot from "models/Hotspot";
import admin from "lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;
  const { id }: any = req.query;

  await connect();
  const drive = await Drive.findById(id);

  const result = await admin.verifyIdToken(token || "");
  if (result.role !== "admin" && !result.regions?.includes(drive?.stateCode)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await connect();
    await Drive.deleteOne({ _id: id });
    await Hotspot.updateMany(
      { drives: { $elemMatch: { driveId: id } } },
      // @ts-ignore
      { $pull: { drives: { driveId: id } } }
    );
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
