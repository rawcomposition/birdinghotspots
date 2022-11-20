import Hotspot from "models/Hotspot";
import connect from "lib/mongo";

export default async function handler(req: any, res: any) {
  try {
    await connect();
    const hotspots = await Hotspot.find({ restrooms: { $ne: null } }).limit(1000);

    await Promise.all(
      hotspots.map(async (hotspot) => {
        if (hotspot.restrooms === "no") {
          hotspot.restrooms = "No";
        } else if (["yes", "nearby", "portable", "vault", "flush", "map"].includes(hotspot.restrooms)) {
          hotspot.restrooms = "Yes";
        } else {
          hotspot.restrooms = "Unknown";
        }
        await hotspot.save();
      })
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
}
