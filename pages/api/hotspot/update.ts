import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Group from "models/Group";
import admin from "lib/firebaseAdmin";
import Logs from "models/Log";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;
  const { id, data } = req.body;

  const result = await admin.verifyIdToken(token || "");
  if (result.role !== "admin" && !result.regions?.includes(data?.stateCode)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await connect();
    const url = `/hotspot/${data.locationId}`;

    let location = null;
    if (data.lat && data.lng) {
      location = {
        type: "Point",
        coordinates: [data.lng, data.lat],
      };
    }

    const featuredImg = data?.images?.filter((it: any) => !it.isMap)?.[0] || null;
    const noContent = !data?.about && !data?.tips && !data?.birds && !data?.hikes;
    await Hotspot.updateOne({ _id: id }, { ...data, url, location, featuredImg, noContent });

    try {
      await Logs.create({
        user: result.name,
        uid: result.uid,
        type: "edit_hotspot",
        message: `edited hotspot: ${data.name}`,
        hotspotId: data.locationId,
      });
    } catch (error) {}

    res.status(200).json({ success: true, url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
