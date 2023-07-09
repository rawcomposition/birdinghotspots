import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Group from "models/Group";
import Logs from "models/Log";
import secureApi from "lib/secureApi";
import { canEdit } from "lib/helpers";

export default secureApi(async (req, res, token) => {
  const { id }: any = req.query;

  await connect();
  const group = await Group.findById(id);

  if (!token.isAdmin && !canEdit(token, group.stateCodes.length > 0 ? group.stateCodes : group.countryCode)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await Promise.all([
      await Group.deleteOne({ _id: id }),
      await Hotspot.updateMany({ groupIds: id }, { $pull: { groupIds: id } }),
    ]);

    try {
      await Logs.create({
        user: token.name,
        uid: token.uid,
        type: "delete_group",
        message: `deleted group: ${group.name}`,
        hotspotId: group.locationId,
      });
    } catch (error) {}

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
