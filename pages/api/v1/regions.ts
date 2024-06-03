import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import { getFileUrl } from "lib/s3";
import { Image, Region } from "lib/types";
import Regions from "data/regions.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const regions = Regions as Region[];
    const countryCodes = regions.map((it) => it.code);

    const twentyFourHrs = 24 * 60 * 60;
    res.setHeader("Cache-Control", `public, max-age=${twentyFourHrs}, s-maxage=${twentyFourHrs}`);

    res.status(200).json(countryCodes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
