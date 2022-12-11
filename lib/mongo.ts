import mongoose from "mongoose";
import Hotspot from "models/Hotspot";
import Drive from "models/Drive";
import Article from "models/Article";
import Settings from "models/Settings";
import Upload from "models/Upload";
import Revision from "models/Revision";
import Group from "models/Group";
import Profile from "models/Profile";

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);
export default connect;

export async function getHotspotsByState(stateCode: string) {
  await connect();
  const result = await Hotspot.find({ stateCode }, ["name", "url", "iba", "noContent", "needsDeleting"])
    .sort({ name: 1 })
    .lean()
    .exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getHotspotsByCounty(countyCode: string) {
  await connect();
  const result = await Hotspot.find({ countyCode, name: { $not: /^stakeout/i } }, [
    "name",
    "url",
    "iba",
    "drives",
    "noContent",
    "needsDeleting",
    "lat",
    "lng",
    "species",
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

export async function getUploads(states: string[], counties: string[]) {
  await connect();
  const result = await Upload.find({
    status: "pending",
    $or: [{ stateCode: { $in: states || [] } }, { countyCode: { $in: counties || [] } }],
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

export async function getRevisions(states: string[], counties: string[]) {
  await connect();
  const result = await Revision.find({
    status: "pending",
    $or: [{ stateCode: { $in: states || [] } }, { countyCode: { $in: counties || [] } }],
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return result ? JSON.parse(JSON.stringify(result)) : null;
}

export async function getAllRevisions() {
  await connect();
  const result = await Revision.find({ status: "pending" }).sort({ createdAt: -1 }).lean().exec();

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

export async function getGroupHotspotIds(stateCode: string) {
  await connect();
  const result = await Group.find({ stateCodes: stateCode }, ["-_id", "hotspots"]).lean().exec();
  const ids = result.reduce((acc: string[], group) => {
    return [...acc, ...group.hotspots.map((id: any) => id.toString())];
  }, []);

  return [...new Set(ids as string[])];
}

export async function getGroupHotspotIdsByCounty(countyCode: string) {
  await connect();
  const result = await Group.find({ countyCode }, ["-_id", "hotspots"]).lean().exec();
  const ids = result.reduce((acc: string[], group) => {
    return [...acc, ...group.hotspots.map((id: any) => id.toString())];
  }, []);

  return [...new Set(ids as string[])];
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
