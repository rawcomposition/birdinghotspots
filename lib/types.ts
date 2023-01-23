export type KeyValue = {
  [key: string]: any;
};

export type State = {
  label: string;
  code: string;
  slug: string;
  features: string[];
  portal?: string;
  coordinates: string;
  mapZoom: number;
  country: string;
  noMap?: boolean;
  subheading?: string;
};

export type County = {
  slug: string;
  name: string;
  longName?: string;
  region: string | null;
  code: string;
  regionLabel: string | null;
};

export type Image = {
  smUrl: string;
  lgUrl: string;
  originalUrl: string;
  by?: string;
  email?: string;
  uid?: string;
  isMap?: boolean;
  isStreetview?: boolean;
  isPublicDomain?: boolean;
  width?: number;
  height?: number;
  preview?: string;
  caption?: string;
  legacy?: boolean;
  isNew?: boolean; //temporarily added after uploaded
  id?: string; //temporarily added after uploaded
  streetviewData?: any;
  hideFromChildren?: boolean;
};

export type Marker = {
  name: string;
  lat: number;
  lng: number;
  type: string;
  url?: string;
  species?: number;
};

export type Link = {
  label: string;
  url: string;
  cite?: boolean;
};

export type Citation = {
  label: string;
  url: string;
};

export type Hotspot = {
  name: string;
  _id?: string;
  url: string;
  slug: string;
  oldSlug?: string;
  lat: number;
  lng: number;
  zoom: number;
  locationId: string;
  countryCode: string;
  stateCode: string;
  countyCode?: string;
  countySlug: string;
  about?: string;
  tips?: string;
  birds?: string;
  hikes?: string;
  address?: string;
  links?: Link[];
  citations?: Citation[];
  restrooms?: string;
  roadside?: string;
  accessible?: string;
  fee?: string;
  iba?: {
    value: string;
    label: string;
  };
  drives?: [
    {
      slug: string;
      name: string;
      driveId: string;
    }
  ];
  groups?: Group[];
  images?: Image[];
  featuredImg?: Image;
  species?: number;
  groupIds?: string[] | Group[];
  noContent?: boolean;
  needsDeleting?: boolean;
};

export type HotspotsByCounty = [
  {
    countySlug: string;
    countyName: string;
    hotspots: {
      name: string;
      url: string;
    }[];
  }
];

export type DrivesByCounty = [
  {
    countySlug: string;
    countyName: string;
    drives: {
      name: string;
      url: string;
    }[];
  }
];

export type IBA = {
  name: string;
  slug: string;
  code: string;
  ebirdLocations?: string;
  webpage: string;
  about: string;
};

export type EbirdHotspot = {
  locationId: string;
  name: string;
  latitude: number;
  longitude: number;
  subnational1Code: string;
  subnational2Code: string;
};

export type Drive = {
  _id?: string;
  name: string;
  countryCode: string;
  stateCode: string;
  slug: string;
  description: string;
  mapId: string;
  counties: string[];
  images?: Image[];
  entries: [
    {
      hotspot: Hotspot;
      description: string;
    }
  ];
};

export type DriveInputs = {
  _id?: string;
  name: string;
  countryCode: string;
  stateCode: string;
  slug: string;
  description: string;
  mapId: string;
  counties: string[];
  images?: Image[];
  entries: [
    {
      hotspotSelect: {
        label: string;
        value: string;
      };
      description: string;
    }
  ];
};

export type Article = {
  _id?: string;
  name: string;
  countryCode: string;
  stateCode: string;
  slug: string;
  content: string;
  images?: Image[];
  hotspots: [Hotspot];
};

export type ArticleInputs = {
  _id?: string;
  name: string;
  countryCode: string;
  stateCode: string;
  slug: string;
  content: string;
  images?: Image[];
  hotspotSelect: {
    label: string;
    value: string;
  }[];
};

export type LocationSearchValue = {
  label: string;
  lat: number;
  lng: number;
};

export type Upload = {
  locationId: string;
  countryCode: string;
  stateCode: string;
  countyCode: string;
  smUrl: string;
  lgUrl: string;
  originalUrl: string;
  by: string;
  email: string;
  uid?: string;
  width?: number;
  height?: number;
  caption?: string;
  createdAt: Date;
  status: string;
  _id?: string;
};

export type NotableReport = {
  location: string;
  date: string;
  checklistId: string;
  lat: number;
  lng: number;
  hasRichMedia: boolean;
  approved: boolean;
  countyName: string;
  userDisplayName: string;
  id: string;
};

export type HotspotDrive = {
  name: string;
  slug: string;
  driveId: string;
};

export type User = {
  uid?: string;
  email?: string;
  displayName?: string;
  role?: string;
  regions?: string[];
  status?: string;
};

export type Group = {
  name: string;
  _id?: string;
  url: string;
  lat: number;
  lng: number;
  zoom: number;
  locationId: string;
  countryCode: string;
  stateCodes: string[];
  countyCodes: string[];
  about?: string;
  tips?: string;
  birds?: string;
  hikes?: string;
  address?: string;
  links?: Link[];
  citations?: Citation[];
  restrooms?: string;
  images?: Image[];
  hotspots: [Hotspot];
};

export interface GroupInputs extends Group {
  hotspotSelect: {
    label: string;
    value: string;
  }[];
}

export type Revision = {
  _id?: string;
  locationId: string;
  countryCode: string;
  stateCode: string;
  countyCode: string;
  about?: string;
  tips?: string;
  birds?: string;
  hikes?: string;
  notes?: string;
  roadside: string;
  restrooms: string;
  accessible: string;
  fee: string;
  by: string;
  email: string;
  status: string;
  createdAt: string;
};

export type Profile = {
  uid: string;
  email: string;
  inviteCode?: string;
  subscriptions: string[];
};

export type Log = {
  _id?: string;
  uid: string;
  user: string;
  message: string;
  type: string;
  hotspotId?: string;
  groupId?: string;
  driveId?: string;
  createdAt: string;
};

export type RegionInfo = {
  stateCode: string;
  websiteHeading?: string;
  socialHeading?: string;
  clubsHeading?: string;
  websiteLinks?: Link[];
  socialLinks?: Link[];
  clubLinks?: Link[];
};
