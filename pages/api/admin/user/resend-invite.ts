import type { NextApiRequest, NextApiResponse } from "next";
import admin from "lib/firebaseAdmin";
import Profile from "models/Profile";
import { sendInviteEmail } from "lib/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;

  const result = await admin.verifyIdToken(token || "");

  if (result.role !== "admin") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { email } = req.body;

    const profile = await Profile.findOne({ email }).lean();
    const { name, inviteCode } = profile;

    try {
      await sendInviteEmail(name, email, inviteCode);
    } catch (error) {}

    res.status(200).json({ message: "Email resent successfully", success: true });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
}
