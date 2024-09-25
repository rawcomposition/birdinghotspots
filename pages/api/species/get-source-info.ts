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
    const { source, sourceId, iNatObsId } = req.query;

    if (!source) throw new Error("source is required");
    if (!sourceId && !iNatObsId) throw new Error("sourceId or iNatObsId is required");

    if (source === "ebird") {
      const url = `https://ebird.org/ml-search-api/asset-info?assetId=${sourceId}&taxaLocale=en`;
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
      };

      res.status(200).json({ success: true, info });
    } else if (source === "inat") {
      const request = await fetch(`https://api.inaturalist.org/v1/observations/${iNatObsId}`);
      const response = await request.json();
      const obs = response.results[0];

      const info: SourceInfoT = {
        author: obs.user.name,
        license: obs.license_code,
        sourceIds: obs.photos.map((photo: any) => photo.id),
      };

      res.status(200).json({ success: true, info });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
