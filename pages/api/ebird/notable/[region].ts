import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { region, back } = req.query;

  if (!region || typeof region !== "string") {
    return res.status(400).json({ error: "Region parameter is required" });
  }

  const backDays = back || "7";

  try {
    const response = await fetch(
      `https://api.ebird.org/v2/data/obs/${region}/recent/notable?detail=full&back=${backDays}`,
      {
        headers: {
          "X-eBirdApiToken": process.env.EBIRD_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch notable sightings" });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
