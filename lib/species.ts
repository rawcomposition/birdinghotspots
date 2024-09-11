import { SpeciesT } from "lib/types";

export const getSourceUrl = ({ source, sourceId }: SpeciesT, size: number = 320) => {
  if (source === "wikipedia") {
    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${sourceId.replace("320", size.toString())}`;
  }
};
