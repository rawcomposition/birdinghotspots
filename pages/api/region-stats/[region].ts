import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { region }: any = req.query;

  try {
    await connect();

    if (region.split("-").length === 3) {
      // county
      const total = await Hotspot.countDocuments({ countyCode: region });
      const withImg = await Hotspot.countDocuments({ countyCode: region, featuredImg: { $ne: null } });
      const withContent = await Hotspot.countDocuments({
        countyCode: region,
        $or: [{ noContent: false }, { "groupIds.0": { $exists: true } }],
      });

      res.status(200).json({ total, withImg, withContent });
    } else if (region.split("-").length === 2) {
      // state
      const total = await Hotspot.countDocuments({ stateCode: region });
      const withImg = await Hotspot.countDocuments({ stateCode: region, featuredImg: { $ne: null } });
      const withContent = await Hotspot.countDocuments({
        stateCode: region,
        $or: [{ noContent: false }, { "groupIds.0": { $exists: true } }],
      });

      res.setHeader("Cache-Control", "max-age=0, s-maxage=21600"); //Cache for 6 hours
      res.status(200).json({ total, withImg, withContent });
    } else {
      // country
      const total = await Hotspot.countDocuments({ countryCode: region });
      const withImg = await Hotspot.countDocuments({ countryCode: region, featuredImg: { $ne: null } });
      const withContent = await Hotspot.countDocuments({
        countryCode: region,
        $or: [{ noContent: false }, { "groupIds.0": { $exists: true } }],
      });

      res.setHeader("Cache-Control", "max-age=0, s-maxage=21600"); //Cache for 6 hours
      res.status(200).json({ total, withImg, withContent });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
