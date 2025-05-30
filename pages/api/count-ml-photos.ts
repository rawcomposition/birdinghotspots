import type { NextApiRequest, NextApiResponse } from "next";
import { getEbirdImageCount } from "lib/ml";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { locationId }: any = req.query;

  if (!locationId) {
    return res.status(400).json({ success: false, error: "locationId is required" });
  }

  try {
    const count = await getEbirdImageCount(locationId);

    res.status(200).json({ success: true, count });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch eBird image count",
    });
  }
}
