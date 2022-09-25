import States from "data/states.json";
import OhioRegions from "data/oh-regions.json";
import ArizonaCounties from "data/az-counties.json";
import OhioCounties from "data/oh-counties.json";
import VermontCounties from "data/vt-counties.json";
import RhodeIslandCounties from "data/ri-counties.json";
import NewMexicoCounties from "data/nm-counties.json";
import MichiganCounties from "data/mi-counties.json";
import MassachusettsCounties from "data/ma-counties.json";
import KentuckyCounties from "data/ky-counties.json";
import GeorgiaCounties from "data/ga-counties.json";
import NewHampshireCounties from "data/nh-counties.json";
import TexasCounties from "data/tx-counties.json";
import { capitalize } from "./helpers";
import { County } from "lib/types";

const countyArrays: any = {
  "US-OH": OhioCounties,
  "US-AZ": ArizonaCounties,
  "US-VT": VermontCounties,
  "US-RI": RhodeIslandCounties,
  "US-NM": NewMexicoCounties,
  "US-MI": MichiganCounties,
  "US-MA": MassachusettsCounties,
  "US-KY": KentuckyCounties,
  "US-GA": GeorgiaCounties,
  "US-NH": NewHampshireCounties,
  "US-TX": TexasCounties,
};

export function getState(param: string) {
  const data = States.find((state) => state.slug === param);
  return data;
}

export function getStateByCode(code: string) {
  const data = States.find((state) => state.code === code);
  return data;
}

export function getCountyByCode(code: string) {
  if (!code) return null;
  const pieces = code.split("-");
  const stateCode = `${pieces[0]}-${pieces[1]}`;
  const array = countyArrays[stateCode];
  if (!array) return null;
  const county = array.find((county: County) => county.ebirdCode === code);
  if (!county) return null;

  return formatCounty(stateCode, county);
}

export function getLocationText(countyCode: string, hideState?: boolean, hideCountry?: boolean) {
  if (!countyCode) return null;
  const pieces = countyCode.split("-");
  const stateCode = `${pieces[0]}-${pieces[1]}`;
  const array = countyArrays[stateCode];
  if (!array) return null;
  const county = array.find((county: County) => county.ebirdCode === countyCode);
  const state = getStateByCode(stateCode);
  if (!county || !state) return null;
  let result = `${capitalize(county.slug.replaceAll("-", " "))} County`;
  if (!hideState) {
    result = `${result}, ${state?.label}`;
  }
  if (!hideCountry) {
    result = `${result}, ${state?.country}`;
  }
  return result;
}

export function getCountyBySlug(stateCode: string, countySlug: string) {
  const slug = countySlug.replace("-county", "");
  const array = countyArrays[stateCode];
  if (!array) return null;
  const county = array.find((county: County) => county.slug === slug);
  if (!county) return null;

  return formatCounty(stateCode, county);
}

function formatCounty(stateCode: string, county: County) {
  const { region: regionCode, ebirdCode, slug } = county;
  const region = regionCode && stateCode === "US-OH" ? (OhioRegions as any)[regionCode] : {};
  return {
    slug,
    name: capitalize(slug.replaceAll("-", " ")),
    region: region || null,
    ebirdCode,
    regionLabel: region?.label || null,
    color: region?.color || "#4a84b2",
  };
}

export function getCounties(stateCode: string) {
  return formatCountyArray(countyArrays[stateCode]);
}

export function getAllCounties(limitStates?: string[] | null) {
  const counties: any = [];
  Object.entries(countyArrays).forEach(([stateCode, array]: any) => {
    if (limitStates && !limitStates.includes(stateCode)) return;
    const stateSlug = getStateByCode(stateCode)?.slug;
    array.forEach(({ slug, ebirdCode }: County) => {
      const name = capitalize(slug.replaceAll("-", " "));
      counties.push({ slug, code: ebirdCode, name: `${name} County, ${stateCode.split("-").pop()}, US`, stateSlug });
    });
  });
  return counties;
}

export function formatCountyArray(counties: County[]) {
  if (!counties) return null;
  return counties.map((county) => ({
    ...county,
    name: capitalize(county.slug.replaceAll("-", " ")),
  }));
}

export function getRegionLabel(region: string) {
  if (!region) return null;
  if (!region.includes("-")) return region;
  const pieces = region.split("-");
  const isCounty = pieces.length === 3;
  if (isCounty) {
    const county = getCountyByCode(region);
    return `${county?.name} County, ${pieces[1]}, ${pieces[0]}`;
  }
  const state = getStateByCode(region);
  return `${state?.label}, ${state?.country}`;
}
