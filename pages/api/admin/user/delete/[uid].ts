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

  const { uid }: any = req.query;
  try {
    await admin.deleteUser(uid);
    await Profile.deleteOne({ uid });
    res.status(200).json({ message: "User deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
}
