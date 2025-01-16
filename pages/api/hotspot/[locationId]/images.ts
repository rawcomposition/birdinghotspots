import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import { eBirdImage, Image } from "lib/types";
import axios from "axios";

const ebird_SEARCH_API_URL = "https://ebird.org/ml-search-api/v2/search";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { locationId } = req.query;

  try {
    await connect();
    const url = `${ebird_SEARCH_API_URL}?count=6&mediaType=photo&sort=rating_rank_desc&regionCode=${locationId}&tag=environmental`;
    const [response, hotspot] = await Promise.all([
      axios.get<ebirdResponseImage[]>(url, {
        headers: {
          // This user agent seems to be allowed by eBird
          "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        },
        maxRedirects: 2,
      }),
      Hotspot.findOne({ locationId }, ["featuredImg", "images"]).lean(),
    ]);

    const images = response.data;

    if (!hotspot) throw new Error("Hotspot not found");

    if (!Array.isArray(images)) throw new Error("Invalid response from eBird");

    if (images.length === 0) {
      res.status(200).json([]);
      return;
    }

    const landscapeImages = images.filter((it) => it.width > it.height);
    const featuredMlId = landscapeImages.length > 0 ? landscapeImages[0].assetId : images[0].assetId;

    const formattedImages: eBirdImage[] = images.map((it) => ({
      width: it.width,
      height: it.height,
      ebirdId: it.assetId,
      caption: it.mediaNotes || "",
      by: it.userDisplayName,
      ebirdDateDisplay: it.obsDtDisplay,
      ebirdUserId: it.userId,
      xsUrl: `https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${it.assetId}/480`,
      smUrl: `https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${it.assetId}/1200`,
      lgUrl: `https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${it.assetId}/2400`,
      isFeatured: it.assetId === featuredMlId,
    }));

    const featuredImg = formattedImages.find((it) => it.isFeatured);

    const sortedImages = [
      ...(featuredImg ? [featuredImg] : []),
      ...formattedImages.filter((it) => it.ebirdId !== featuredMlId),
    ];

    const compareFields = ["ebirdId", "by", "ebirdDateDisplay", "caption", "xsUrl", "smUrl", "lgUrl"];
    const shouldUpdateFeaturedImg =
      featuredImg &&
      hotspot.featuredImg &&
      !compareFields.every((field) => {
        const featuredValue = featuredImg[field as keyof eBirdImage];
        const existingValue = hotspot.featuredImg?.[field as keyof typeof hotspot.featuredImg];
        return featuredValue === existingValue;
      });
    const shouldAddFeaturedImg = !hotspot.featuredImg && featuredImg;
    const shouldRemoveFeaturedImg = !featuredImg && hotspot.featuredImg?.ebirdId;

    if (shouldUpdateFeaturedImg || shouldAddFeaturedImg) {
      await Hotspot.updateOne({ locationId }, { featuredImg });
    } else if (shouldRemoveFeaturedImg) {
      const legacyFeaturedImg = hotspot.images?.[0];
      await Hotspot.updateOne(
        { locationId },
        legacyFeaturedImg ? { featuredImg: legacyFeaturedImg } : { $unset: { featuredImg: "" } }
      );
    }

    const combinedImages: Image[] = [...sortedImages, ...(hotspot.images || [])];

    res.status(200).json(combinedImages);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Unable to load images from eBird" });
  }
}

type ebirdResponseImage = {
  assetId: number;
  parentAssetId: number | null;
  ageSex: any;
  location: any;
  licenseId: string;
  mediaNotes: string | null;
  obsDt: string;
  obsDtDisplay: string;
  obsYear: number;
  obsMonth: number;
  obsDay: number;
  obsTime: number;
  restricted: boolean;
  ratingCount: number;
  rating: number;
  userId: string;
  userDisplayName: string;
  userHasProfile: boolean;
  width: number;
  height: number;
  valid: boolean;
  reviewed: boolean;
  tags: string[];
  taxonomy: any;
  assetState: string;
  mediaType: string;
  source: string;
  exoticCategory: string | null;
  cursorMark: string | null;
  ebirdChecklistId: string;
};
