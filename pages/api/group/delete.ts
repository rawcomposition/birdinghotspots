import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Group from "models/Group";
import admin from "lib/firebaseAdmin";
import Logs from "models/Log";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;
  const { id }: any = req.query;

  await connect();
  const group = await Group.findById(id);

  const result = await admin.verifyIdToken(token || "");
  const canEdit =
    result.role === "admin" || group?.stateCodes?.filter((it: string) => result.regions?.includes(it)).length > 0;
  if (!canEdit) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await Group.deleteOne({ _id: id });
    await Hotspot.updateMany({ groups: id }, { $pull: { groups: id } });

    try {
      await Logs.create({
        user: result.name,
        uid: result.uid,
        type: "delete_group",
        message: `deleted group: ${group.name}`,
        hotspotId: group.locationId,
      });
    } catch (error) {}

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
