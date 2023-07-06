import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import { getStateByCode } from "lib/localData";
import { Hotspot as HotspotType } from "lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { q, regionCode, ids }: any = req.query;
  const selectedIds = ids?.split(",")?.filter((it: string) => it) || [];

  let query: any = {
    $or: [{ name: { $regex: new RegExp(q), $options: "i" } }, { locationId: q }],
  };

  if (Array.isArray(selectedIds) && selectedIds.length > 0) {
    query = { ...query, _id: { $nin: selectedIds } };
  }

  if (regionCode) {
    if (regionCode.split("-").length === 3) {
      query = { ...query, countyCode: regionCode };
    } else if (regionCode.split("-").length === 2) {
      query = { ...query, stateCode: regionCode };
    } else {
      query = { ...query, countryCode: regionCode };
    }
  }

  let select = ["name", "countryCode", "stateCode"];

  try {
    await connect();
    const results = (await Hotspot.find(query, select).limit(50).sort({ name: 1 }).lean().exec()) as HotspotType[];

    const formatted = results?.map((result) => {
      const country = result.countryCode.toUpperCase();
      const state = getStateByCode(result.stateCode);
      let label = `${result.name}, ${state?.label}, ${country}`;
      return { label, value: result._id };
    });

    res.status(200).json({
      success: true,
      results: formatted,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
