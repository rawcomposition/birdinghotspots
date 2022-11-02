import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import { getCountyByCode, getStateByCode } from "lib/localData";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { region, limit, offset }: any = req.query;
  const isCounty = region.split("-").length === 3;
  const regionName = isCounty ? getCountyByCode(region)?.longName : getStateByCode(region.split("-")[1])?.label;

  const regionPieces = region.split("-");
  const stateCode = `${regionPieces[0]}-${regionPieces[1]}`;

  const query = isCounty
    ? { countyCode: region, name: { $not: /^stakeout/i } }
    : { stateCode, name: { $not: /^stakeout/i } };

  try {
    await connect();
    const results = await Hotspot.find(query, ["name", "url", "featuredImg", "lat", "lng", "species", "countryCode"])
      .sort({ species: -1 })
      .limit(limit || 15)
      .skip(offset || 0)
      .lean()
      .exec();

    const count = await Hotspot.count(query);
    res.status(200).json({
      success: true,
      results,
      count,
      regionName,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
