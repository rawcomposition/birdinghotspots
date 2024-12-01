import { ImgSource, License } from "lib/types";

export const IMG_SIZES = [240, 320, 480, 900, 1200];

type GetSourceUrlParams = {
  source: ImgSource;
  sourceId: string;
  size: number;
  ext?: string;
};

export const getSourceImgUrl = ({ source, sourceId, size, ext }: GetSourceUrlParams) => {
  if (source === "wikipedia") {
    return `https://upload.wikimedia.org/wikipedia/commons/${sourceId}`;
  } else if (source === "ebird") {
    return `https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${sourceId}/${Math.min(size, 2400)}`;
  } else if (source === "inat") {
    const sizeMap: { [key: number]: string } = {
      2048: "original",
      1024: "large",
      500: "medium",
      240: "small",
      100: "thumb",
      75: "square",
    };
    const sizeName = sizeMap[Math.min(size, 2048)];
    if (!sizeName) throw new Error(`Invalid iNaturalist size: ${size}`);
    return `https://inaturalist-open-data.s3.amazonaws.com/photos/${sourceId}/${sizeName}.${ext || "jpg"}`;
  } else if (source === "flickr") {
    return `https://live.staticflickr.com/${sourceId}`;
  }
  return null;
};

export const getFlickrPhotoIdFromPath = (path: string) => {
  const filename = path.split("/").pop();
  const photoId = filename?.split("_").shift();
  return photoId;
};

export const getWikipediaFileName = (sourceId: string) => {
  return sourceId?.includes("px-") ? (sourceId as string).split("px-").pop() : (sourceId as string)?.split("/").pop();
};

export const getSourceUrl = (source: ImgSource, sourceId: string, iNatObsId?: string) => {
  if (source === "wikipedia") {
    const fileName = getWikipediaFileName(sourceId);
    if (!fileName) return null;
    return `https://en.m.wikipedia.org/wiki/File:${fileName}`;
  } else if (source === "ebird") {
    return `https://macaulaylibrary.org/asset/${sourceId.replace("ML", "")}`;
  } else if (source === "inat") {
    return `https://www.inaturalist.org/observations/${iNatObsId?.replace(
      "https://www.inaturalist.org/observations/",
      ""
    )}`;
  } else if (source === "flickr") {
    const photoId = getFlickrPhotoIdFromPath(sourceId);
    if (!photoId) return null;
    return `https://www.flickr.com/photos/${photoId}`;
  }
  return null;
};

export const formatLicense = (license: string) => {
  let newLicense = license;
  let version = null;

  if (license === "pd") {
    newLicense = "cc0";
  } else if (
    license === "cc-by-sa-2.0" ||
    license === "cc-by-sa-3.0" ||
    license === "cc-by-sa-4.0" ||
    license === "cc-by-sa-2.5" ||
    license === "cc-by-sa-3.0-de" ||
    license === "cc-by-sa-2.5-in" ||
    license === "cc-by-sa-2.5-br" ||
    license === "cc-by-sa-1.0" ||
    license === "cc-by-sa-3.0-nz" ||
    license === "cc-by-sa-2.0-de" ||
    license === "cc-by-sa-2.5-au" ||
    license === "cc-by-sa-2.5-se" ||
    license === "cc-by-sa-3.0-au"
  ) {
    newLicense = "cc-by-sa";
    version = license.replace("cc-by-sa-", "");
  } else if (
    license === "cc-by-2.0" ||
    license === "cc-by-3.0" ||
    license === "cc-by-2.5" ||
    license === "cc-by-4.0" ||
    license === "cc-by-3.0-us" ||
    license === "cc-by-1.0" ||
    license === "cc-by-2.0-de" ||
    license === "cc-by-3.0-de"
  ) {
    newLicense = "cc-by";
    version = license.replace("cc-by-", "");
  } else if (license === "cc-sa-1.0") {
    newLicense = "cc-sa";
    version = license.replace("cc-sa-", "");
  }

  return { license: newLicense, licenseVer: version };
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

type MLLocation = {
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

type MLTaxonomy = {
  comName: string;
  sciName: string;
  speciesCode: string;
  category: string;
  reportAs: string;
};

type MLAsset = {
  assetId: number;
  parentAssetId: number | null;
  ageSex: any;
  location: MLLocation;
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
  taxonomy: MLTaxonomy;
  assetState: string;
  mediaType: string;
  source: string;
  exoticCategory: string | null;
  cursorMark: string;
  ebirdChecklistId: string;
};

export async function getSourceInfo(source: string, sourceId: string | undefined, iNatObsId: string | undefined) {
  if (!sourceId && !iNatObsId) throw new Error("sourceId or iNatObsId is required");

  switch (source) {
    case "ebird": {
      const url = `https://ebird.org/ml-search-api/asset-info?assetId=${sourceId}&taxaLocale=en`;
      const request = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        },
      });
      const response: MLAsset[] = await request.json();
      const asset = response[0];

      return {
        author: asset.userDisplayName,
      };
    }
    case "inat": {
      const request = await fetch(`https://api.inaturalist.org/v1/observations/${iNatObsId}`);
      const response = await request.json();
      const obs = response.results[0];
      const iNatFileExts = obs.photos?.map((photo: any) => photo.url?.split(".").pop());
      const speciesNamePieces = obs.taxon?.name?.split(" ");
      const speciesName = `${speciesNamePieces?.[0]} ${speciesNamePieces?.[1]}`.trim();
      const iNatUserId = obs.user.login;

      return {
        author: obs.user.name || obs.user.login,
        license: obs.observation_photos?.[0]?.photo?.license_code,
        sourceIds: obs.photos?.map((photo: any) => photo.id.toString()),
        iNatFileExts,
        iNatUserId,
        speciesName,
      };
    }
    case "wikipedia": {
      const fileName = getWikipediaFileName(sourceId as string);
      if (!fileName) throw new Error("Invalid sourceId");
      const metadata = await fetchWikipediaMetadata(fileName);

      const { license, licenseVer } = formatLicense(metadata.license || "");

      return {
        author: metadata.author || "",
        license: (license as License) || "",
        licenseVer: licenseVer || "",
      };
    }
    case "flickr": {
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
        { code: "0", license: "", licenseVer: "" },
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

      return {
        author: photo.owner.realname || photo.owner.username,
        license: licenseMap.find((it) => it.code === license)?.license as License,
        licenseVer: licenseMap.find((it) => it.code === license)?.licenseVer,
      };
    }
    default:
      throw new Error("Unsupported source");
  }
}
