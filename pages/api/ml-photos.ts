import type { NextApiRequest, NextApiResponse } from "next";
import { getBestImages } from "lib/ml";
import { FeaturedMlImg } from "lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { locationId }: any = req.query;

  if (!locationId) {
    return res.status(400).json({ success: false, error: "locationId is required" });
  }

  try {
    const ebirdImages = await getBestImages(locationId, 50);

    const featuredImages: FeaturedMlImg[] = ebirdImages.map((img) => ({
      id: img.ebirdId!,
      caption: img.caption || "",
      by: img.by || "",
      date: img.ebirdDateDisplay || "",
      width: img.width || 0,
      height: img.height || 0,
    }));

    res.status(200).json({
      success: true,
      images: featuredImages,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch eBird images",
    });
  }
}
