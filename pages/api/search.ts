import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import States from "data/states.json";
import { getRegion } from "lib/localData";
import { getAllCities } from "lib/localData";
import { Hotspot as HotspotType, City } from "lib/types";
import FlatRegions from "data/flat-regions.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { q }: any = req.query;

  const query = {
    name: { $regex: new RegExp(q), $options: "i" },
  };

  const activeStateCodes = States.filter((state) => state.active).map((state) => state.code);
  const allCities = getAllCities();

  const filteredRegions = FlatRegions.filter(({ name }) => name.toLowerCase().startsWith(q.toLowerCase())).map(
    ({ code, name }) => ({
      label: name,
      value: `/region/${code}`,
    })
  );

  const filteredCities = allCities
    .filter((city: City) => {
      return activeStateCodes.includes(city.state) && city.name.toLowerCase().startsWith(q.toLowerCase());
    })
    .map((city: City) => {
      const state = States.find((state) => state.code === city.state);
      return {
        label: `${city.name}, ${state?.label}, ${state?.country}`,
        value: `/${state?.country?.toLowerCase()}/${state?.slug}/cities/${city.slug}`,
      };
    });

  try {
    await connect();
    const results = (await Hotspot.find(query, ["name", "url", "countryCode", "stateCode"])
      .limit(50)
      .lean()
      .exec()) as HotspotType[];
    const formatted = results?.map((result) => {
      const region = getRegion(result.stateCode || result.countryCode);
      const label = `${result.name}, ${region?.detailedName || result.stateCode || result.countryCode}`;
      return { label, value: result.url };
    });
    res.status(200).json({
      success: true,
      results: [
        {
          label: "Cities/Towns",
          options: filteredCities,
        },
        {
          label: "Regions",
          options: filteredRegions,
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
