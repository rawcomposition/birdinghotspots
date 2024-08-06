import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import PhotoBatch from "models/PhotoBatch";
import { Image } from "lib/types";
import { verifyRecaptcha } from "lib/helpers";
import { sendEmail } from "lib/email";
import Profile from "models/Profile";
import { canEdit } from "lib/helpers";
import admin from "lib/firebaseAdmin";
import nookies from "nookies";
import type { Token } from "lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const cookies = nookies.get({ req });
  const token = cookies.session;

  let session: Token | null = null;
  try {
    session = await admin.verifySessionCookie(token || "");
  } catch (error) {}

  try {
    await connect();
    const { locationId, name, email, images, token: recaptchaToken } = req.body;
    if (!images.length) throw new Error("No images selected");
    const hotspot = await Hotspot.findOne({ locationId });

    if (!hotspot) throw new Error("Hotspot not found");
    const hasEditPermission = session ? canEdit(session, hotspot.stateCode || hotspot.countryCode) : false;

    // Logged in
    if (hasEditPermission) {
      const formattedImages = images.map((it: Image) => ({
        ...it,
        isPublicDomain: true,
        by: name,
        email,
        uid: session?.uid,
      }));
      let featuredImg = hotspot.featuredImg;
      if (!featuredImg?.smUrl) {
        featuredImg = formattedImages?.[0] || null;
      }
      await Hotspot.updateOne({ locationId }, { featuredImg, $push: { images: { $each: formattedImages } } });
      res.status(200).json({ success: true });
    } else {
      // Logged out
      const score = await verifyRecaptcha(recaptchaToken);
      console.log("Score:", score);
      if (score > 0.4) {
        await PhotoBatch.create({
          locationId,
          name: hotspot.name,
          by: name,
          email,
          uid: session?.uid,
          images,
          countryCode: hotspot.countryCode,
          stateCode: hotspot.stateCode,
          countyCode: hotspot.countyCode,
        });

        const profiles = await Profile.find({
          $or: [{ subscriptions: hotspot.stateCode }, { subscriptions: hotspot.countyCode }],
          emailFrequency: "instant",
        });

        const emails = profiles.map((profile) => profile.email);

        if (process.env.NODE_ENV === "production" && emails.length > 0) {
          try {
            await sendEmail({
              to: emails.join(", "),
              subject: `${images.length} ${
                images.length === 1 ? "photo" : "photos"
              } uploaded by ${name} (Review required)`,
              html: `${name} uploaded ${images.length} ${
                images.length === 1 ? "photo" : "photos"
              } to <a href="https://birdinghotspots.org${hotspot.url}" target="_blank">${
                hotspot.name
              }</a><br /><br /><a href="https://birdinghotspots.org/admin/image-review">Review Images</a><br /><br />Reply to this email to contact ${name} directly.<br />Email: ${email}`,
              replyTo: email,
            });
          } catch (error) {}
        }

        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ error: "You might be a robot" });
      }
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
