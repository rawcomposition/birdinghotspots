import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Drive from "models/Drive";
import Group from "models/Group";
import admin from "lib/firebaseAdmin";
import Logs from "models/Log";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;
  const { id }: any = req.query;

  await connect();
  const hotspot = await Hotspot.findById(id);

  const result = await admin.verifyIdToken(token || "");
  if (result.role !== "admin" && !result.regions?.includes(hotspot?.stateCode)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await Hotspot.deleteOne({ _id: id });
    // @ts-ignore
    await Drive.updateMany({ entries: { $elemMatch: { hotspot: id } } }, { $pull: { entries: { hotspot: id } } });
    await Group.updateMany({ hotspots: id }, { $pull: { hotspots: id } });

    try {
      await Logs.create({
        user: result.displayName,
        uid: result.uid,
        type: "delete_hotspot",
        message: `deleted hotspot: ${hotspot.name}`,
        hotspotId: hotspot.locationId,
      });
    } catch (error) {}

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
