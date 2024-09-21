import { ImgSource } from "lib/types";

export const IMG_SIZES = [240, 320];

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
  }
  return null;
};
