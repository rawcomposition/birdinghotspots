import connect from "lib/mongo";
import Group from "models/Group";
import Hotspot from "models/Hotspot";
import Logs from "models/Log";
import secureApi from "lib/secureApi";
import { canEdit } from "lib/helpers";
import dayjs from "dayjs";

export default secureApi(async (req, res, token) => {
  const { groupLocationId, hotspotId } = req.body;

  if (!groupLocationId || !hotspotId) {
    return res.status(400).json({ error: "groupLocationId and hotspotId are required" });
  }

  await connect();

  const group = await Group.findOne({ locationId: groupLocationId }, [
    "_id",
    "name",
    "stateCodes",
    "countryCode",
    "countyCodes",
  ]).lean();
  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  if (!canEdit(token, group.stateCodes?.length ? group.stateCodes : group.countryCode)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const hotspot = await Hotspot.findById(hotspotId, ["_id", "stateCode", "countyCode"]).lean() as any;
  if (!hotspot) {
    return res.status(404).json({ error: "Hotspot not found" });
  }

  try {
    const updateFields: any = {
      $addToSet: { hotspots: hotspot._id },
      $set: { updatedAt: dayjs().format() },
    };

    if (hotspot.stateCode && !group.stateCodes?.includes(hotspot.stateCode)) {
      updateFields.$addToSet.stateCodes = hotspot.stateCode;
    }
    if (hotspot.countyCode && !group.countyCodes?.includes(hotspot.countyCode)) {
      updateFields.$addToSet.countyCodes = hotspot.countyCode;
    }

    const addResult = await Group.updateOne(
      { locationId: groupLocationId, hotspots: { $ne: hotspot._id } },
      updateFields
    );

    await Hotspot.updateOne({ _id: hotspot._id }, { $addToSet: { groupIds: group._id } });

    // Keep hotspotCount derived from the true hotspots array.
    // If this fails, keep the hotspot membership update as the source of truth.
    try {
      await Group.updateOne({ locationId: groupLocationId }, [{ $set: { hotspotCount: { $size: "$hotspots" } } }]);
    } catch (error) {}

    if (addResult.modifiedCount) {
      try {
        await Logs.create({
          user: token.name,
          uid: token.uid,
          type: "edit_group",
          message: `added hotspot to group: ${group.name}`,
          hotspotId: groupLocationId,
        });
      } catch (error) {}
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
