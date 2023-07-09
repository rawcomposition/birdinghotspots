import type { NextApiRequest, NextApiResponse } from "next";
import connect, { searchCities } from "lib/mongo";
import Hotspot from "models/Hotspot";
import { getRegion } from "lib/localData";
import { Hotspot as HotspotType, City } from "lib/types";
import FlatRegions from "data/flat-regions.json";

const regionCodes = FlatRegions.map((region) => region.code);

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

  try {
    await connect();
    const results = (await Hotspot.find(query, ["name", "url", "countryCode", "stateCode"])
      .limit(50)
      .lean()
      .exec()) as HotspotType[];

    const cities = await searchCities(q);

    const formattedCities = cities?.map((city: City) => {
      const region = getRegion(city.stateCode || city.countryCode);
      return {
        label: `${city.name}, ${region?.detailedName || city.stateCode}`,
        value: `/city/${city.locationId}`,
      };
    });

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
          options: formattedCities,
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
