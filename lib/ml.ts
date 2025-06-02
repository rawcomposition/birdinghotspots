import axios from "axios";
import { MlImage, Image } from "lib/types";
export const EBIRD_SEARCH_API_URL = "https://ebird.org/ml-search-api/v2/search";

export const getBestImages = async (locationId: string, count = 10) => {
  const url = `${EBIRD_SEARCH_API_URL}?count=${count}&mediaType=photo&sort=rating_rank_desc&regionCode=${locationId}&tag=environmental`;
  const response = await axios.get<ebirdResponseImage[]>(url, {
    headers: {
      // This user agent seems to be allowed by eBird
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    },
    maxRedirects: 2,
  });

  const images = response.data;

  if (!Array.isArray(images)) throw new Error("Invalid response from eBird");

  if (images.length === 0) return [];

  const formattedImages: MlImage[] = images.map((it) => formatImage(it));
  return formattedImages;
};

export const getImages = async (assetIds: number[]) => {
  const cleanAssetIds = assetIds.map((id) => id);
  const url = `${EBIRD_SEARCH_API_URL}?assetId=${cleanAssetIds.join(",")}`;
  const response = await axios.get<ebirdResponseImage[]>(url, {
    headers: {
      // This user agent seems to be allowed by eBird
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    },
    maxRedirects: 2,
  });

  const images = response.data;
  if (!Array.isArray(images)) throw new Error("Invalid response from eBird");
  if (images.length === 0) return null;

  return images.map((it) => formatImage(it));
};

export const getImage = async (assetId: number) => {
  const images = await getImages([assetId]);
  return images?.[0];
};

export const getImageCount = async (locationId: string) => {
  try {
    const images = await getBestImages(locationId, 100);

    return images.length;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

const formatImage = (it: ebirdResponseImage): MlImage => ({
  width: it.width,
  height: it.height,
  id: it.assetId,
  caption: it.caption || "",
  by: it.userDisplayName,
  date: it.obsDtDisplay,
});

export const convertMlImageToImage = (data: MlImage): Image => {
  const ebirdId = data.id;
  return {
    width: data.width,
    height: data.height,
    ebirdId,
    caption: data.caption || "",
    by: data.by,
    ebirdDateDisplay: data.date,
    xsUrl: `https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${ebirdId}/480`,
    smUrl: `https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${ebirdId}/1200`,
    lgUrl: `https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${ebirdId}/2400`,
  };
};

export type ebirdResponseImage = {
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
  caption: string | null;
  cursorMark: string | null;
  ebirdChecklistId: string;
};
