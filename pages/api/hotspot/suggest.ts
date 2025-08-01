import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Revision from "models/Revision";
import { verifyRecaptcha } from "lib/helpers";
import { sendEmail } from "lib/email";
import Profile from "models/Profile";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  await connect();
  const {
    name,
    email,
    plan,
    birding,
    about,
    accessible,
    restrooms,
    roadside,
    fee,
    notes,
    locationId,
    token: recaptchaToken,
  } = req.body;
  const hotspot = await Hotspot.findOne({ locationId });

  if (!hotspot) {
    res.status(404).json({ error: "Hotspot not found" });
    return;
  }

  const profiles = await Profile.find({
    $or: [{ subscriptions: hotspot.stateCode }, { subscriptions: hotspot.countyCode }],
    emailFrequency: "instant",
  });

  const emails = profiles.map((profile) => profile.email);

  const formatValue = (oldValue: string, newValue: string) => {
    const old = oldValue || "";
    if (old === newValue) return undefined;
    return {
      old,
      new: newValue.trim().replaceAll(".&nbsp; ", ". "),
    };
  };

  try {
    const score = await verifyRecaptcha(recaptchaToken);
    console.log("Score:", score);
    if (score > 0.4) {
      await Revision.create({
        locationId,
        name: hotspot.name,
        by: name,
        email,
        countryCode: hotspot.countryCode,
        stateCode: hotspot.stateCode,
        countyCode: hotspot.countyCode,
        plan: formatValue(hotspot.plan || "", plan),
        birding: formatValue(hotspot.birding || "", birding),
        about: formatValue(hotspot.about || "", about),
        notes,
        roadside: formatValue(hotspot.roadside || "", roadside),
        restrooms: formatValue(hotspot.restrooms || "", restrooms),
        accessible: formatValue(hotspot.accessible || "", accessible),
        fee: formatValue(hotspot.fee || "", fee),
      });

      const additionalNotes = notes ? `<br /><br /><strong>Additional notes to editor</strong><br />${notes}` : "";

      if (process.env.NODE_ENV === "production" && emails.length > 0) {
        try {
          await sendEmail({
            to: emails.join(", "),
            subject: `Suggested edit submitted by ${name} (Review required)`,
            html: `${name} submitted suggested edits for <a href="https://birdinghotspots.org${hotspot.url}" target="_blank">${hotspot.name}</a><br /><br /><a href="https://birdinghotspots.org/admin/revision-review">Review Edits</a>${additionalNotes}<br /><br />Reply to this email to contact ${name} directly.<br />Email: ${email}`,
            replyTo: email,
          });
        } catch (error) {}
      }

      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: "reCAPTCHA Failed" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
