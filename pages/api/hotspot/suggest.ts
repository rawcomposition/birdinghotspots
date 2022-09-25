import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Revision from "models/Revision";
import { verifyRecaptcha } from "lib/helpers";
import { sendEmail } from "lib/email";
import Profile from "models/Profile";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  await connect();
  const { name, email, about, tips, birds, hikes, notes, locationId, token: recaptchaToken } = req.body;
  const hotspot = await Hotspot.findOne({ locationId });

  const profiles = await Profile.find({
    $or: [{ subscriptions: hotspot.stateCode }, { subscriptions: hotspot.countyCode }],
  });

  const emails = profiles.map((profile) => profile.email);

  try {
    const score = await verifyRecaptcha(recaptchaToken);
    console.log("Score:", score);
    if (score > 0.5) {
      await Revision.create({
        locationId,
        by: name,
        email,
        countryCode: hotspot.countryCode,
        stateCode: hotspot.stateCode,
        countyCode: hotspot.countyCode,
        about,
        tips,
        birds,
        hikes,
        notes,
      });

      if (process.env.NODE_ENV === "production" && emails.length > 0) {
        try {
          await sendEmail({
            to: emails.join(", "),
            subject: `Suggested edit submitted by ${name} (Review required)`,
            html: `${name} submitted suggested edits for <a href="https://birdinghotspots.org${hotspot.url}" target="_blank">${hotspot.name}</a><br /><br /><a href="https://birdinghotspots.org/admin/revision-review">Review Edits</a><br /><br />Reply to this email to contact ${name} directly.<br />Email: ${email}`,
            replyTo: email,
          });
        } catch (error) {}
      }

      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: "You might be a robot" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
