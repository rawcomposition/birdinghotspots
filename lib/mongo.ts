import mongoose from "mongoose";
import Hotspot from "models/Hotspot";
import Drive from "models/Drive";
import Article from "models/Article";
import Settings from "models/Settings";
import Upload from "models/Upload";
import Group from "models/Group";

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);
export default connect;

export async function getHotspotsByState(stateCode: string) {
  await connect();
  const result = await Hotspot.find({ stateCode }, [
    "-_id",
    "name",
    "url",
    "iba",
    "noContent",
    "needsDeleting",
    "groups",
  ])
    .sort({ name: 1 })
    .lean()
    .exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getHotspotsByCounty(countyCode: string) {
  await connect();
  const result = await Hotspot.find({ countyCode }, ["-_id", "name", "url", "iba", "drives", "noContent"])
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
      accessible: { $ne: null },
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

export async function getLatestHotspots() {
  await connect();
  const result = await Hotspot.find({}, ["-_id", "name", "url", "countyCode", "stateCode", "createdAt"])
    .sort({ createdAt: -1 })
    .limit(200)
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
  const result = await Hotspot.findOne({ locationId }).lean().exec();
  if (populate && result?._id) {
    result.groups = await Group.find({ hotspots: result._id }).lean().exec();
  }

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

export async function getArticlesByState(stateCode: string) {
  await connect();
  const result = await Article.find(
    {
      stateCode,
    },
    ["-_id", "name", "slug"]
  )
    .sort({ name: 1 })
    .lean()
    .exec();

  return result;
}

export async function getArticleBySlug(stateCode: string, slug: string) {
  await connect();
  const result = await Article.findOne({ stateCode, slug })
    .populate("hotspots", ["url", "name", "countyCode"])
    .lean()
    .exec();

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

export async function getUploads(regions: string[]) {
  await connect();
  let query: any = { status: "pending" };
  if (regions !== null) {
    query = { ...query, stateCode: { $in: regions || [] } };
  }
  const result = await Upload.find(query).sort({ name: 1 }).lean().exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getImgStats() {
  await connect();
  const result = await Hotspot.aggregate([
    {
      $group: {
        _id: { featuredImg: { $gt: ["$featuredImg", null] }, stateCode: "$stateCode" },
        count: { $sum: 1 },
      },
    },
  ]);
  return result;
}

export async function getNoContentStats(regions: string[]) {
  await connect();

  return await Promise.all(
    regions.map(async (region) => {
      const count = await Hotspot.countDocuments({
        stateCode: region,
        noContent: true,
        "groups.0": { $exists: false },
      });
      return { region, count };
    })
  );
}

export async function getGroupByLocationId(locationId: string) {
  await connect();
  const result = await Group.findOne({ locationId })
    .populate("hotspots", ["url", "name", "featuredImg", "lat", "lng", "species", "locationId"])
    .lean()
    .exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getGroupsByState(stateCode: string) {
  await connect();
  const result = await Group.find({ stateCodes: stateCode }, ["-_id", "name", "url"]).sort({ name: 1 }).lean().exec();

  return result;
}
