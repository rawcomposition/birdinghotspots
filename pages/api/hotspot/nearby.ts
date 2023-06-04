import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { lat, lng, offset, limit, exclude, images, content, features }: any = req.query;

  const query: any = {
    location: { $near: { $geometry: { type: "Point", coordinates: [lng, lat] } } },
    locationId: { $nin: exclude?.split(",") || [] },
  };

  if (images === "Yes") {
    query.featuredImg = { $exists: true };
  } else if (images === "No") {
    query.featuredImg = { $exists: false };
  }

  if (content === "Yes") {
    query.$or = [{ noContent: false }, { "groupIds.0": { $exists: true } }];
  } else if (content === "No") {
    query.$and = [{ noContent: true }, { "groupIds.0": { $exists: false } }];
  }

  if (features === "Restrooms") {
    query.restrooms = "Yes";
  } else if (features === "Accessible") {
    query.accessible = "Yes";
  } else if (features === "Roadside") {
    query.roadside = "Yes";
  } else if (features === "Free") {
    query.fee = "No";
  }

  try {
    await connect();
    const results = await Hotspot.find(query, ["name", "url", "featuredImg", "lat", "lng", "species", "countryCode"])
      .limit(limit || 15)
      .skip(offset || 0)
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
