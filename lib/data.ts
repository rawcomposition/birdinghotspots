import { promises as fs } from "fs";
import { Region, Drive, Hotspot, City } from "lib/types";
import USCities from "data/cities/us.json";
import CACities from "data/cities/ca.json";

const formatRegion = (region: Omit<Region, "detailedName">): Region => {
  let detailedName = region.name;
  if (region.parents?.length === 2) {
    detailedName = `${region.name}, ${region.parents[1].name}, ${region.parents[0].name}`;
  } else if (region.parents?.length === 1) {
    detailedName = `${region.name}, ${region.parents[0].name}`;
  }
  return {
    ...region,
    detailedName,
  };
};

export async function getRegion(code: string): Promise<Region | null> {
  const isCounty = code.split("-").length === 3;
  const trimmedCode = isCounty ? `${code.split("-")[0]}-${code.split("-")[1]}` : code;
  const path = `data/regions/${trimmedCode}.json`;
  try {
    const region = await fs.readFile(path, "utf8");
    const data: Region = JSON.parse(region);
    if (isCounty) {
      const county = data?.subregions?.find((it) => it.code === code);
      if (!county) return null;
      return formatRegion({
        ...county,
        features: data.features,
        parents: [
          {
            code: data.code,
            name: data.name,
          },
          ...(data.parents || []),
        ],
      });
    }
    return formatRegion(data);
  } catch (err) {
    return null;
  }
}

type DriveMap = {
  [x: string]: {
    name: string;
    url: string;
  }[];
};

export async function restructureDrivesByCounty(drives: Drive[], regionCode: string) {
  let drivesByCounty: DriveMap = {};
  drives.forEach(({ counties, slug, name }) => {
    counties.forEach((countyCode) => {
      if (!countyCode) return;
      if (!drivesByCounty[countyCode]) {
        drivesByCounty[countyCode] = [];
      }
      drivesByCounty[countyCode].push({ name, url: `/region/${regionCode}/drives/${slug}` });
    });
  });

  const stateRegion = await getRegion(regionCode);
  const counties = stateRegion?.subregions || [];

  const unsorted =
    Object.entries(drivesByCounty).map(([key, drives]) => {
      const county = counties.find((it) => it.code === key);
      return {
        countyCode: county?.code || "",
        countyName: county?.name || "",
        drives,
      };
    }) || [];
  return unsorted.sort((a, b) => (a.countyName > b.countyName ? 1 : -1));
}

type HotspotMap = {
  [x: string]: {
    name: string;
    url: string;
  }[];
};

export async function restructureHotspotsByCounty(hotspots: Hotspot[], regionCode: string) {
  let counties: HotspotMap = {};
  hotspots.forEach(({ countyCode, url, name }) => {
    if (!countyCode) return;
    if (!counties[countyCode]) {
      counties[countyCode] = [];
    }
    counties[countyCode].push({ name, url });
  });

  const stateRegion = await getRegion(regionCode);
  const stateCounties = stateRegion?.subregions || [];

  const unsorted =
    Object.entries(counties).map(([key, hotspots]) => {
      const county = stateCounties.find((it) => it.code === key);
      return {
        countyCode: county?.code || "",
        countyName: county?.longName || "",
        hotspots,
      };
    }) || [];
  return unsorted.sort((a, b) => (a.countyName > b.countyName ? 1 : -1));
}

const cityArrays: any = {
  US: USCities,
  CA: CACities,
};

export function getCityBySlug(stateCode: string, slug: string): City | null {
  const countryCities = cityArrays[stateCode.slice(0, 2)];
  const city = countryCities.find((city: City) => city.slug === slug && city.state === stateCode);
  return city || null;
}

export function getCities(stateCode: string): City[] {
  const countryCities = cityArrays[stateCode.slice(0, 2)];
  if (!countryCities) return [];
  return countryCities.filter((city: City) => city.state === stateCode);
}

export function getAllCities(): City[] {
  return Object.values(cityArrays).flat() as City[];
}
