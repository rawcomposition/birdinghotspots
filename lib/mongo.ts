import mongoose from "mongoose";
import Hotspot from "models/Hotspot";
import Drive from "models/Drive";
import Article from "models/Article";
import Settings from "models/Settings";
import Upload from "models/Upload";
import Revision from "models/Revision";
import Group from "models/Group";
import Profile from "models/Profile";
import Log from "models/Log";
import RegionInfo from "models/RegionInfo";
import { RegionInfo as RegionInfoType, Revision as RevisionType, Hotspot as HotspotType } from "lib/types";

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

  const result = await Hotspot.find(query, ["name", "url", "iba", "noContent", "needsDeleting", "groupIds"])
    .sort({ name: 1 })
    .lean()
    .exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getHotspotsByCounty(countyCode: string) {
  await connect();
  const result = await Hotspot.find({ countyCode }, [
    "name",
    "url",
    "iba",
    "drives",
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
    ["-_id", "name", "slug", "counties"]
  )
    .sort({ name: 1 })
    .lean()
    .exec();

  return result;
}

export async function getDriveBySlug(stateCode: string, slug: string) {
  await connect();
  const result = await Drive.findOne({ stateCode, slug })
    .populate("entries.hotspot", ["url", "name", "address"])
    .lean()
    .exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getDriveById(_id: string) {
  await connect();
  const result = await Drive.findOne({ _id }).populate("entries.hotspot", ["url", "name", "address"]).lean().exec();

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

  const result = await Article.find(query, ["-_id", "name", "slug", "countryCode", "stateCode"])
    .sort({ name: 1 })
    .lean()
    .exec();

  return result;
}

export async function getArticleBySlug(region: string, slug: string) {
  await connect();

  let query: any = {};

  if (region.split("-").length === 3) {
    query = { slug, countyCode: region };
  } else if (region.split("-").length === 2) {
    query = { slug, stateCode: region };
  } else {
    query = { slug, countryCode: region };
  }

  const result = await Article.findOne(query).populate("hotspots", ["url", "name", "countyCode"]).lean().exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getArticleById(_id: string) {
  await connect();
  const result = await Article.findOne({ _id }).populate("hotspots", ["url", "name", "countyCode"]).lean().exec();

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
  const result = await Log.find({}).sort({ createdAt: -1 }).limit(300).lean().exec();

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
