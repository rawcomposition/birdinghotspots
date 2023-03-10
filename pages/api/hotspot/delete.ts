import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Drive from "models/Drive";
import Group from "models/Group";
import Logs from "models/Log";
import secureApi from "lib/secureApi";
import { canEdit } from "lib/helpers";

export default secureApi(async (req, res, token) => {
  const { id }: any = req.query;

  await connect();
  const hotspot = await Hotspot.findById(id);

  if (!canEdit(token, hotspot?.stateCode)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await Hotspot.deleteOne({ _id: id });
    // @ts-ignore
    await Drive.updateMany({ entries: { $elemMatch: { hotspot: id } } }, { $pull: { entries: { hotspot: id } } });
    await Group.updateMany({ hotspots: id }, { $pull: { hotspots: id } });

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
