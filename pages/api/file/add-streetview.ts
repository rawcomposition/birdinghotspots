import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import Hotspot from "models/Hotspot";
import connect from "lib/mongo";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.WASABI_KEY || "",
      secretAccessKey: process.env.WASABI_SECRET || "",
    },
    region: "us-east-1",
    endpoint: "https://s3.wasabisys.com",
  });

  const uploadUrlToS3 = async (url: string, key: string) => {
    const uploadParams = {
      Bucket: "birdinghotspots",
      Key: key,
      ACL: "public-read",
      Body: await fetch(url).then((res) => res.arrayBuffer()),
    };
    // @ts-ignore
    await s3.send(new PutObjectCommand(uploadParams));
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
    console.log(error);
    res.status(500).json({ error: error.message });
    return;
  }
}, "editor");
