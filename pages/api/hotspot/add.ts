import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import admin from "lib/firebaseAdmin";
import Hotspot from "models/Hotspot";
import Group from "models/Group";
import { generateRandomId } from "lib/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;
  const { data } = req.body;

  const result = await admin.verifyIdToken(token || "");
  if (result.role !== "admin" && !result.regions?.includes(data?.stateCode)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await connect();
    const locationId = data.locationId || `G${generateRandomId()}`;
    const url = `/hotspot/${locationId}`;

    let location = null;
    if (data.lat && data.lng) {
      location = {
        type: "Point",
        coordinates: [data.lng, data.lat],
      };
    }

    const groups = data?.groups ? await Group.find({ _id: { $in: data.groups } }) : null;
    const hasGroupAbout = groups?.some((group) => group?.about);
    const noContent = !data?.about && !data?.tips && !data?.birds && !data?.hikes && !hasGroupAbout;

    const featuredImg = data?.images?.filter((it: any) => !it.isMap)?.[0] || null;

    await Hotspot.create({ ...data, locationId, url, location, featuredImg, noContent });
    res.status(200).json({ success: true, url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
