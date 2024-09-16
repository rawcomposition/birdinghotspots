import type { NextApiRequest, NextApiResponse } from "next";
import { get } from "lib/helpers";
import { SourceInfoT } from "lib/types";

type Location = {
  locId: string;
  name: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  countryName: string;
  subnational1Name: string;
  subnational1Code: string;
  subnational2Code: string | null;
  subnational2Name: string | null;
  locality: string | null;
  localityDir: string | null;
  localityKm: number | null;
};

type Taxonomy = {
  comName: string;
  sciName: string;
  speciesCode: string;
  category: string;
  reportAs: string;
};

type Asset = {
  assetId: number;
  parentAssetId: number | null;
  ageSex: any;
  location: Location;
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
  tags: string | null;
  taxonomy: Taxonomy;
  assetState: string;
  mediaType: string;
  source: string;
  exoticCategory: string | null;
  cursorMark: string;
  ebirdChecklistId: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  try {
    const { source, sourceId } = req.query;

    if (!source) throw new Error("source is required");
    if (!sourceId) throw new Error("sourceId is required");

    if (sourceId === "ebird") {
      const url = `https://ebird.org/ml-search-api/asset-info?assetId=${source}&taxaLocale=en`;
      const request = await fetch(url, {
        headers: {
          // This user agent seems to be allowed by eBird
          "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        },
      });
      const response: Asset[] = await request.json();
      const asset = response[0];

      const info: SourceInfoT = {
        author: asset.userDisplayName,
        width: asset.width,
        height: asset.height,
      };

      res.status(200).json({ success: true, info });
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
