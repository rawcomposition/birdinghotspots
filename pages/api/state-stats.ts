import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { state }: any = req.query;

  try {
    await connect();
    const total = await Hotspot.countDocuments({ stateCode: state });
    const withImg = await Hotspot.countDocuments({ stateCode: state, featuredImg: { $ne: null } });
    res.status(200).json({ total, withImg });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
