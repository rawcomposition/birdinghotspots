import type { NextApiRequest, NextApiResponse } from "next";
import admin from "lib/firebaseAdmin";
import Profile from "models/Profile";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;

  const result = await admin.verifyIdToken(token || "");
  if (result.role !== "admin") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { data } = req.body;
  const uid = req.query.uid as string;

  try {
    await admin.updateUser(uid, {
      displayName: data.name,
      email: data.email,
    });
    await admin.setCustomUserClaims(uid, {
      role: data.role || "user",
      regions: data.role === "editor" ? data.regions || [] : null,
    });

    const profile = uid ? await Profile.findOne({ uid }) : null;
    const { subscriptions, email } = data;

    if (!profile) {
      await Profile.create({ uid, subscriptions, email });
    } else {
      await Profile.updateOne({ uid }, { subscriptions, email });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
}
