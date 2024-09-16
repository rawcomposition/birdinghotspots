export type KeyValue = {
  [key: string]: any;
};

export type Image = {
  xsUrl?: string;
  smUrl: string;
  lgUrl: string;
  by?: string;
  email?: string;
  uid?: string;
  isMap?: boolean;
  isStreetview?: boolean;
  isPublicDomain?: boolean;
  width?: number;
  height?: number;
  size?: number;
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
  url?: string;
};

export type Hotspot = {
  name: string;
  _id?: string;
  url: string;
  lat: number;
  lng: number;
  zoom: number;
  locationId: string;
  countryCode: string;
  stateCode?: string;
  countyCode?: string;
  about?: string;
  tips?: string;
  birds?: string;
  hikes?: string;
  webpage?: string;
  citeWebpage?: boolean;
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
      locationId: string;
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
  createdAt: string;
  updatedAt?: string;
};

export type HotspotsByCounty = [
  {
    countyCode: string;
    countyName: string;
    hotspots: {
      name: string;
      url: string;
    }[];
  }
];

export type DrivesByCounty = [
  {
    countyCode: string;
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
  locationId: string;
  name: string;
  countryCode: string;
  stateCode: string;
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
  articleId: string;
  int: number;
  name: string;
  countryCode: string;
  stateCode?: string;
  content: string;
  images?: Image[];
  hotspots: [Hotspot];
  sortHotspotsBy: "region" | "species" | "none";
};

export type ArticleInputs = {
  _id?: string;
  name: string;
  countryCode: string;
  stateCode: string;
  content: string;
  images?: Image[];
  sortHotspotsBy: "region" | "species" | "none";
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
  locationId: string;
  driveId: string;
};

export type User = {
  uid?: string;
  email?: string;
  displayName?: string;
  role?: string;
  regions?: Region[];
  status?: string;
};

export type Group = {
  name: string;
  _id?: string;
  mapImgUrl?: string;
  url: string;
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
  webpage?: string;
  citeWebpage?: boolean;
  citations?: Citation[];
  restrooms?: string;
  images?: Image[];
  hotspots: [Hotspot];
  hotspotCount?: number;
  updatedAt?: string;
};

export interface GroupInputs extends Group {
  hotspotSelect: {
    label: string;
    value: string;
  }[];
}

export type Revision = {
  _id?: string;
  name: string;
  locationId: string;
  countryCode: string;
  stateCode?: string;
  countyCode?: string;
  about?: {
    old: string;
    new: string;
  };
  tips?: {
    old: string;
    new: string;
  };
  birds?: {
    old: string;
    new: string;
  };
  hikes?: {
    old: string;
    new: string;
  };
  notes?: string;
  roadside?: {
    old: string;
    new: string;
  };
  restrooms?: {
    old: string;
    new: string;
  };
  accessible?: {
    old: string;
    new: string;
  };
  fee?: {
    old: string;
    new: string;
  };
  by: string;
  email: string;
  status: string;
  createdAt: string;
};

export type Profile = {
  uid: string;
  email: string;
  name: string;
  inviteCode?: string;
  subscriptions: string[];
  emailFrequency: "daily" | "instant" | "none";
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
  websitesHeading?: string;
  socialHeading?: string;
  clubsHeading?: string;
  websiteLinks?: Link[];
  socialLinks?: Link[];
  clubLinks?: Link[];
};

export interface FormattedSuggestion extends Revision {
  hasMultiple?: boolean;
  locationName: string;
  about?: {
    old: string;
    new: string;
    diff: string;
  };
  tips?: {
    old: string;
    new: string;
    diff: string;
  };
  birds?: {
    old: string;
    new: string;
    diff: string;
  };
  hikes?: {
    old: string;
    new: string;
    diff: string;
  };
}

export type Pageview = {
  count: number;
  locationId?: string;
  stateCode?: string;
  countyCode?: string;
  countryCode?: string;
  entity: "hotspot" | "group" | "region";
  year: number;
  month: number;
};

export type SpeciesT = {
  _id: string;
  hasImg: boolean;
  name: string;
  sciName: string;
  order: number;
  source: string;
  sourceId: string;
  width: number;
  height: number;
  author: string;
  license: string;
  active: boolean;
};

export type Token = {
  uid: string;
  role?: string;
  regions?: string[];
  name?: string;
  isAdmin?: boolean;
};

export type City = {
  name: string;
  locationId: string;
  countryCode: string;
  stateCode: string;
  countyName: string;
  lat: number;
  lng: number;
  pop: number;
  density: number;
  tz: string;
};

export type Region = {
  code: string;
  name: string;
  detailedName: string;
  longName?: string;
  altName?: string;
  subregions?: Region[];
  parents?: {
    code: string;
    name: string;
  }[];
  features?: string[];
  subheading?: string;
};

export type RegionStatsT = {
  total: number;
  withImg: number;
  withContent: number;
  withoutContent: number;
  withoutImg: number;
};

export type PhotoBatchT = {
  _id?: string;
  locationId: string;
  name: string;
  locationName?: string;
  by: string;
  email: string;
  uid: string;
  countryCode: string;
  stateCode: string;
  countyCode: string;
  images: {
    _id?: string;
    xsUrl: string;
    smUrl: string;
    lgUrl: string;
    width: number;
    height: number;
    size: number;
    caption: string;
    status: string;
  }[];
  createdAt: string;
};

export type SourceInfoT = {
  author: string;
  width: number;
  height: number;
};
