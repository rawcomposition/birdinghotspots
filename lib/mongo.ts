import mongoose from "mongoose";
import Hotspot from "models/Hotspot";
import Drive from "models/Drive";
import Article from "models/Article";
import Settings from "models/Settings";
import Upload from "models/Upload";
import Revision from "models/Revision";
import Group from "models/Group";
import Profile from "models/Profile";
import City from "models/City";
import Log from "models/Log";
import RegionInfo from "models/RegionInfo";
import Regions from "data/regions.json";
import Species from "models/Species";
import SyncRegions from "data/sync-regions.json";
import {
  RegionInfo as RegionInfoType,
  Revision as RevisionType,
  Hotspot as HotspotType,
  City as CityType,
  Article as ArticleT,
  SpeciesT,
} from "lib/types";

declare global {
  var mongoose: any;
}

//https://github.com/vercel/next.js/blob/canary/examples/with-mongodb-mongoose/lib/dbConnect.js
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 2,
      maxIdleTimeMS: 60000,
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000, //Stay within Vercel's 10 second function limit
      heartbeatFrequencyMS: 10000, //Attempting to see if this reduces query timeouts
    };

    console.log("---Connecting to MongoDB---");

    try {
      cached.promise = mongoose.connect(process.env.MONGO_URI || "", opts).then((mongoose) => {
        console.log("---Connected!---");
        return mongoose;
      });
    } catch (e) {
      console.log("---Error connecting to MongoDB---", e);
      throw new Error("Error connecting to database");
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function getHotspotsByRegion(region: string) {
  await connect();

  let query: any = {};

  if (region.split("-").length === 3) {
    query = { countyCode: region };
  } else if (region.split("-").length === 2) {
    query = { stateCode: region };
  } else {
    query = { countryCode: region };
  }

  const result = await Hotspot.find(query, [
    "name",
    "drives",
    "url",
    "iba",
    "noContent",
    "needsDeleting",
    "lat",
    "lng",
    "species",
    "groupIds",
  ])
    .sort({ name: 1 })
    .lean()
    .exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getAccessibleHotspotsByState(stateCode: string) {
  await connect();
  const result = await Hotspot.find(
    {
      stateCode,
      accessible: "Yes",
    },
    ["-_id", "name", "url", "countyCode"]
  )
    .sort({ name: 1 })
    .lean()
    .exec();

  return result;
}

export async function getRoadsideHotspotsByState(stateCode: string) {
  await connect();
  const result = await Hotspot.find(
    {
      stateCode,
      roadside: "Yes",
    },
    ["-_id", "name", "url", "countyCode"]
  )
    .sort({ name: 1 })
    .lean()
    .exec();

  return result;
}

export async function getIBAHotspots(ibaSlug: string) {
  if (!ibaSlug) return [];
  await connect();
  const result = await Hotspot.find(
    {
      "iba.value": ibaSlug,
    },
    ["-_id", "name", "url", "countyCode", "locationId"]
  )
    .sort({ name: 1 })
    .lean()
    .exec();

  return result;
}

export async function getHotspotByLocationId(locationId: string, populate?: boolean) {
  await connect();
  const result = await Hotspot.findOne({ locationId })
    .populate(populate ? "groups" : "")
    .lean();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getHotspotById(id: string, fields?: string[]) {
  //Try/catch in case the id can't be converted to objectId
  try {
    await connect();
    const result = await Hotspot.findOne({ _id: id }, fields).lean().exec();
    return result ? JSON.parse(JSON.stringify(result)) : null;
  } catch (error) {
    return null;
  }
}

export async function getDrivesByState(stateCode: string) {
  await connect();
  const result = await Drive.find(
    {
      stateCode,
    },
    ["-_id", "locationId", "name", "slug", "counties"]
  )
    .sort({ name: 1 })
    .lean()
    .exec();

  return result;
}

export async function getDriveByLocationId(locationId: string) {
  await connect();
  const result = await Drive.findOne({ locationId })
    .populate("entries.hotspot", ["url", "name", "address"])
    .lean()
    .exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getArticlesByRegion(regionCode: string) {
  await connect();

  let query: any = {};

  if (regionCode.split("-").length === 2) {
    query = { stateCode: regionCode };
  } else {
    query = { countryCode: regionCode };
  }

  const result = await Article.find(query, ["-_id", "name", "articleId", "images"])
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getArticleByArticleId(articleId: string): Promise<ArticleT | null> {
  await connect();

  const result = await Article.findOne({ articleId })
    .populate("hotspots", ["url", "name", "countyCode", "stateCode", "featuredImg", "species"])
    .lean()
    .exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getSettings() {
  await connect();
  const result = await Settings.findOne({ key: "global" }).lean().exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getUploads(countries: string[], states: string[], counties: string[]) {
  await connect();
  const result = await Upload.find({
    status: "pending",
    $or: [
      { countryCode: { $in: countries || [] } },
      { stateCode: { $in: states || [] } },
      { countyCode: { $in: counties || [] } },
    ],
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getAllUploads() {
  await connect();
  const result = await Upload.find({ status: "pending" }).sort({ createdAt: -1 }).lean().exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

type RevisionProps = {
  states: string[];
  counties: string[];
  status: string;
  limit?: number;
  skip?: number;
};

export async function getRevisions({ states, counties, limit, skip, status }: RevisionProps): Promise<RevisionType[]> {
  await connect();
  const result = await Revision.find({
    status,
    $or: [{ stateCode: { $in: states || [] } }, { countyCode: { $in: counties || [] } }],
  })
    .sort({ createdAt: -1 })
    .limit(limit || 0)
    .skip(skip || 0)
    .lean();

  return result || [];
}

type AllRevisionProps = {
  status: string;
  limit?: number;
  skip?: number;
};

export async function getAllRevisions({ limit, skip, status }: AllRevisionProps): Promise<RevisionType[]> {
  await connect();
  const result = await Revision.find({ status })
    .sort({ createdAt: -1 })
    .limit(limit || 0)
    .skip(skip || 0)
    .lean();

  return result || [];
}

export async function getGroupByLocationId(locationId: string) {
  await connect();
  const result = await Group.findOne({ locationId })
    .populate("hotspots", [
      "url",
      "name",
      "featuredImg",
      "lat",
      "lng",
      "species",
      "locationId",
      "countyCode",
      "stateCode",
    ])
    .lean()
    .exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getGroupsByState(stateCode: string) {
  await connect();
  const result = await Group.find({ stateCodes: stateCode }, ["-_id", "name", "url"]).sort({ name: 1 }).lean().exec();
  return result;
}

export async function getGroupsByRegion(region: string) {
  await connect();
  let query: any = {};

  if (region.split("-").length === 3) {
    query = { countyCodes: region };
  } else if (region.split("-").length === 2) {
    query = { stateCodes: region };
  } else {
    query = { countryCode: region };
  }

  console.log(query);

  const result = await Group.find(query, ["-_id", "name", "url"]).sort({ name: 1 }).lean().exec();
  return result;
}

export async function getProfile(uid: string) {
  await connect();
  const result = await Profile.findOne({ uid }).lean().exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getProfileByCode(inviteCode: string) {
  await connect();
  const result = await Profile.findOne({ inviteCode }).lean().exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getSubscriptions(uid: string): Promise<string[]> {
  await connect();
  const result = await Profile.findOne({ uid }).lean().exec();
  return result ? result.subscriptions || [] : [];
}

export async function getLogs() {
  await connect();
  const result = await Log.find({}).sort({ createdAt: -1 }).limit(1000).lean().exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getRegionInfo(code: string): Promise<RegionInfoType[] | null> {
  await connect();
  const result = await RegionInfo.findOne({ code });
  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getHotspotsInRadius(lat: number, lng: number, radius: number): Promise<HotspotType[] | null> {
  //Convert radius from miles to radians
  const radians = radius / 3963.2;
  await connect();
  const result = await Hotspot.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radians],
      },
    },
  })
    .sort({ species: -1 })
    .lean();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getDeletedHotspots(states: string[] | null): Promise<HotspotType[] | null> {
  await connect();
  const result = await Hotspot.find({
    stateCode: states ? { $in: states } : { $exists: true },
    needsDeleting: true,
  })
    .sort({ species: -1 })
    .lean();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getActiveCities(): Promise<CityType[] | null> {
  const usStateCodes = Regions.find((it) => it.code === "US")?.subregions?.map((it) => it.code) || [];
  const caStateCodes = Regions.find((it) => it.code === "CA")?.subregions?.map((it) => it.code) || [];
  const activeStateCodes = [...usStateCodes, ...caStateCodes];

  await connect();
  const result = await City.find(
    {
      stateCode: { $in: activeStateCodes },
    },
    ["name", "locationId", "stateCode", "countryCode"]
  )
    .sort({ name: 1 })
    .lean();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getCityByLocationId(locationId: string): Promise<CityType | null> {
  await connect();
  const result = await City.findOne({ locationId }).lean();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getRegionCities(region: string): Promise<CityType[] | null> {
  await connect();
  let query: any = {};

  if (region.split("-").length === 3) {
    query = { countyCode: region };
  } else if (region.split("-").length === 2) {
    query = { stateCode: region };
  } else {
    const stateCodes =
      region === "US"
        ? SyncRegions.filter((it) => it.startsWith("US-"))
        : SyncRegions.filter((it) => it.startsWith("CA-"));
    query = { stateCode: { $in: stateCodes } };
  }

  const result = await City.find(query).sort({ name: 1 }).lean();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getRecentHotspots(regionCodes: string[]): Promise<HotspotType[] | null> {
  await connect();
  const countryCodes = regionCodes.filter((it) => it.split("-").length === 1);
  const stateCodes = regionCodes.filter((it) => it.split("-").length === 2);

  const results = await Hotspot.find({
    $or: [{ countryCode: { $in: countryCodes } }, { stateCode: { $in: stateCodes } }],
  })
    .sort({ createdAt: -1 })
    .limit(25)
    .lean();

  return results ? JSON.parse(JSON.stringify(results)) : null;
}

type ImgStat = {
  code: string;
  withImg: number;
  total: number;
};

export async function getImgStats(regionCodes: string[]): Promise<ImgStat[]> {
  await connect();
  const countryCodes = regionCodes.filter((it) => it.split("-").length === 1);
  const stateCodes = regionCodes.filter((it) => it.split("-").length === 2);

  const [countryResults, stateResults] = await Promise.all([
    Hotspot.aggregate([
      {
        $match: {
          countryCode: { $in: countryCodes },
        },
      },
      {
        $group: {
          _id: { featuredImg: { $gt: ["$featuredImg", null] }, regionCode: "$countryCode" },
          count: { $sum: 1 },
        },
      },
    ]),
    Hotspot.aggregate([
      {
        $match: {
          stateCode: { $in: stateCodes },
        },
      },
      {
        $group: {
          _id: { featuredImg: { $gt: ["$featuredImg", null] }, regionCode: "$stateCode" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const allRegionStats = [...countryResults, ...stateResults];

  const byRegion: ImgStat[] = regionCodes.map((code) => {
    const withImg =
      allRegionStats.find((stat) => stat._id.regionCode === code && stat._id.featuredImg === true)?.count || 0;
    const withoutImg =
      allRegionStats.find((stat) => stat._id.regionCode === code && stat._id.featuredImg === false)?.count || 0;
    const total = withImg + withoutImg;
    return { code, withImg, total };
  });

  return byRegion;
}

type ContentStat = {
  code: string;
  withContent: number;
  total: number;
};

export async function getContentStats(regionCodes: string[]): Promise<ContentStat[]> {
  await connect();
  const countryCodes = regionCodes.filter((it) => it.split("-").length === 1);
  const stateCodes = regionCodes.filter((it) => it.split("-").length === 2);

  const [countryResults, stateResults] = await Promise.all([
    Hotspot.aggregate([
      {
        $match: {
          countryCode: { $in: countryCodes },
        },
      },
      {
        $group: {
          _id: {
            noContent: "$noContent",
            groupIds: {
              $cond: {
                if: { $isArray: "$groupIds" },
                then: { $gt: [{ $size: "$groupIds" }, 0] },
                else: false,
              },
            },
            regionCode: "$countryCode",
          },
          count: { $sum: 1 },
        },
      },
    ]),
    Hotspot.aggregate([
      {
        $match: {
          stateCode: { $in: stateCodes },
        },
      },
      {
        $group: {
          _id: {
            noContent: "$noContent",
            groupIds: {
              $cond: {
                if: { $isArray: "$groupIds" },
                then: { $gt: [{ $size: "$groupIds" }, 0] },
                else: false,
              },
            },
            regionCode: "$stateCode",
          },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const allRegionStats = [...countryResults, ...stateResults];
  const byRegion: ContentStat[] = regionCodes.map((code) => {
    const withContentWithGroups =
      allRegionStats.find(
        (stat) => stat._id.regionCode === code && stat._id.noContent === false && stat._id.groupIds === true
      )?.count || 0;
    const withContentWithoutGroups =
      allRegionStats.find(
        (stat) => stat._id.regionCode === code && stat._id.noContent === false && stat._id.groupIds === false
      )?.count || 0;
    const withoutContentWithouotGroups =
      allRegionStats.find(
        (stat) => stat._id.regionCode === code && stat._id.noContent === true && stat._id.groupIds === false
      )?.count || 0;
    const withoutContentWithGroups =
      allRegionStats.find(
        (stat) => stat._id.regionCode === code && stat._id.noContent === true && stat._id.groupIds === true
      )?.count || 0;

    const total =
      withContentWithGroups + withContentWithoutGroups + withoutContentWithouotGroups + withoutContentWithGroups;
    const withContent = withContentWithGroups + withContentWithoutGroups + withoutContentWithGroups;
    return { code, withContent, total };
  });
  return byRegion;
}

export const getSpeciesByCode = async (code: string): Promise<SpeciesT | null> => {
  await connect();
  const result = await Species.findOne({ _id: code }).lean().exec();
  return result ? JSON.parse(JSON.stringify(result)) : null;
};

export const getAllSpecies = async (): Promise<SpeciesT[]> => {
  await connect();
  const result = await Species.find({}, ["_id", "name", "sciName", "images", "active"]).lean().exec();
  return JSON.parse(JSON.stringify(result));
};
