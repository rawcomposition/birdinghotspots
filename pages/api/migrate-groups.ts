import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Group from "models/Group";
import Hotspot from "models/Hotspot";
import { uploadGroupMapImg } from "lib/s3";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const groups = await Group.find({ mapImgUrl: null }).lean();

  let count = 1;

  for (const group of groups) {
    const hotspots = await Hotspot.find({ _id: { $in: group.hotspots } }, ["species", "lat", "lng"]).lean();
    const mapImgUrl = await uploadGroupMapImg(hotspots);
    await Group.updateOne({ _id: group._id }, { $set: { mapImgUrl, hotspotCount: group.hotspots.length } });
    console.log(count, group.locationId);
    count++;
  }

  res.status(200).json({ success: true });
}
