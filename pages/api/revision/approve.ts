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
    if (!revision) {
      res.status(500).json({ error: "suggestion not found" });
      return;
    }

    const hotspot = await Hotspot.findOne({ locationId: revision.locationId });
    if (!hotspot) {
      res.status(500).json({ error: "Hotspot not found" });
      return;
    }

    const about = revision.about?.new || hotspot.about;
    const tips = revision.tips?.new || hotspot.tips;
    const birds = revision.birds?.new || hotspot.birds;
    const hikes = revision.hikes?.new || hotspot.hikes;
    const roadside = revision.roadside?.new || hotspot.roadside;
    const restrooms = revision.restrooms?.new || hotspot.restrooms;
    const accessible = revision.accessible?.new || hotspot.accessible;
    const fee = revision.fee?.new || hotspot.fee;

    const noContent = !about && !tips && !birds && !hikes;

    await Hotspot.updateOne(
      { locationId: revision.locationId },
      {
        $set: {
          noContent,
          about,
          tips,
          birds,
          hikes,
          roadside,
          restrooms,
          accessible,
          fee,
        },
      }
    );
    await Revision.updateOne({ _id: id }, { status: "approved" });

    if (!hotspot.citations.find(({ label }: any) => label.trim().toLowerCase() === revision.by.trim().toLowerCase())) {
      hotspot.citations.push({ label: revision.by });
      await hotspot.save();
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
