import type { NextApiRequest, NextApiResponse } from "next";
import admin from "lib/firebaseAdmin";
import aws from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import Hotspot from "models/Hotspot";
import connect from "lib/mongo";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;
  aws.config.update({
    accessKeyId: process.env.WASABI_KEY,
    secretAccessKey: process.env.WASABI_SECRET,
    region: "us-east-1",
    signatureVersion: "v4",
  });
  const endpoint = new aws.Endpoint("s3.wasabisys.com");
  const s3 = new aws.S3({ endpoint });

  try {
    await admin.verifyIdToken(token || "");
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const uploadUrlToS3 = async (url: string, key: string) => {
    const response = await s3
      .putObject({
        Bucket: "birdinghotspots",
        Key: key,
        ACL: "public-read",
        //@ts-ignore
        Body: await fetch(url).then((res) => res.buffer()),
      })
      .promise();

    return response;
  };

  const { lat, lng, heading, fov, pitch, locationId }: any = req.body;
  const adjustedFov = parseInt(fov) + 20; //The static API has a max of 120 versus 100 for the embed API

  const smGoogleUrl = `https://maps.googleapis.com/maps/api/streetview?size=640x413&location=${lat},${lng}&fov=${adjustedFov}&heading=${heading}&pitch=${pitch}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;
  const smFilename = `streetview${uuidv4()}_small.jpg`;

  try {
    await uploadUrlToS3(smGoogleUrl, smFilename);
    const smUrl = `https://s3.us-east-1.wasabisys.com/birdinghotspots/${smFilename}`;

    const imgObject = {
      smUrl,
      by: "© Google Street View",
      caption: "",
      width: 640,
      height: 413,
      isStreetview: true,
      isNew: true,
      isMap: false,
      streetviewData: { lat, lng, fov, heading, pitch },
    };

    if (locationId) {
      await connect();
      const hotspot = await Hotspot.findOne({ locationId });
      if (!hotspot) throw new Error("Hotspot not found");
      const hasFeaturedImg = !!hotspot.featuredImg?.smUrl;
      await Hotspot.updateOne(
        { locationId },
        hasFeaturedImg ? { $push: { images: imgObject } } : { featuredImg: imgObject, $push: { images: imgObject } }
      );
    }

    res.status(200).json({ success: true, imgObject });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}
