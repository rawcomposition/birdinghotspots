import { Hotspot, Drive, Marker } from "lib/types";
import { getCountyByCode } from "lib/localData";

export function slugify(title?: string) {
  if (!title) return null;
  const slug = title
    .toLowerCase()
    .replace("’s", "s")
    .replace("'s", "s")
    .replace(/[^a-z0-9]+/g, "-");
  return slug.endsWith("-") ? slug.slice(0, -1) : slug;
}

const gpsModalConfig = (editor: any) => ({
  title: "Link to Google Maps",
  body: {
    type: "panel",
    items: [
      {
        type: "input",
        name: "latlng",
        label: "Enter Lat/Lng (e.g. 40.712,-74.006)",
      },
    ],
  },
  buttons: [
    {
      type: "cancel",
      name: "closeButton",
      text: "Cancel",
    },
    {
      type: "submit",
      name: "submitButton",
      text: "Insert",
      buttonType: "primary",
    },
  ],
  onSubmit: (api: any) => {
    const data = api.getData();
    const latlng = data.latlng;

    editor.execCommand(
      "mceInsertContent",
      false,
      `<a href='https://www.google.com/maps/search/?api=1&query=${latlng}' class='map-link mceNonEditable' target='_blank'>View Map</a>`
    );
    api.close();
  },
});

export const tinyConfig = {
  menubar: false,
  plugins: "link autoresize lists noneditable",
  toolbar: "bold italic underline bullist link | insertgps",
  content_style: `body { font-family:Helvetica,Arial,sans-serif; font-size:14px } .map-link { display: inline-block; background: #f5f5f5; padding: 1px 4px; border-radius: 3px; color: #333; text-decoration: none; } .map-link::before { content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="15" style="fill: rgb(194,65,13)" class="icon"><path d="M408 119.1C408 128.6 406.2 138.3 402.1 148.6C397.3 166.1 387.4 187.5 375.6 207.8L375.5 207.1C372.4 213.3 369.2 218.7 365.9 224C361.5 231 356.9 237.1 352.4 244.8L352 245.4C333.9 272.3 315.3 296.4 302.8 311.1C295.1 321.6 280.9 321.6 273.2 311.1C260.7 296.4 242.1 272.3 224 245.4C205.6 218.1 187.7 187.9 177.3 160.9C176.5 158.8 175.7 156.7 174.1 154.6C170.6 142 168 130.3 168 120C168 115.3 168.3 110.7 168.8 106.2C175.6 46.44 226.4 0 288 0C354.3 0 408 53.73 408 120V119.1zM288 151.1C310.1 151.1 328 134.1 328 111.1C328 89.91 310.1 71.1 288 71.1C265.9 71.1 248 89.91 248 111.1C248 134.1 265.9 151.1 288 151.1zM352 300.6C365.5 282.4 380.8 260.7 394.7 238.2C396.5 235.3 398.2 232.4 400 229.5V453.7L528 407.2V154.3L419.3 193.8C421.5 189.1 423.6 184.5 425.6 179.8C431.5 165.8 436.6 150.7 438.8 135.6L543.8 97.44C551.2 94.77 559.4 95.85 565.8 100.3C572.2 104.8 576 112.2 576 119.1V424C576 434.1 569.7 443.1 560.2 446.6L384.2 510.6C378.9 512.5 373.1 512.5 367.8 510.6L200 449.5L32.2 510.6C24.84 513.2 16.64 512.2 10.23 507.7C3.819 503.2 0 495.8 0 488V183.1C0 173.9 6.314 164.9 15.8 161.4L136 117.7C136 118.5 136 119.2 136 119.1C136 135.1 139.7 150.7 144.9 165.6L48 200.8V453.7L176 407.2V229.5C177.8 232.4 179.5 235.3 181.3 238.2C195.2 260.7 210.5 282.4 224 300.6V407.2L352 453.7V300.6z" /></svg>'); margin-right: 4px; }`,
  branding: false,
  elementpath: false,
  valid_elements: "p,a[href|rel|target|class],strong/b,em/i,u,strike,br,ul,ol,li,cite", //TODO: Remove cite at a later point
  autoresize_bottom_margin: 0,
  convert_urls: false,
  browser_spellcheck: true,
  contextmenu: false,
  setup: (editor: any) => {
    editor.ui.registry.addButton("insertgps", {
      text: "Google Maps Link",
      onAction: () => editor.windowManager.open(gpsModalConfig(editor)),
    });
  },
};

export function capitalize(str: string) {
  if (typeof str !== "string") return str;
  const words = str.split(" ");
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }

  return words.join(" ");
}

type HotspotMap = {
  [x: string]: {
    name: string;
    url: string;
  }[];
};

export function restructureHotspotsByCounty(hotspots: Hotspot[]) {
  let counties: HotspotMap = {};
  hotspots.forEach(({ countyCode, url, name }) => {
    if (!countyCode) return;
    if (!counties[countyCode]) {
      counties[countyCode] = [];
    }
    counties[countyCode].push({ name, url });
  });

  const unsorted =
    Object.entries(counties).map(([key, hotspots]) => {
      const county = getCountyByCode(key);
      return {
        countySlug: county?.slug || "",
        countyName: county?.longName || "",
        hotspots,
      };
    }) || [];
  return unsorted.sort((a, b) => (a.countyName > b.countyName ? 1 : -1));
}

type DriveMap = {
  [x: string]: {
    name: string;
    url: string;
  }[];
};

export function restructureDrivesByCounty(drives: Drive[], countrySlug: string, stateSlug: string) {
  let drivesByCounty: DriveMap = {};
  drives.forEach(({ counties, slug, name }) => {
    counties.forEach((countyCode) => {
      if (!countyCode) return;
      if (!drivesByCounty[countyCode]) {
        drivesByCounty[countyCode] = [];
      }
      drivesByCounty[countyCode].push({ name, url: `/${countrySlug}/${stateSlug}/drive/${slug}` });
    });
  });

  const unsorted =
    Object.entries(drivesByCounty).map(([key, drives]) => {
      const county = getCountyByCode(key);
      return {
        countySlug: county?.slug || "",
        countyName: county?.longName || "",
        drives,
      };
    }) || [];
  return unsorted.sort((a, b) => (a.countyName > b.countyName ? 1 : -1));
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

export async function getEbirdHotspot(locationId: string) {
  const key = process.env.NEXT_PUBLIC_EBIRD_API;
  const response = await fetch(`https://api.ebird.org/v2/ref/hotspot/info/${locationId}?key=${key}`);
  if (response.status === 200) {
    return await response.json();
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

export const generateRandomId = () => {
  return Math.random().toString().slice(2, 8);
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
  let name = hotspot.name;
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
  return "#bcbcbc";
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
