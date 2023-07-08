import connect from "lib/mongo";
import Group from "models/Group";
import Hotspot from "models/Hotspot";
import Logs from "models/Log";
import secureApi from "lib/secureApi";
import { canEdit } from "lib/helpers";
import dayjs from "dayjs";

export default secureApi(async (req, res, token) => {
  const { id, data } = req.body;

  const hotspots = await Hotspot.find({ _id: { $in: data.hotspots } }, ["-_id", "stateCode", "countyCode"]);
  const allStateCodes: string[] = hotspots.map((hotspot: any) => hotspot.stateCode);
  const stateCodes = [...new Set(allStateCodes)];
  const countyCodes: string[] = [];

  hotspots.forEach((hotspot: any) => {
    if (hotspot.countyCode && !countyCodes.includes(hotspot.countyCode)) {
      countyCodes.push(hotspot.countyCode);
    }
  });

  if (!canEdit(token, !!data?.stateCodes?.length ? data.stateCodes : data.countryCode)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await connect();
    const group = await Group.findOne({ _id: id }, ["-_id", "hotspots"]);
    const removedHotspots = group.hotspots.filter((it: string) => !data.hotspots.includes(it.toString()));

    const updatedAt = dayjs().format();
    await Promise.all([
      await Group.updateOne({ _id: id }, { ...data, stateCodes, countyCodes, updatedAt }),
      await Hotspot.updateMany({ _id: { $in: data.hotspots } }, { $addToSet: { groupIds: id } }),
      await Hotspot.updateMany({ _id: { $in: removedHotspots } }, { $pull: { groupIds: id } }),
    ]);

    try {
      await Logs.create({
        user: token.name,
        uid: token.uid,
        type: "edit_group",
        message: `edited group: ${data.name}`,
        hotspotId: data.locationId,
      });
    } catch (error) {}

    res.status(200).json({ success: true, url: data.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
