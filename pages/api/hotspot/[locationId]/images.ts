import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import { eBirdImage, Image } from "lib/types";
import { getEbirdImages } from "lib/ml";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { locationId } = req.query;

  try {
    await connect();
    const [ebirdImages, hotspot] = await Promise.all([
      getEbirdImages(locationId as string),
      Hotspot.findOne({ locationId }, ["featuredImg", "images", "featuredEbirdId"]).lean(),
    ]);

    const legacyImages = hotspot?.images?.filter((it) => !it.isMap && !it.isMigrated) || [];

    if (!hotspot) throw new Error("Hotspot not found");

    const bestEbirdImg = ebirdImages.find((it) => it.isFeatured);
    const hasFeaturedEbirdId = !!hotspot.featuredEbirdId;

    if (hasFeaturedEbirdId && hotspot.featuredImg) {
      // Has editor selected ML image

      const combinedImages: Image[] = [
        hotspot.featuredImg,
        ...legacyImages,
        ...ebirdImages.filter((it) => it.ebirdId !== hotspot.featuredImg?.ebirdId),
      ];

      return res.status(200).json(combinedImages);
    }

    const compareFields = ["ebirdId", "by", "ebirdDateDisplay", "caption", "xsUrl", "smUrl", "lgUrl"];
    const shouldUpdateFeaturedImg =
      bestEbirdImg &&
      hotspot.featuredImg &&
      hotspot.featuredImg.ebirdId &&
      !compareFields.every((field) => {
        const featuredValue = bestEbirdImg[field as keyof eBirdImage];
        const existingValue = hotspot.featuredImg?.[field as keyof typeof hotspot.featuredImg];
        return featuredValue === existingValue;
      });
    const shouldAddFeaturedImg = !hotspot.featuredImg && bestEbirdImg;
    const shouldRemoveFeaturedImg = !bestEbirdImg && hotspot.featuredImg?.ebirdId;

    if (shouldUpdateFeaturedImg || shouldAddFeaturedImg) {
      await Hotspot.updateOne({ locationId }, { featuredImg: bestEbirdImg });
    } else if (shouldRemoveFeaturedImg) {
      const legacyFeaturedImg = legacyImages[0];
      await Hotspot.updateOne(
        { locationId },
        legacyFeaturedImg ? { featuredImg: legacyFeaturedImg } : { $unset: { featuredImg: "" } }
      );
    }

    const combinedImages: Image[] =
      bestEbirdImg && !legacyImages.length
        ? [bestEbirdImg, ...ebirdImages.filter((it) => it.ebirdId !== bestEbirdImg.ebirdId)]
        : [...legacyImages, ...ebirdImages];

    res.status(200).json(combinedImages);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Unable to load images from eBird" });
  }
}
