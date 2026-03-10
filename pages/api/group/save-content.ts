import connect from "lib/mongo";
import Group from "models/Group";
import Hotspot from "models/Hotspot";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res) => {
  const { groupLocationId, hotspotLocationId, group, hotspot } = req.body;

  if (!groupLocationId) {
    return res.status(400).json({ error: "groupLocationId is required" });
  }

  try {
    await connect();
    const updates: Promise<any>[] = [];

    if (group) {
      updates.push(
        Group.updateOne({ locationId: groupLocationId }, {
          about: group.about || "",
          birding: group.birding || "",
          plan: group.plan || "",
          restrooms: group.restrooms || "",
        })
      );
    }

    if (hotspot && hotspotLocationId) {
      updates.push(
        Hotspot.updateOne({ locationId: hotspotLocationId }, {
          about: hotspot.about || "",
          birding: hotspot.birding || "",
          plan: hotspot.plan || "",
          restrooms: hotspot.restrooms || "",
        })
      );
    }

    await Promise.all(updates);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
