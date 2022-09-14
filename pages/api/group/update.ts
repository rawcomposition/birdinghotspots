import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import admin from "lib/firebaseAdmin";
import Group from "models/Group";
import Hotspot from "models/Hotspot";
import { generateRandomId } from "lib/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;
  const { id, data } = req.body;

  const hotspots = await Hotspot.find({ _id: { $in: data.hotspots } }, ["-_id", "stateCode", "countyCode"]);
  const allStateCodes: string[] = hotspots.map((hotspot: any) => hotspot.stateCode);
  const stateCodes = [...new Set(allStateCodes)];
  const countyCodes: string[] = [];

  hotspots.forEach((hotspot: any) => {
    if (hotspot.countyCode && !countyCodes.includes(hotspot.countyCode)) {
      countyCodes.push(hotspot.countyCode);
    }
  });

  const result = await admin.verifyIdToken(token || "");
  const canEdit =
    result.role === "admin" || data?.stateCodes?.filter((it: string) => result.regions?.includes(it)).length > 0;
  if (!canEdit) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await connect();
    console.log("One");
    const oldGroup = await Group.findById(id);
    const oldIds = oldGroup?.hotspots?.map((it: any) => it.toString()) || [];
    const newIds = data.hotspots || [];
    const toRemove = oldIds.filter((it: string) => !newIds.includes(it));

    console.log("Two");
    await Group.replaceOne({ _id: id }, { ...data, stateCodes, countyCodes });
    console.log("Three");
    console.log("Hotspot IDs", data?.hotspots);
    await Hotspot.updateMany({ _id: { $in: data?.hotspots } }, { $addToSet: { groups: id } });
    console.log("To remove", toRemove);
    await Hotspot.updateMany({ _id: { $in: toRemove } }, { $pull: { groups: id } });
    console.log("Done");

    res.status(200).json({ success: true, url: data.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
