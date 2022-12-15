import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Group from "models/Group";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { region }: any = req.query;

  try {
    await connect();

    if (region.split("-").length === 3) {
      // county
      const total = await Hotspot.countDocuments({ countyCode: region });
      const withImg = await Hotspot.countDocuments({ countyCode: region, featuredImg: { $ne: null } });
      const allHotspots = await Hotspot.find({ countyCode: region }, ["_id", "noContent"]);
      const groups = await Group.find({ countyCodes: region }, ["hotspots"]);
      const groupHotspotIds = groups
        .map((it) => it.hotspots)
        .flat()
        .map((it) => it.toString());

      const withContent = allHotspots.filter((it) => !it.noContent || groupHotspotIds.includes(it._id.toString()));

      res.status(200).json({ total, withImg, withContent: withContent.length });
    } else {
      // state
      const total = await Hotspot.countDocuments({ stateCode: region });
      const withImg = await Hotspot.countDocuments({ stateCode: region, featuredImg: { $ne: null } });
      const allHotspots = await Hotspot.find({ stateCode: region }, ["_id", "noContent"]);
      const groups = await Group.find({ stateCode: region }, ["hotspots"]);
      const groupHotspotIds = groups
        .map((it) => it.hotspots)
        .flat()
        .map((it) => it.toString());
      const withContent = allHotspots.filter((it) => !it.noContent || groupHotspotIds.includes(it._id.toString()));
      res.setHeader("Cache-Control", "max-age=0, s-maxage="); //Cache for 6 hours
      res.status(200).json({ total, withImg, withContent: withContent.length });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
