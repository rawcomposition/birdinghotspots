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
import CaliforniaCounties from "data/ca-counties.json";
import ArkansasCounties from "data/ar-counties.json";
import OntarioCounties from "data/on-counties.json";
import ConnecticutCounties from "data/ct-counties.json";
import IowaCounties from "data/ia-counties.json";
import MaineCounties from "data/me-counties.json";
import HawaiiCounties from "data/hi-counties.json";
import { capitalize } from "./helpers";
import { County, City } from "lib/types";
import USCities from "data/cities/us.json";
import CACities from "data/cities/ca.json";

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
  "US-CA": CaliforniaCounties,
  "US-AR": ArkansasCounties,
  "US-CT": ConnecticutCounties,
  "CA-ON": OntarioCounties,
  "US-IA": IowaCounties,
  "US-ME": MaineCounties,
  "US-HI": HawaiiCounties,
};

const cityArrays: any = {
  US: USCities,
  CA: CACities,
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
  const county = array.find((county: County) => county.code === code);
  if (!county) return null;

  return formatCounty(stateCode, county);
}

export function getLocationText(countyCode: string, hideState?: boolean, hideCountry?: boolean) {
  if (!countyCode) return null;
  const pieces = countyCode.split("-");
  const stateCode = `${pieces[0]}-${pieces[1]}`;
  const array = countyArrays[stateCode];
  if (!array) return null;
  const county = array.find((county: County) => county.code === countyCode);
  const state = getStateByCode(stateCode);
  if (!county || !state) return null;
  const formattedCounty = formatCounty(stateCode, county);
  let result = formattedCounty.name;
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
  const { region: regionCode, code, slug, name, longName } = county;
  const region = regionCode && stateCode === "US-OH" ? (OhioRegions as any)[regionCode] : {};
  const deSlugged = capitalize(slug.replaceAll("-", " "));
  return {
    slug,
    name: name || deSlugged,
    longName: longName || `${deSlugged} County`,
    region: region || null,
    code: code,
    regionLabel: region?.label || null,
    color: region?.color || "#4a84b2",
  };
}

export function getCounties(stateCode: string) {
  const counties: County[] = countyArrays[stateCode];
  if (!counties) return null;
  return counties.map((county: County) => formatCounty(stateCode, county));
}

export function getAllCounties(limitStates?: string[] | null) {
  const counties: any = [];
  Object.entries(countyArrays).forEach(([stateCode, array]: any) => {
    if (limitStates && !limitStates.includes(stateCode)) return;
    const state = getStateByCode(stateCode);
    array.forEach((county: County) => {
      counties.push({
        ...formatCounty(stateCode, county),
        stateSlug: state?.slug,
        stateLabel: state?.label,
        country: state?.country,
      });
    });
  });
  return counties;
}

export function getRegionLabel(region: string) {
  if (!region) return null;
  if (!region.includes("-")) return region;
  const pieces = region.split("-");
  const isCounty = pieces.length === 3;
  if (isCounty) {
    const county = getCountyByCode(region);
    return `${county?.name}, ${pieces[1]}, ${pieces[0]}`;
  }
  const state = getStateByCode(region);
  return `${state?.label}, ${state?.country}`;
}

export function getCityBySlug(stateCode: string, slug: string): City | null {
  const countryCities = cityArrays[stateCode.slice(0, 2)];
  const city = countryCities.find((city: City) => city.slug === slug && city.state === stateCode);
  return city || null;
}

export function getCities(stateCode: string) {
  const countryCities = cityArrays[stateCode.slice(0, 2)];
  if (!countryCities) return [];
  return countryCities.filter((city: City) => city.state === stateCode);
}

export function getAllCities(): City[] {
  return Object.values(cityArrays).flat() as City[];
}
