import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Profile from "models/Profile";
import admin from "lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;
  let uid = null;
  try {
    const result = await admin.verifyIdToken(token || "");
    uid = result.uid;
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await connect();
    const profile = uid ? await Profile.findOne({ uid }) : null;
    const { subscriptions, email, name, password, emailFrequency } = req.body;

    await admin.updateUser(uid, password ? { password, email, displayName: name } : { email, displayName: name });

    if (!profile) {
      await Profile.create({ uid, subscriptions, email, name, emailFrequency });
    } else {
      await Profile.updateOne({ uid }, { subscriptions, email, name, emailFrequency });
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
