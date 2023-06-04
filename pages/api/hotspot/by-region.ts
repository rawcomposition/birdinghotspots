import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { region, limit, offset, images, content, features }: any = req.query;
  const isCounty = region.split("-").length === 3;

  let query: any = isCounty ? { countyCode: region } : { stateCode: region };

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
      .sort({ species: -1, name: 1 })
      .limit(limit || 15)
      .skip(offset || 0)
      .lean()
      .exec();

    const count = await Hotspot.countDocuments(query);
    res.status(200).json({
      success: true,
      results,
      count,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
