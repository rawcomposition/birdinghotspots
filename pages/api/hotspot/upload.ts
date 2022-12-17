import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Upload from "models/Upload";
import { Image } from "lib/types";
import admin from "lib/firebaseAdmin";
import { verifyRecaptcha } from "lib/helpers";
import { sendEmail } from "lib/email";
import Profile from "models/Profile";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const authToken = req.headers.authorization;
  await connect();
  const { locationId, name, email, images, token: recaptchaToken } = req.body;
  const hotspot = await Hotspot.findOne({ locationId });

  try {
    console.log("1");
    await admin.verifyIdToken(authToken || "");
    console.log("2");
    const formattedImages = images.map((it: Image) => ({
      ...it,
      isPublicDomain: true,
      by: name,
    }));
    let featuredImg = hotspot.featuredImg;
    if (!featuredImg?.smUrl) {
      featuredImg = formattedImages?.[0] || null;
    }
    console.log("3");
    // @ts-ignore
    await Hotspot.updateOne({ locationId }, { featuredImg, $push: { images: { $each: formattedImages } } });
    console.log("4");
    res.status(200).json({ success: true });
    return;
  } catch (error) {}

  try {
    console.log("5");
    const score = await verifyRecaptcha(recaptchaToken);
    console.log("Score:", score);
    if (score > 0.5) {
      await Promise.all(
        images.map(async (image: Image) => {
          await Upload.create({
            ...image,
            locationId,
            by: name,
            email,
            countryCode: hotspot.countryCode,
            stateCode: hotspot.stateCode,
            countyCode: hotspot.countyCode,
          });
        })
      );

      const profiles = await Profile.find({
        $or: [{ subscriptions: hotspot.stateCode }, { subscriptions: hotspot.countyCode }],
      });

      const emails = profiles.map((profile) => profile.email);

      if (process.env.NODE_ENV === "production" && emails.length > 0) {
        try {
          console.log("6");
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
      console.log("7");

      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: "You might be a robot" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
