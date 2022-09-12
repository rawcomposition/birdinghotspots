import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Group from "models/Group";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  return;
  await connect();
  const hotspots = await Hotspot.find({ isGroup: true });
  for (const hotspot of hotspots) {
    const children = await Hotspot.find({ parent: hotspot._id }, ["_id", "stateCode", "countyCode", "multiCounties"]);
    const hotspotsIds = children.map((child) => child._id);

    const allStateCodes: string[] = children.map((hotspot: any) => hotspot.stateCode);
    const stateCodes = [...new Set(allStateCodes)];
    const countyCodes: string[] = [];

    const hotspotIds = children.map((child) => child._id);

    children.forEach((hotspot: any) => {
      if (hotspot.countyCode && !countyCodes.includes(hotspot.countyCode)) {
        countyCodes.push(hotspot.countyCode);
      }
      if (hotspot.multiCounties) {
        hotspot.multiCounties.forEach((countyCode: string) => {
          if (!countyCodes.includes(countyCode)) {
            countyCodes.push(countyCode);
          }
        });
      }
    });

    const group = await Group.create({
      name: hotspot.name,
      url: `/group/${hotspot.locationId}`,
      countryCode: hotspot.countryCode,
      stateCodes,
      countyCodes,
      lat: hotspot.lat,
      lng: hotspot.lng,
      zoom: hotspot.zoom,
      locationId: hotspot.locationId,
      about: hotspot.about,
      tips: hotspot.tips,
      hikes: hotspot.hikes,
      birds: hotspot.birds,
      address: hotspot.address,
      links: hotspot.links,
      restrooms: hotspot.restrooms,
      hotspots: hotspotsIds,
      images: hotspot.images?.filter((image: any) => image.isMap),
      createdAt: hotspot.createdAt,
    });

    await Hotspot.updateMany({ _id: { $in: hotspotIds } }, { $addToSet: { groups: group?._id } });
  }

  res.status(200).json({ success: true });
}
