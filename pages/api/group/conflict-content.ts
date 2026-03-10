import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Group from "models/Group";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { locationId } = req.query;

  if (!locationId || typeof locationId !== "string") {
    return res.status(400).json({ error: "locationId is required" });
  }

  try {
    await connect();
    const group = await Group.findOne({ locationId }, ["about", "birding", "plan", "restrooms", "primaryHotspot", "name"])
      .populate("primaryHotspot", ["about", "birding", "plan", "restrooms", "name", "url", "locationId"])
      .lean()
      .exec();

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const ph = (group as any).primaryHotspot;

    res.status(200).json({
      success: true,
      groupName: (group as any).name,
      primaryHotspotName: ph?.name || null,
      primaryHotspotUrl: ph?.url || null,
      primaryHotspotLocationId: ph?.locationId || null,
      group: {
        about: (group as any).about || "",
        birding: (group as any).birding || "",
        plan: (group as any).plan || "",
        restrooms: (group as any).restrooms || "",
      },
      hotspot: ph
        ? {
            about: ph.about || "",
            birding: ph.birding || "",
            plan: ph.plan || "",
            restrooms: ph.restrooms || "",
          }
        : null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
