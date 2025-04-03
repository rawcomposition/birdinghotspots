import type { NextApiRequest, NextApiResponse } from "next";
import { getHotspotImages } from "lib/mongo";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { locationId } = req.query;

  try {
    const images = await getHotspotImages(locationId as string);

    res.status(200).json(images);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Unable to load images from eBird" });
  }
}
