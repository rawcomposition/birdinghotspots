import type { NextApiRequest, NextApiResponse } from "next";
import admin from "lib/firebaseAdmin";
import Profile from "models/Profile";
import connect from "lib/mongo";
import { sendResetEmail } from "lib/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { email } = req.body;

    await connect();

    const profile = await Profile.findOne({ email });

    if (!profile) {
      res.status(400).json({ error: "No account found", success: false });
      return;
    }

    const url = await admin.generatePasswordResetLink(email, {
      url: `${process.env.NEXT_PUBLIC_DOMAIN}/login`,
    });

    await sendResetEmail(profile.name, email, url);

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
