import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import admin from "lib/firebaseAdmin";
import RegionInfo from "models/RegionInfo";
import { getStateByCode } from "lib/localData";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;
  const { data, code } = req.body;

  const result = await admin.verifyIdToken(token || "");
  if (result.role !== "admin" && !result.regions?.includes(code)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const state = getStateByCode(code);

    if (!state) {
      throw new Error("Invalid state code");
    }

    await connect();
    const current = await RegionInfo.findOne({ code });
    if (current) {
      await RegionInfo.updateOne({ code }, { $set: data });
    } else {
      await RegionInfo.create({ ...data, code });
    }

    await res.revalidate(`/${state.country.toLowerCase()}/${state.slug}`);

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
