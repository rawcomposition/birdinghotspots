import axios from "axios";
import { GetParams, Hotspot, Token, EBirdHotspot, EBirdRegion } from "lib/types";

export function capitalize(str: string) {
  if (typeof str !== "string") return str;
  const words = str.split(" ");
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }

  return words.join(" ");
}

export async function geocode(lat: number, lng: number) {
  console.log("Geocoding", lat, lng);
  try {
    const request = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GEOCODING_KEY}`
    );
    const response = await request.json();

    let city = "";
    let state = "";
    let zip = "";
    let road = "";
    for (let i = 0; i < response.results[0].address_components.length; i++) {
      for (let j = 0; j < response.results[0].address_components[i].types.length; j++) {
        switch (response.results[0].address_components[i].types[j]) {
          case "locality":
            city = response.results[0].address_components[i].long_name;
            break;
          case "administrative_area_level_1":
            state = response.results[0].address_components[i].long_name;
            break;
          case "postal_code":
            zip = response.results[0].address_components[i].long_name;
            break;
          case "route":
            road = response.results[0].address_components[i].long_name;
            break;
        }
      }
    }
    return { city, state, zip };
  } catch (error) {
    console.error(error);
    return { city: "", state: "", zip: "" };
  }
}

export function scrollToAnchor(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  const anchor = e.currentTarget.getAttribute("href");
  if (!anchor) return;
  const element = document.querySelector(anchor);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

export const generateRandomId = (length: number = 6) => {
  return Math.random()
    .toString()
    .slice(2, length + 2);
};

//Adapted from https://www.geodatasource.com/developers/javascript
// Uses spherical law of cosines (less accurate for short distances)
export function distanceBetween(lat1: number, lon1: number, lat2: number, lon2: number, metric = false) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (metric) {
      dist = dist * 1.609344;
    }
    return parseFloat(dist.toString());
  }
}

// Uses haversine formula (more accurate for short distances)
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function createUnionFind(size: number) {
  const parent = new Int32Array(size);
  const rank = new Uint8Array(size);
  for (let i = 0; i < size; i++) parent[i] = i;

  const find = (x: number): number => {
    let p = x;
    while (parent[p] !== p) p = parent[p];
    while (parent[x] !== x) {
      const next = parent[x];
      parent[x] = p;
      x = next;
    }
    return p;
  };

  const union = (a: number, b: number): void => {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return;
    if (rank[ra] < rank[rb]) {
      parent[ra] = rb;
    } else if (rank[ra] > rank[rb]) {
      parent[rb] = ra;
    } else {
      parent[rb] = ra;
      rank[ra]++;
    }
  };

  return { find, union };
}

export function formatMarker(hotspot: Hotspot, showLink?: boolean) {
  let name = hotspot.name || "";
  if (name.includes("--")) {
    name = name.split("--")[1];
  }
  return {
    lat: hotspot.lat,
    lng: hotspot.lng,
    url: showLink ? hotspot.url : null,
    name,
    species: hotspot.species,
  };
}

export async function verifyRecaptcha(token: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const API_key = process.env.FIREBASE_KEY_FOR_RECAPTCHA;

  const verifyResponse = await fetch(
    `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${API_key}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: {
          token,
          siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_KEY,
          expectedAction: "submit",
        },
      }),
    }
  );

  const verifyData = await verifyResponse.json();
  return verifyData?.riskAnalysis?.score || 0;
}

export const getMarkerShade = (count: number) => {
  if (count === 0) return 1;
  if (count <= 15) return 2;
  if (count <= 50) return 3;
  if (count <= 100) return 4;
  if (count <= 150) return 5;
  if (count <= 200) return 6;
  if (count <= 250) return 7;
  if (count <= 300) return 8;
  if (count <= 400) return 9;
  if (count <= 500) return 10;
  return 1;
};

export function truncate(string: string, length: number) {
  return string.length > length ? `${string.substring(0, length)}...` : string;
}

export function stripHotspotSuffix(name: string) {
  const stripped = name.replace(/\(.*\)/g, "").trim();
  if (stripped.endsWith(" overall")) {
    return stripped.replace(" overall", "");
  }
  return stripped;
}

export const roles = [
  { name: "Admin", id: "admin" },
  { name: "Editor", id: "editor" },
];

export const getShortName = (name: string) => {
  if (name.includes("--")) {
    return name.split("--").pop();
  }
  return name;
};

//https://decipher.dev/30-seconds-of-typescript/docs/debounce/
export const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export const canEdit = (token: Token, region: string | string[]) => {
  if (token?.role === "admin") return true;
  if (!region || token?.role !== "editor") return false;

  if (typeof region === "string") {
    return !!token.regions?.some((it: string) => region.startsWith(it));
  }

  return region?.some((it: string) => !!token.regions?.some((myRegion: string) => it.startsWith(myRegion)));
};

export const getStaticMap = (markers: { species?: number; lat: number; lng: number }[]) => {
  const markersWithShade = markers.map((marker) => ({
    ...marker,
    shade: getMarkerShade(marker.species || 0),
  }));

  const shades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const filteredShades = shades.filter((shade) => markersWithShade.some((marker) => marker.shade === shade));

  const geoJson = JSON.stringify({
    type: "FeatureCollection",
    features: filteredShades.map((shade) => {
      const shadeMarkers = markersWithShade.filter((marker) => marker.shade === shade);
      return {
        type: "Feature",
        properties: {
          "marker-url": `https://birdinghotspots.org/markers/static/shade-${shade}.png`,
        },
        geometry: {
          type: "MultiPoint",
          coordinates: shadeMarkers.map((marker) => [
            Math.round(marker.lng * 100000) / 100000,
            Math.round(marker.lat * 100000) / 100000,
          ]),
        },
      };
    }),
  });

  const padding = markers.length > 10 ? 20 : markers.length > 5 ? 60 : markers.length > 2 ? 80 : 100;

  const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/geojson(${encodeURIComponent(
    geoJson
  )})/auto/459x296@2x?access_token=${process.env.MAPBOX_STATIC_KEY}&padding=${padding}&logo=false`;

  return mapboxUrl;
};

export async function getEbirdHotspot(locationId: string) {
  const key = process.env.NEXT_PUBLIC_EBIRD_API;
  const response = await fetch(`https://api.ebird.org/v2/ref/hotspot/info/${locationId}?key=${key}`);
  if (response.status === 200) {
    return await response.json();
  }
}

type ebirdResponseImage = {
  assetId: number;
  parentAssetId: number | null;
  ageSex: any;
  location: any;
  licenseId: string;
  mediaNotes: string | null;
  obsDt: string;
  obsDtDisplay: string;
  obsYear: number;
  obsMonth: number;
  obsDay: number;
  obsTime: number;
  restricted: boolean;
  ratingCount: number;
  rating: number;
  userId: string;
  userDisplayName: string;
  userHasProfile: boolean;
  width: number;
  height: number;
  valid: boolean;
  reviewed: boolean;
  tags: string[];
  taxonomy: any;
  assetState: string;
  mediaType: string;
  source: string;
  exoticCategory: string | null;
  cursorMark: string | null;
  ebirdChecklistId: string;
};

export async function getEbirdHotspotImages(locationId: string, throwError = true) {
  const EBIRD_SEARCH_API_URL = "https://ebird.org/ml-search-api/v2/search";
  const url = `${EBIRD_SEARCH_API_URL}?count=6&unconfirmed=incl&sort=rating_rank_desc&regionCode=${locationId}&tag=environmental`;

  try {
    const response = await axios.get<ebirdResponseImage[]>(url, {
      headers: {
        // This user agent seems to be allowed by eBird
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
      maxRedirects: 2,
    });

    const images = response.data;
    if (!Array.isArray(images)) throw new Error("Invalid response from eBird");

    return images;
  } catch (error) {
    if (throwError) {
      throw error;
    }
    return [];
  }
}

export const get = async (url: string, params: GetParams) => {
  const cleanParams = Object.keys(params).reduce((accumulator: any, key) => {
    if (params[key]) accumulator[key] = params[key];
    return accumulator;
  }, {});

  const queryParams = new URLSearchParams(cleanParams).toString();

  let fullUrl = url;
  if (url.includes("?") && queryParams) {
    fullUrl = `${url}&${queryParams}`;
  } else if (queryParams) {
    fullUrl = `${url}?${queryParams}`;
  }

  const res = await fetch(fullUrl, {
    method: "GET",
  });

  let json: any = {};

  try {
    json = await res.json();
  } catch (error) {}
  if (!res.ok) {
    if (res.status === 404) throw new Error("Route not found");
    if (res.status === 405) throw new Error("Method not allowed");
    if (res.status === 504) throw new Error("Operation timed out. Please try again.");
    throw new Error(json.message || "An error occurred");
  }
  return json;
};

export const getHotspotsForRegion = async (region: string) => {
  console.log(`Fetching eBird hotspots for ${region}`);
  const response = await fetch(
    `https://api.ebird.org/v2/ref/hotspot/${region}?fmt=json&key=${process.env.NEXT_PUBLIC_EBIRD_API}`
  );

  const json = await response.json();

  if ("errors" in json) {
    throw "Error fetching eBird photos";
  }

  return json.map((hotspot: EBirdHotspot) => ({
    locationId: hotspot.locId,
    name: hotspot.locName.trim(),
    lat: hotspot.lat,
    lng: hotspot.lng,
    total: hotspot.numSpeciesAllTime || 0,
    countryCode: hotspot.countryCode,
    subnational1Code: hotspot.subnational1Code,
    subnational2Code: hotspot.subnational2Code,
  }));
};

export const getRegion = async (region: string): Promise<EBirdRegion> => {
  const response = await fetch(
    `https://api.ebird.org/v2/ref/region/info/${region}?fmt=json&key=${process.env.NEXT_PUBLIC_EBIRD_API}`
  );
  const json = await response.json();
  return json;
};
