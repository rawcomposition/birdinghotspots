import { Hotspot, Marker, Token } from "lib/types";

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
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_KEY}`
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
  const projectId = "birding-262815";
  const API_key = process.env.NEXT_PUBLIC_GOOGLE_KEY;

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
