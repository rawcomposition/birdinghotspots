import type { NextApiRequest, NextApiResponse } from "next";
import admin from "lib/firebaseAdmin";
import Profile from "models/Profile";
import { v4 as uuidv4 } from "uuid";
import { sendInviteEmail } from "lib/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;

  const result = await admin.verifyIdToken(token || "");

  if (result.role !== "admin") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { name, email, regions } = req.body;

    const inviteCode = uuidv4();

    const user = await admin.createUser({
      email,
      displayName: name,
    });

    await Profile.create({
      uid: user.uid,
      email,
      name,
      subscriptions: regions,
      inviteCode,
    });

    await admin.setCustomUserClaims(user?.uid, {
      role: "editor",
      regions,
    });

    try {
      await sendInviteEmail(name, email, inviteCode);
    } catch (error) {}

    try {
      await res.revalidate("/about");
    } catch (err) {}

    res.status(200).json({ message: "User invited successfully", success: true });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
}
