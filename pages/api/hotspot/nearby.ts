import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { lat, lng, offset, limit, exclude }: any = req.query;

  const query = {
    isGroup: { $ne: true },
    location: { $near: { $geometry: { type: "Point", coordinates: [lng, lat] } } },
    locationId: { $nin: exclude?.split(",") || [] },
  };

  try {
    await connect();
    const results = await Hotspot.find(query, ["groups", "name", "url", "featuredImg", "lat", "lng", "species"])
      .limit(limit || 15)
      .skip(offset || 0)
      .populate("groups", ["name"])
      .lean()
      .exec();
    res.status(200).json({
      success: true,
      results,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
