import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { neLat, neLng, swLat, swLng }: any = req.query;

  const query = {
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

  try {
    await connect();
    const results = await Hotspot.find(query, ["-_id", "featuredImg", "name", "url", "lat", "lng"])
      .limit(501)
      .lean()
      .exec();

    const formattedResults = results.map(({ featuredImg, ...data }) => {
      return {
        img: featuredImg?.smUrl,
        ...data,
      };
    });

    const tooLarge = results.length > 500;
    res.status(200).json({
      success: true,
      tooLarge,
      results: tooLarge ? [] : formattedResults,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
