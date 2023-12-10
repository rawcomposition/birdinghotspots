import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Group from "models/Group";
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
    const [hotspots, groups] = await Promise.all([
      Hotspot.find(query, ["name", "url", "countryCode", "stateCode"]).limit(50).lean(),
      Group.find(query, ["name", "url", "countryCode", "stateCodes"]).limit(10).lean(),
    ]);

    const formattedHotspots = hotspots?.map((result) => {
      const region = getRegion(result.stateCode || result.countryCode);
      const label = `${result.name}, ${region?.detailedName || result.stateCode || result.countryCode}`;
      return { label, value: result.url };
    });

    const formattedGroups = groups?.map((result) => {
      const hasMultipleStates = result.stateCodes?.length > 1;
      const region = hasMultipleStates
        ? getRegion(result.countryCode)
        : getRegion(result.stateCode || result.countryCode);
      const label = `${result.name}, ${region?.detailedName || result.countryCode}`;
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
          label: "Groups",
          options: formattedGroups,
        },
        {
          label: "Hotspots",
          options: formattedHotspots,
        },
      ],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
