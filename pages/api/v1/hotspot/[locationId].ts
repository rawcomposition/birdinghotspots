import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import { getFileUrl } from "lib/s3";
import { Image } from "lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { locationId }: any = req.query;

  try {
    await connect();

    const hotspot = await Hotspot.findOne({ locationId }).lean();

    const twoHours = 2 * 60 * 60;
    res.setHeader("Cache-Control", `public, max-age=${twoHours}, s-maxage=${twoHours}`);

    if (!hotspot) {
      return res.status(404).json({ error: "Hotspot not found" });
    }

    const formatImage = (image: Image) => ({
      xsUrl: getFileUrl(image.xsUrl),
      smUrl: getFileUrl(image.smUrl),
      lgUrl: getFileUrl(image.lgUrl),
      by: image.by,
      width: image.width,
      height: image.height,
      caption: image.caption,
      isMap: image.isMap,
      isStreetview: image.isStreetview,
      streetviewData: image.streetviewData,
    });

    res.status(200).json({
      success: true,
      name: hotspot.name,
      url: `${process.env.NEXT_PUBLIC_DOMAIN}/hotspot/${hotspot.locationId}`,
      featuredImage: hotspot.featuredImg ? formatImage(hotspot.featuredImg) : null,
      images: hotspot.images?.map(formatImage) || [],
      webpage: hotspot.webpage,
      trailMap: hotspot.trailMap,
      plan: hotspot.plan,
      birding: hotspot.birding,
      about: hotspot.about,
      address: hotspot.address,
      links: hotspot.links,
      restrooms: hotspot.restrooms,
      roadside: hotspot.roadside,
      accessible: hotspot.accessible,
      fee: hotspot.fee,
      speciesCount: hotspot.species,
      updatedAt: hotspot.updatedAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
