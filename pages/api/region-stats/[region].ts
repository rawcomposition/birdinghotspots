import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { region }: any = req.query;

  try {
    await connect();

    if (region.split("-").length === 3) {
      // county
      const total = (await Hotspot.countDocuments({ countyCode: region })) || 0;
      const withImg = (await Hotspot.countDocuments({ countyCode: region, featuredImg: { $ne: null } })) || 0;
      const withContent =
        (await Hotspot.countDocuments({
          countyCode: region,
          $or: [{ noContent: false }, { "groupIds.0": { $exists: true } }],
        })) || 0;
      const withoutContent = total - withContent;
      const withoutImg = total - withImg;

      res.status(200).json({ total, withImg, withContent, withoutContent, withoutImg });
    } else if (region.split("-").length === 2) {
      // state
      const total = (await Hotspot.countDocuments({ stateCode: region })) || 0;
      const withImg = (await Hotspot.countDocuments({ stateCode: region, featuredImg: { $ne: null } })) || 0;
      const withContent =
        (await Hotspot.countDocuments({
          stateCode: region,
          $or: [{ noContent: false }, { "groupIds.0": { $exists: true } }],
        })) || 0;
      const withoutContent = total - withContent;
      const withoutImg = total - withImg;

      const sixHrs = 6 * 60 * 60;
      res.setHeader("Cache-Control", `public, max-age=${sixHrs}, s-maxage=${sixHrs}`);
      res.status(200).json({ total, withImg, withContent, withoutContent, withoutImg });
    } else {
      // country
      const total = (await Hotspot.countDocuments({ countryCode: region })) || 0;
      const withImg = (await Hotspot.countDocuments({ countryCode: region, featuredImg: { $ne: null } })) || 0;
      const withContent =
        (await Hotspot.countDocuments({
          countryCode: region,
          $or: [{ noContent: false }, { "groupIds.0": { $exists: true } }],
        })) || 0;
      const withoutContent = total - withContent;
      const withoutImg = total - withImg;

      const sixHrs = 6 * 60 * 60;
      res.setHeader("Cache-Control", `public, max-age=${sixHrs}, s-maxage=${sixHrs}`);
      res.status(200).json({ total, withImg, withContent, withoutContent, withoutImg });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
