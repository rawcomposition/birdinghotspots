import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Revision from "models/Revision";
import admin from "lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;
  const { id }: any = req.query;

  await connect();
  const revision = await Revision.findById(id);

  const result = await admin.verifyIdToken(token || "");
  if (result.role !== "admin" && !result.regions?.includes(revision?.stateCode)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await Revision.updateOne({ _id: id }, { status: "rejected" });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}