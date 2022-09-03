import type { NextApiRequest, NextApiResponse } from "next";
import admin from "lib/firebaseAdmin";
import nookies from "nookies";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization as string;

  const result = await admin.verifyIdToken(token || "");
  if (!token || !result.uid) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const expiresIn = 60 * 60 * 24 * 14 * 1000; //2 weeks
    const sessionCookie = await admin.createSessionCookie(token, { expiresIn });
    const options = { maxAge: expiresIn, httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/" };

    nookies.set({ res }, "session", sessionCookie, options);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(401).json({ message: "Unable to initialize session" });
  }
}
