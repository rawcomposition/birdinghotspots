import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Group from "models/Group";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { locationId } = req.query;

  if (!locationId || typeof locationId !== "string") {
    return res.status(400).json({ error: "locationId is required" });
  }

  try {
    await connect();
    const group = await Group.findOne({ locationId }, ["hotspots"])
      .populate("hotspots", ["name", "url", "locationId", "lat", "lng"])
      .lean()
      .exec();

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const hotspots = (group.hotspots || [])
      .map((h: any) => ({ name: h.name, url: h.url, locationId: h.locationId }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    const allHotspots = (group.hotspots || []) as any[];
    const withCoords = allHotspots.filter((h: any) => h.lat != null && h.lng != null);
    const lat = withCoords.length > 0 ? withCoords.reduce((sum: number, h: any) => sum + h.lat, 0) / withCoords.length : null;
    const lng = withCoords.length > 0 ? withCoords.reduce((sum: number, h: any) => sum + h.lng, 0) / withCoords.length : null;

    res.status(200).json({
      success: true,
      hotspots,
      lat,
      lng,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
