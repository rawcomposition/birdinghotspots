import connect from "lib/mongo";
import Group from "models/Group";
import Hotspot from "models/Hotspot";
import Logs from "models/Log";
import secureApi from "lib/secureApi";
import dayjs from "dayjs";
import { assertWriteEnabled } from "lib/config";

export default secureApi(async (req, res, token) => {
  if (!assertWriteEnabled(res, token.role)) return;
  const { groupLocationId, hotspotLocationId, group, hotspot } = req.body;

  if (!groupLocationId) {
    return res.status(400).json({ error: "groupLocationId is required" });
  }

  try {
    await connect();
    const updatedAt = dayjs().format();
    const updates: Promise<any>[] = [];

    if (group) {
      updates.push(
        Group.updateOne({ locationId: groupLocationId }, {
          about: group.about || "",
          birding: group.birding || "",
          plan: group.plan || "",
          restrooms: group.restrooms || "",
          updatedAt,
        })
      );
    }

    if (hotspot && hotspotLocationId) {
      const noContent = !hotspot.about?.trim() && !hotspot.plan?.trim() && !hotspot.birding?.trim();
      updates.push(
        Hotspot.updateOne({ locationId: hotspotLocationId }, {
          about: hotspot.about || "",
          birding: hotspot.birding || "",
          plan: hotspot.plan || "",
          restrooms: hotspot.restrooms || "",
          noContent,
          updatedAt,
        })
      );
    }

    await Promise.all(updates);

    try {
      await Logs.create({
        user: token.name,
        uid: token.uid,
        type: "edit_group",
        message: `edited group content: ${groupLocationId}`,
        hotspotId: groupLocationId,
      });
    } catch (error) {}

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
