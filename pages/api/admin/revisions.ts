import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Revision from "models/Revision";
import admin from "lib/firebaseAdmin";
import { Revision as RevisionType } from "lib/types";
import { getStateByCode, getCountyByCode } from "lib/localData";
import diff from "node-htmldiff";
import { getSubscriptions } from "lib/mongo";
import nookies from "nookies";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const cookies = nookies.get({ req });
  const token = cookies.session;

  const result = await admin.verifySessionCookie(token || "");
  if (!["admin", "editor"].includes(result.role)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { search, status, skip }: any = req.body;
  const limit = status === "pending" ? undefined : 20;

  try {
    await connect();
    const subscriptions = await getSubscriptions(result.uid);

    let query: any = { status };

    if (result.role !== "admin") {
      let states = subscriptions.filter((it) => it.split("-").length === 2);
      const counties = subscriptions.filter((it) => it.split("-").length === 3);
      if (subscriptions.length === 0) {
        states = result.regions;
      }
      query = {
        ...query,
        $or: [{ stateCode: { $in: states || [] } }, { countyCode: { $in: counties || [] } }],
      };
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const [revisions, total] = await Promise.all([
      Revision.find(query)
        .sort({ createdAt: -1 })
        .limit(limit || 0)
        .skip(skip || 0)
        .lean(),
      Revision.countDocuments(query),
    ]);

    const formatDiff = (oldValue?: string, newValue?: string) => {
      if (!newValue) return null; //No edit made for this field
      if (oldValue === undefined) return newValue; //Legacy revision with no old value saved
      return {
        old: oldValue,
        new: newValue,
        diff: diff(oldValue, newValue),
      };
    };

    const results = revisions.map((it: RevisionType) => {
      const state = getStateByCode(it?.stateCode);
      const county = getCountyByCode(it.countyCode);
      const formatted = {
        ...it,
        hasMultiple: revisions.filter((rev: RevisionType) => rev.locationId === it.locationId).length > 1,
        stateLabel: state?.label || "",
        countyLabel: county?.name || "",
        countryCode: it.countryCode,
        about: formatDiff(it.about?.old, it.about?.new),
        tips: formatDiff(it.tips?.old, it.tips?.new),
        birds: formatDiff(it.birds?.old, it.birds?.new),
        hikes: formatDiff(it.hikes?.old, it.hikes?.new),
      };
      return formatted;
    });

    res.status(200).json({ success: true, results, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
