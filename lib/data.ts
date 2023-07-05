import { promises as fs } from "fs";
import { Region } from "lib/types";

export async function getRegion(code: string): Promise<Region | null> {
  const isCounty = code.split("-").length === 3;
  const trimmedCode = isCounty ? `${code.split("-")[0]}-${code.split("-")[1]}` : code;
  const path = `data/regions/${trimmedCode}.json`;
  try {
    const region = await fs.readFile(path, "utf8");
    const data: Region = JSON.parse(region);
    if (isCounty) {
      const county = data?.subregions?.find((it) => it.code === code);
      return county || null;
    }
    return data;
  } catch (err) {
    return null;
  }
}
