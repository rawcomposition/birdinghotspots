import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import secureApi from "lib/secureApi";
import { canEdit } from "lib/helpers";
import { deleteHotspot } from "lib/mongo";
import Logs from "models/Log";
export default secureApi(async (req, res, token) => {
  const { id }: any = req.query;

  await connect();
  const hotspot = await Hotspot.findById(id);

  if (!hotspot) {
    return res.status(404).json({ error: "Hotspot not found" });
  }

  if (!canEdit(token, hotspot?.stateCode || hotspot?.countryCode)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await deleteHotspot(hotspot);

    try {
      await Logs.create({
        user: token.name,
        uid: token.uid,
        type: "delete_hotspot",
        message: `deleted hotspot: ${hotspot.name}`,
        hotspotId: hotspot.locationId,
      });
    } catch (error) {}

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
