import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Group from "models/Group";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { region, limit, offset }: any = req.query;

  let query: any = {};

  if (region.split("-").length === 3) {
    query = { countyCodes: region };
  } else if (region.split("-").length === 2) {
    query = { stateCodes: region };
  } else {
    query = { countryCode: region };
  }

  try {
    await connect();
    const results = await Group.find(query, ["name", "url", "mapImgUrl", "countryCode", "hotspots"])
      .sort({ species: -1, name: 1 })
      .limit(limit || 15)
      .skip(offset || 0)
      .lean()
      .exec();

    const count = await Group.countDocuments(query);
    res.status(200).json({
      success: true,
      results,
      count,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
