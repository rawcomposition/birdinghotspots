import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import States from "data/states.json";
import { getAllCounties, getStateByCode } from "lib/localData";
import { Hotspot as HotspotType } from "lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { q }: any = req.query;

  const query = {
    name: { $regex: new RegExp(q), $options: "i" },
  };

  const allCounties = getAllCounties();

  const filteredCounties = allCounties
    .filter((county: any) => {
      return county.name.toLowerCase().startsWith(q.toLowerCase());
    })
    .map(({ name, slug, stateSlug, stateLabel, country }: any) => ({
      label: `${name}, ${stateLabel}, ${country}`,
      value: `/${country.toLowerCase()}/${stateSlug}/${slug}`,
    }));

  const filteredStates = States.filter(
    (state) => state.active && state.label.toLowerCase().startsWith(q.toLowerCase())
  ).map((state) => ({
    label: `${state.label}, ${state.country}`,
    value: `/${state.country.toLowerCase()}/${state.slug}`,
  }));

  try {
    await connect();
    const results = (await Hotspot.find(query, ["name", "url", "countryCode", "stateCode"])
      .limit(50)
      .lean()
      .exec()) as HotspotType[];
    const formatted = results?.map((result) => {
      const country = result.countryCode.toUpperCase();
      const state = getStateByCode(result.stateCode);
      const label = `${result.name}, ${state?.label}, ${country}`;
      return { label, value: result.url };
    });
    res.status(200).json({
      success: true,
      results: [
        {
          label: "Regions",
          options: [...filteredStates, ...filteredCounties],
        },
        {
          label: "Hotspots",
          options: formatted,
        },
      ],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
