import type { NextApiRequest, NextApiResponse } from "next";
import { isEbirdImageMissing } from "lib/ml";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { assetId }: any = req.query;

  if (!assetId) {
    return res.status(400).json({ success: false, error: "assetId is required" });
  }

  try {
    const isMissing = await isEbirdImageMissing(assetId);

    res.status(200).json({ success: true, isMissing });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch eBird image count",
    });
  }
}
