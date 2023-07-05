import { promises as fs } from "fs";
import { Region } from "lib/types";

export async function getRegion(code: string): Promise<Region | null> {
  const path = `data/regions/${code}.json`;
  try {
    const region = await fs.readFile(path, "utf8");
    return JSON.parse(region);
  } catch (err) {
    return null;
  }
}
