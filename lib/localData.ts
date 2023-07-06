import States from "data/states.json";
import OhioRegions from "data/oh-regions.json";
import ArizonaCounties from "data/counties/az-counties.json";
import OhioCounties from "data/counties/oh-counties.json";
import VermontCounties from "data/counties/vt-counties.json";
import RhodeIslandCounties from "data/counties/ri-counties.json";
import NewMexicoCounties from "data/counties/nm-counties.json";
import MichiganCounties from "data/counties/mi-counties.json";
import MassachusettsCounties from "data/counties/ma-counties.json";
import KentuckyCounties from "data/counties/ky-counties.json";
import GeorgiaCounties from "data/counties/ga-counties.json";
import NewHampshireCounties from "data/counties/nh-counties.json";
import TexasCounties from "data/counties/tx-counties.json";
import CaliforniaCounties from "data/counties/ca-counties.json";
import ArkansasCounties from "data/counties/ar-counties.json";
import OntarioCounties from "data/counties/on-counties.json";
import ConnecticutCounties from "data/counties/ct-counties.json";
import IowaCounties from "data/counties/ia-counties.json";
import MaineCounties from "data/counties/me-counties.json";
import HawaiiCounties from "data/counties/hi-counties.json";
import AlabamaCounties from "data/counties/al-counties.json";
import MissouriCounties from "data/counties/mo-counties.json";
import VirginiaCounties from "data/counties/va-counties.json";
import IllinoisConties from "data/counties/il-counties.json";
import ColoradoCounties from "data/counties/co-counties.json";
import SouthDakotaCounties from "data/counties/sd-counties.json";
import IndianaCounties from "data/counties/in-counties.json";
import { capitalize } from "./helpers";
import { County, City, Region } from "lib/types";
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
  "US-AL": AlabamaCounties,
  "US-MO": MissouriCounties,
  "US-VA": VirginiaCounties,
  "US-IL": IllinoisConties,
  "US-CO": ColoradoCounties,
  "US-SD": SouthDakotaCounties,
  "US-IN": IndianaCounties,
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
