import axios from "axios";
import { FeaturedMlImg, Image } from "lib/types";
const ebird_SEARCH_API_URL = "https://ebird.org/ml-search-api/v2/search";

export const getEbirdImages = async (locationId: string, count = 10) => {
  const url = `${ebird_SEARCH_API_URL}?count=${count}&mediaType=photo&sort=rating_rank_desc&regionCode=${locationId}&tag=environmental`;
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

  const formattedImages: Image[] = images.map((it) => formatEbirdImage(it));
  return formattedImages;
};

export const getEbirdImage = async (assetId: string) => {
  const cleanAssetId = assetId.replace("ML", "");
  const url = `${ebird_SEARCH_API_URL}?assetId=${cleanAssetId}`;
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

  return formatEbirdImage(images[0]);
};

export const isEbirdImageMissing = async (assetId: string) => {
  const cleanAssetId = assetId.replace("ML", "");
  const url = `${ebird_SEARCH_API_URL}?assetId=${cleanAssetId}`;
  const response = await axios.get<ebirdResponseImage[]>(url, {
    headers: {
      // This user agent seems to be allowed by eBird
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    },
    maxRedirects: 2,
  });

  const images = response.data;
  const noImage = !!Array.isArray(images) && images.length === 0;
  return noImage && response.statusText === "OK";
};

export const getEbirdImageCount = async (locationId: string) => {
  try {
    const images = await getEbirdImages(locationId, 100);

    return images.length;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const formatEbirdImage = (it: ebirdResponseImage): Image => ({
  width: it.width,
  height: it.height,
  ebirdId: it.assetId,
  caption: it.caption || "",
  by: it.userDisplayName,
  ebirdDateDisplay: it.obsDtDisplay,
  xsUrl: `https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${it.assetId}/480`,
  smUrl: `https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${it.assetId}/1200`,
  lgUrl: `https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${it.assetId}/2400`,
});

export const formatFeaturedImg = (data: FeaturedMlImg): Image => {
  const ebirdId = Number(data.id.replace("ML", ""));
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
  caption: string | null;
  cursorMark: string | null;
  ebirdChecklistId: string;
};
