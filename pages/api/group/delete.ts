import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Group from "models/Group";
import Logs from "models/Log";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  const { id }: any = req.query;

  await connect();
  const group = await Group.findById(id);

  const canEdit = group?.stateCodes?.filter((it: string) => token.regions?.includes(it)).length > 0;
  if (!token.isAdmin && !canEdit) {
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
