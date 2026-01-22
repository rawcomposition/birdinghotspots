import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { region } = req.query;

  if (!region || typeof region !== "string") {
    return res.status(400).json({ error: "Region parameter is required" });
  }

  try {
    const response = await fetch(
      `https://api.ebird.org/v2/ref/region/info/${region}?fmt=json&key=${process.env.EBIRD_API_KEY}`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch region info" });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
