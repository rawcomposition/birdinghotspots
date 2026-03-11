import type { NextApiRequest, NextApiResponse } from "next";
import { getGroupPrimaryHotspotsByRegion } from "lib/mongo";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { region } = req.query;

  if (!region || typeof region !== "string") {
    return res.status(400).json({ error: "region is required" });
  }

  try {
    const groups = await getGroupPrimaryHotspotsByRegion(region);
    res.status(200).json(groups);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
