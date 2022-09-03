import type { NextApiRequest, NextApiResponse } from "next";
import admin from "lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;

  try {
    await admin.verifyIdToken(token || "");
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { name, email, regions } = req.body;
    const user = await admin.createUser({
      email,
      displayName: name,
    });

    await admin.setCustomUserClaims(user?.uid, {
      role: "editor",
      regions,
    });
    res.status(200).json({ message: "User added successfully", success: true });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
}
