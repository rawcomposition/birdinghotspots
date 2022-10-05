import type { NextApiRequest, NextApiResponse } from "next";
import { verifyRecaptcha } from "lib/helpers";
import { sendEmail } from "lib/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { name, email, message, token } = req.body;

    const score = await verifyRecaptcha(token);

    if (score > 0.5) {
      await sendEmail({
        to: process.env.ADMIN_EMAILS || "",
        subject: `New Message from ${name}`,
        html: `${message} <br /><br /> Email: ${email}`,
        replyTo: email,
      });
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: "Recaptcha failed" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
