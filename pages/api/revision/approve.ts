import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Revision from "models/Revision";
import Hotspot from "models/Hotspot";
import admin from "lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;
  const { id }: any = req.query;

  await connect();
  const result = await admin.verifyIdToken(token || "");
  if (!["admin", "editor"].includes(result.role)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const revision = await Revision.findOne({ _id: id });
    const hotspot = await Hotspot.findOne({ locationId: revision.locationId });
    if (!hotspot) {
      res.status(500).json({ error: "Hotspot not found" });
      return;
    }

    await Hotspot.updateOne(
      { locationId: revision.locationId },
      {
        $set: {
          about: revision.about,
          tips: revision.tips,
          birds: revision.birds,
          hikes: revision.hikes,
        },
      }
    );
    await Revision.updateOne({ _id: id }, { status: "approved" });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
