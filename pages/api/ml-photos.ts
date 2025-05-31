import type { NextApiRequest, NextApiResponse } from "next";
import { getBestImages } from "lib/ml";
import { MlImage } from "lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { locationId }: any = req.query;

  if (!locationId) {
    return res.status(400).json({ success: false, error: "locationId is required" });
  }

  try {
    const ebirdImages = await getBestImages(locationId, 50);

    res.status(200).json({
      success: true,
      images: ebirdImages,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch eBird images",
    });
  }
}
