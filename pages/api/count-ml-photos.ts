import type { NextApiRequest, NextApiResponse } from "next";
import { getImageCount } from "lib/ml";
import { ENABLE_PHOTO_SYNC } from "lib/config";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (!ENABLE_PHOTO_SYNC) {
    return res.status(200).json({ success: true, count: 0 });
  }

  const { locationId }: any = req.query;

  if (!locationId) {
    return res.status(400).json({ success: false, error: "locationId is required" });
  }

  try {
    const count = await getImageCount(locationId);

    res.status(200).json({ success: true, count });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch eBird image count",
    });
  }
}
