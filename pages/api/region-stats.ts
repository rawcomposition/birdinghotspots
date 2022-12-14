import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Group from "models/Group";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { region }: any = req.query;

  try {
    await connect();

    if (region.split("-").length === 3) {
      const total = await Hotspot.countDocuments({ countyCode: region });
      const withImg = await Hotspot.countDocuments({ countyCode: region, featuredImg: { $ne: null } });
      const withContent = await Hotspot.find({ countyCode: region, noContent: false }, ["_id"]);
      const withContentIds = withContent.map((it) => it._id.toString());
      const groups = await Group.find({ countyCodes: region }, ["hotspots"]);
      const groupHotspotIds = groups
        .map((it) => it.hotspots)
        .flat()
        .map((it) => it.toString());
      const withContentOrGroup = [...new Set([...withContentIds, ...groupHotspotIds])];
      res.status(200).json({ total, withImg, withContent: withContentOrGroup.length });
    } else {
      const total = await Hotspot.countDocuments({ stateCode: region });
      const withImg = await Hotspot.countDocuments({ stateCode: region, featuredImg: { $ne: null } });
      const withContent = await Hotspot.find({ stateCode: region, noContent: false }, ["_id"]);
      const withContentIds = withContent.map((it) => it._id.toString());
      const groups = await Group.find({ stateCodes: region }, ["hotspots"]);
      const groupHotspotIds = groups
        .map((it) => it.hotspots)
        .flat()
        .map((it) => it.toString());
      const withContentOrGroup = [...new Set([...withContentIds, ...groupHotspotIds])];
      res.status(200).json({ total, withImg, withContent: withContentOrGroup.length });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
