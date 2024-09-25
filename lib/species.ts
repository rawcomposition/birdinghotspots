import { ImgSource } from "lib/types";

export const IMG_SIZES = [240, 320, 480, 640, 1024];

type GetSourceUrlParams = {
  source: ImgSource;
  sourceId: string;
  size: number;
};

export const getSourceUrl = ({ source, sourceId, size }: GetSourceUrlParams) => {
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
    return `https://inaturalist-open-data.s3.amazonaws.com/photos/${sourceId}/${sizeName}.jpg`;
  }
  return null;
};
