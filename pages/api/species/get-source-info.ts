import type { NextApiRequest, NextApiResponse } from "next";
import { getSourceInfo } from "lib/species";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  try {
    const source = req.query.source as string;
    const sourceId = req.query.sourceId as string;
    const iNatObsId = req.query.iNatObsId as string | undefined;
    if (!source) throw new Error("source is required");

    const info = await getSourceInfo(source, sourceId, iNatObsId);
    res.status(200).json({ success: true, info });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
