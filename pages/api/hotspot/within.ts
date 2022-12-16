import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { neLat, neLng, swLat, swLng, region }: any = req.query;

  const isCounty = region?.split("-").length === 3;

  const query: any = {
    location: {
      $geoWithin: {
        $box: [
          [swLng, swLat],
          [neLng, neLat],
        ],
      },
    },
    name: { $not: /^stakeout/i },
  };

  if (region && isCounty) {
    query.countyCode = region;
  } else if (region) {
    query.stateCode = region;
  }

  try {
    await connect();
    const results = await Hotspot.find(query, ["-_id", "featuredImg", "name", "locationId", "lat", "lng", "species"])
      .limit(1201) // 1201 to check if there are more than 1500 results
      .lean()
      .exec();

    const formattedResults = results.map((data) => {
      const hotspot = [data.name, data.locationId, [data.lng, data.lat], data.species];
      if (data.featuredImg) {
        hotspot.push(data.featuredImg?.smUrl?.replace("https://s3.us-east-1.wasabisys.com/birdinghotspots/", ""));
      }
      return hotspot;
    });

    const tooLarge = results.length > 1200;
    res.status(200).json({
      success: true,
      tooLarge,
      results: tooLarge ? [] : formattedResults,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
