import type { NextApiRequest, NextApiResponse } from "next";
import { getImages } from "lib/ml";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const assetIdsStr = req.query.assetIds as string | undefined;
  const assetIds = assetIdsStr?.split(",") || [];
  const cleanAssetIds = assetIds.map((id) => Number(id));

  if (!assetIds.length) {
    return res.status(200).json({ success: true, missingIds: [] });
  }

  try {
    const images = await getImages(cleanAssetIds);
    const missingIds = cleanAssetIds.filter((id) => !images?.some((image) => image.id === id));

    res.status(200).json({ success: true, missingIds });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to verify eBird images",
    });
  }
}
