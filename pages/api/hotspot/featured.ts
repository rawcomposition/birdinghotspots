import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Settings from "models/Settings";
import { getLocationText, getStateByCode } from "lib/localData";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connect();
    const settings = await Settings.findOne({ key: "global" }).exec();
    const featuredIds = settings.featuredIds;
    const results = await Hotspot.find({ _id: { $in: featuredIds } }, [
      "stateCode",
      "countyCode",
      "name",
      "url",
      "featuredImg",
      "species",
    ])
      .sort({ name: 1 })
      .lean()
      .exec();
    const formatted = results.map((hotspot) => {
      const locationLine = hotspot.countyCode
        ? getLocationText(hotspot.countyCode)
        : `${getStateByCode(hotspot.stateCode)?.label}, US`;
      return {
        ...hotspot,
        locationLine,
      };
    });
    res.status(200).json({
      success: true,
      results: formatted,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
