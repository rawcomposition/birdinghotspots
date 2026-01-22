import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { locationId } = req.query;

  if (!locationId || typeof locationId !== "string") {
    return res.status(400).json({ error: "Location ID parameter is required" });
  }

  try {
    const response = await fetch(
      `https://api.ebird.org/v2/ref/hotspot/info/${locationId}?key=${process.env.EBIRD_API_KEY}`
    );

    if (response.status === 200) {
      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(response.status).json({ error: "Failed to fetch hotspot info" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
