import type { NextApiRequest, NextApiResponse } from "next";
import admin from "lib/firebaseAdmin";
import Profile from "models/Profile";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { password, inviteCode } = req.body;
    const profile = await Profile.findOne({ inviteCode });

    if (!profile) {
      res.status(401).json({ message: "Invalid invite code" });
      return;
    }

    const user = await admin.getUserByEmail(profile.email);

    await admin.updateUser(user.uid, { password });
    await Profile.updateOne({ inviteCode }, { inviteCode: null });

    res.status(200).json({ success: true });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
}
