import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import { getRegion } from "lib/localData";
import FlatRegions from "data/flat-regions.json";
import FlatCities from "data/flat-cities.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { q }: any = req.query;

  const query = {
    name: { $regex: new RegExp(q), $options: "i" },
  };

  const filteredRegions = FlatRegions.filter(({ name }) => name.toLowerCase().startsWith(q.toLowerCase())).map(
    ({ code, name }) => ({
      label: name,
      value: `/region/${code}`,
    })
  );

  const filteredCities = FlatCities.filter(({ name }) => name.toLowerCase().startsWith(q.toLowerCase())).map(
    ({ code, name }) => ({
      label: name,
      value: `/city/${code}`,
    })
  );

  try {
    await connect();
    const hotspots = await Hotspot.find(query, ["name", "url", "countryCode", "stateCode"]).limit(50).lean();

    const formatted = hotspots?.map((result) => {
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
