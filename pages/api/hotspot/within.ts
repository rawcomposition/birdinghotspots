import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { neLat, neLng, swLat, swLng, region }: any = req.query;
  const query: any = {
    location: {
      $geoWithin: {
        $box: [
          [swLng, swLat],
          [neLng, neLat],
        ],
      },
    },
  };
  if (region.split("-").length === 3) {
    query.countyCode = region;
  } else if (region.split("-").length === 2) {
    query.stateCode = region;
  } else if (region) {
    query.countryCode = region;
  }

  try {
    await connect();
    const results = await Hotspot.find(query, ["-_id", "featuredImg", "name", "locationId", "lat", "lng", "species"])
      .limit(1201) // 1201 to check if there are more than 1200 results
      .lean()
      .exec();

    const formattedResults = results.map((data) => {
      const hotspot = [
        data.name,
        data.locationId,
        [data.lng, data.lat],
        data.species,
        data.featuredImg?.xsUrl || data.featuredImg?.smUrl,
      ];
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
