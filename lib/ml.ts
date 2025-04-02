import axios from "axios";
import { eBirdImage } from "lib/types";
const ebird_SEARCH_API_URL = "https://ebird.org/ml-search-api/v2/search";

export const getEbirdImages = async (locationId: string) => {
  const url = `${ebird_SEARCH_API_URL}?count=3&mediaType=photo&sort=rating_rank_desc&regionCode=${locationId}&tag=environmental`;
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

  const landscapeImages = images.filter((it) => it.width > it.height);
  const bestMlId = landscapeImages.length > 0 ? landscapeImages[0].assetId : images[0].assetId;

  const formattedImages: eBirdImage[] = images.map((it) => formatEbirdImage(it, it.assetId === bestMlId));

  const featuredImg = formattedImages.find((it) => it.isBest);

  const sortedImages = [
    ...(featuredImg ? [featuredImg] : []),
    ...formattedImages.filter((it) => it.ebirdId !== bestMlId),
  ];

  return sortedImages;
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

  return formatEbirdImage(images[0], true);
};

export const formatEbirdImage = (it: ebirdResponseImage, isBest: boolean): eBirdImage => ({
  width: it.width,
  height: it.height,
  ebirdId: it.assetId,
  caption: it.mediaNotes || "",
  by: it.userDisplayName,
  ebirdDateDisplay: it.obsDtDisplay,
  xsUrl: `https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${it.assetId}/480`,
  smUrl: `https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${it.assetId}/1200`,
  lgUrl: `https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${it.assetId}/2400`,
  isBest,
});

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
