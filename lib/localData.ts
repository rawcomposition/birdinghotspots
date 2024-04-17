import { Region, Drive, Hotspot } from "lib/types";
import Regions from "data/regions.json";

const formatRegion = (region: Omit<Region, "detailedName">): Region => {
  let detailedName = region.name;
  if (region.parents?.length === 2) {
    detailedName = `${region.name}, ${region.parents[0].name}, ${region.parents[1].name.replace(
      "United States",
      "US"
    )}`;
  } else if (region.parents?.length === 1) {
    detailedName = `${region.name}, ${region.parents[0].name.replace("United States", "US")}`;
  }
  return {
    ...region,
    detailedName,
  };
};

export function getRegion(code: string): Region | null {
  if (!code) return null;
  const regions = Regions as Region[];
  const pieces = code.split("-");
  let region = null;

  if (pieces.length === 3) {
    // County
    const countryCode = pieces[0];
    const stateCode = `${pieces[0]}-${pieces[1]}`;
    const countyCode = code;

    const country = regions.find((it) => it.code === countryCode);
    const state = country?.subregions?.find((it) => it.code === stateCode);
    const county = state?.subregions?.find((it) => it.code === countyCode);

    if (county && state && country) {
      region = formatRegion({
        ...county,
        features: state.features || [],
        longName: county.longName || `${county.name} County`,
        parents: [
          {
            code: state.code,
            name: state.name,
          },
          {
            code: country.code,
            name: country.name,
          },
        ],
      });
    }
  } else if (pieces.length === 2) {
    // State
    const countryCode = pieces[0];
    const stateCode = code;

    const country = Regions.find((it) => it.code === countryCode);
    const state = country?.subregions?.find((it) => it.code === stateCode);

    if (state && country) {
      region = formatRegion({
        ...state,
        longName: state.name,
        parents: [
          {
            code: country.code,
            name: country.name,
          },
        ],
      });
    }
  } else if (pieces.length === 1) {
    // Country
    const countryCode = code;

    const country = Regions.find((it) => it.code === countryCode) as Region;

    if (country) {
      region = formatRegion({
        ...country,
        longName: country.name,
        subregions: country.subregions?.map(({ subregions, ...rest }) => rest),
      });
    }
  }

  if (!region && pieces.length > 1) {
    return getRegion(pieces.slice(0, pieces.length - 1).join("-"));
  }
  return region || null;
}

type DriveMap = {
  [x: string]: {
    name: string;
    url: string;
  }[];
};

export async function restructureDrivesByCounty(drives: Drive[], regionCode: string) {
  let drivesByCounty: DriveMap = {};
  drives.forEach(({ counties, locationId, name }) => {
    counties.forEach((countyCode) => {
      if (!countyCode) return;
      if (!drivesByCounty[countyCode]) {
        drivesByCounty[countyCode] = [];
      }
      drivesByCounty[countyCode].push({ name, url: `/drive/${locationId}` });
    });
  });

  const stateRegion = getRegion(regionCode);
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

  const stateRegion = getRegion(regionCode);
  const stateCounties = stateRegion?.subregions || [];

  const unsorted =
    Object.entries(counties).map(([key, hotspots]) => {
      const county = stateCounties.find((it) => it.code === key);
      return {
        countyCode: county?.code || "",
        countyName: county?.name || "",
        hotspots,
      };
    }) || [];
  return unsorted.sort((a, b) => (a.countyName > b.countyName ? 1 : -1));
}
