import type { NextApiRequest, NextApiResponse } from "next";
import connect, { deleteHotspot } from "lib/mongo";
import Hotspot from "models/Hotspot";
import Logs from "models/Log";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { key }: any = req.query;
  if (process.env.CRON_SECRET && key !== process.env.CRON_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  await connect();
  try {
    const hotspots = await Hotspot.find({
      needsDeleting: true,
      noContent: { $ne: true },
      "images.0": { $exists: false },
    });

    for (const hotspot of hotspots) {
      await deleteHotspot(hotspot);
      await Promise.all([
        Logs.create({
          user: "BirdBot",
          type: "delete",
          message: `Deleted ${hotspot.name} (${hotspot.locationId})`,
        }),
      ]);
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
