import type { NextApiRequest, NextApiResponse } from "next";
import { License, SourceInfoT } from "lib/types";
import { formatLicense, getFlickrPhotoIdFromPath, getWikipediaFileName } from "lib/species";

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

function stripHtmlTags(text: string): string {
  return text?.replace(/<[^>]*>/g, "") || "";
}

export async function fetchWikipediaMetadata(fileName: string) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata&format=json&origin=*&titles=File:${fileName}`;

  const response = await fetch(url);
  const data = await response.json();
  const pages = data.query.pages;

  const page = Object.values(pages)[0] as any;
  if (page && page.imageinfo && page.imageinfo[0].extmetadata) {
    const metadata = page.imageinfo[0].extmetadata;
    const rawAuthor = metadata.Artist?.value || null;
    const author = stripHtmlTags(rawAuthor)?.trim() || null;
    const license = metadata.License?.value?.trim() || null;

    return { author, license };
  } else {
    throw new Error("Metadata not found for the specified media file.");
  }
}

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
      const iNatFileExts = obs.photos?.map((photo: any) => photo.url?.split(".").pop());
      const speciesNamePieces = obs.taxon?.name?.split(" ");
      const speciesName = `${speciesNamePieces?.[0]} ${speciesNamePieces?.[1]}`.trim();

      const info: SourceInfoT = {
        author: obs.user.name || obs.user.login,
        license: obs.observation_photos?.[0]?.photo?.license_code,
        sourceIds: obs.photos?.map((photo: any) => photo.id.toString()),
        iNatFileExts,
        speciesName: speciesName,
      };

      res.status(200).json({ success: true, info });
    } else if (source === "wikipedia") {
      const fileName = getWikipediaFileName(sourceId as string);

      if (!fileName) throw new Error("Invalid sourceId");
      const metadata = await fetchWikipediaMetadata(fileName);

      const { license, licenseVer } = formatLicense(metadata.license || "");

      const info: SourceInfoT = {
        author: metadata.author || "",
        license: (license as License) || "",
        licenseVer: licenseVer || "",
      };

      res.status(200).json({ success: true, info });
    } else if (source === "flickr") {
      const photoId = getFlickrPhotoIdFromPath(sourceId as string);
      if (!photoId) throw new Error("Invalid sourceId");

      const url = `https://www.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=${process.env.FLICKR_API_KEY}&photo_id=${photoId}&format=json&nojsoncallback=1`;
      const request = await fetch(url);
      const response = await request.json();

      if (response.stat !== "ok") {
        throw new Error("Failed to fetch Flickr photo info");
      }

      const photo = response.photo;
      const license = photo.license;

      const licenseMap = [
        { code: "0", license: "", licenseVer: "" }, // All Rights Reserved
        { code: "1", license: "cc-by-nc-sa", licenseVer: "2.0" },
        { code: "2", license: "cc-by-nc", licenseVer: "2.0" },
        { code: "3", license: "cc-by-nc-nd", licenseVer: "2.0" },
        { code: "4", license: "cc-by", licenseVer: "2.0" },
        { code: "5", license: "cc-by-sa", licenseVer: "2.0" },
        { code: "6", license: "cc-by-nd", licenseVer: "2.0" },
        { code: "7", license: "cc0", licenseVer: "" },
        { code: "8", license: "cc0", licenseVer: "" },
        { code: "9", license: "cc0", licenseVer: "" },
        { code: "10", license: "cc0", licenseVer: "" },
      ];

      const info: SourceInfoT = {
        author: photo.owner.realname || photo.owner.username,
        license: licenseMap.find((it) => it.code === license)?.license as License,
        licenseVer: licenseMap.find((it) => it.code === license)?.licenseVer,
      };

      res.status(200).json({ success: true, info });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
