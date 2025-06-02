import type { NextApiRequest, NextApiResponse } from "next";
import { EBIRD_SEARCH_API_URL, ebirdResponseImage } from "lib/ml";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const assetIdsStr = req.query.assetIds as string | undefined;
  const assetIds = assetIdsStr?.split(",") || [];
  const cleanAssetIds = assetIds.map((id) => Number(id));

  if (!assetIds.length) {
    return res.status(200).json({ success: true, missingIds: [] });
  }

  try {
    const url = `${EBIRD_SEARCH_API_URL}?assetId=${cleanAssetIds.join(",")}`;
    const response = await axios.get<ebirdResponseImage[]>(url, {
      headers: {
        // This user agent seems to be allowed by eBird
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
      maxRedirects: 2,
    });

    if (response.statusText !== "OK") {
      return res.status(200).json({ success: true, missingIds: [] });
    }

    const images = response.data;
    const missingIds = cleanAssetIds.filter((id) => !images.some((image) => Number(image.assetId) === Number(id)));

    res.status(200).json({ success: true, missingIds });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to verify eBird images",
    });
  }
}
