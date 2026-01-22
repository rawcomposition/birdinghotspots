import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { region } = req.query;

  if (!region || typeof region !== "string") {
    return res.status(400).json({ error: "Region parameter is required" });
  }

  try {
    const response = await fetch(
      `https://api.ebird.org/v2/ref/hotspot/${region}?fmt=json&key=${process.env.EBIRD_API_KEY}`
    );

    const json = await response.json();

    if ("errors" in json) {
      return res.status(400).json({ error: "Error fetching eBird hotspots" });
    }

    res.status(200).json(json);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
