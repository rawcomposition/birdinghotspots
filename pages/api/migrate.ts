import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Upload from "models/Upload";
import Hotspot from "models/Hotspot";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connect();
    const uploads = await Upload.find({ countyCode: null });
    for (const upload of uploads) {
      const hotspot = await Hotspot.findOne({ locationId: upload.locationId });
      if (hotspot) {
        upload.countyCode = hotspot.countyCode;
        await upload.save();
      }
    }
    res.status(200).json({
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
