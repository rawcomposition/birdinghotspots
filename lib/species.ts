import { ImgSource } from "lib/types";

export const IMG_SIZES = [240, 320, 480, 900, 1200];

type GetSourceUrlParams = {
  source: ImgSource;
  sourceId: string;
  size: number;
  ext?: string;
};

export const getSourceImgUrl = ({ source, sourceId, size, ext }: GetSourceUrlParams) => {
  if (source === "wikipedia") {
    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${sourceId.replace("320", size.toString())}`;
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
  }
  return null;
};

export const getSourceUrl = (source: ImgSource, sourceId: string, iNatObsId?: string) => {
  if (source === "wikipedia") {
    const fileName = (sourceId as string).split("px-").pop();
    if (!fileName) return null;
    return `https://en.m.wikipedia.org/wiki/File:${fileName}`;
  } else if (source === "ebird") {
    return `https://macaulaylibrary.org/asset/${sourceId.replace("ML", "")}`;
  } else if (source === "inat") {
    return `https://www.inaturalist.org/observations/${iNatObsId?.replace(
      "https://www.inaturalist.org/observations/",
      ""
    )}`;
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
