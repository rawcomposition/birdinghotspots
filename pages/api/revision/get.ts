import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Revision from "models/Revision";
import Hotspot from "models/Hotspot";
import admin from "lib/firebaseAdmin";
import { getStateByCode, getCountyByCode } from "lib/localData";
import diff from "node-htmldiff";

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
    const revision = await Revision.findById(id).lean();
    const isPending = revision?.status === "pending";
    const hotspot = await Hotspot.findOne({ locationId: revision?.locationId });
    const state = getStateByCode(hotspot?.stateCode);
    const county = getCountyByCode(hotspot.countyCode);
    const data = {
      ...revision,
      stateLabel: state?.label || "",
      countyLabel: county?.name || "",
      countryCode: hotspot.countryCode,
      name: hotspot.name,
      about: isPending ? diff(hotspot.about || "", revision.about || "") : revision.about,
      tips: isPending ? diff(hotspot.tips || "", revision.tips || "") : revision.tips,
      birds: isPending ? diff(hotspot.birds || "", revision.birds || "") : revision.birds,
      hikes: isPending ? diff(hotspot.hikes || "", revision.hikes || "") : revision.hikes,
      restroomsBefore: hotspot.restrooms || "",
      accessibleBefore: hotspot.accessible || "",
      roadsideBefore: hotspot.roadside || "",
      feeBefore: hotspot.fee || "",
      restrooms: revision.restrooms || "",
      accessible: revision.accessible || "",
      roadside: revision.roadside || "",
      fee: revision.fee || "",
    };

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
