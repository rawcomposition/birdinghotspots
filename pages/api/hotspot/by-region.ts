import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { region, limit, offset }: any = req.query;
  const isCounty = region.split("-").length === 3;

  const query = isCounty ? { countyCode: region } : { stateCode: region };

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
