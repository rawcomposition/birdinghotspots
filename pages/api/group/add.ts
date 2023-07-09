import connect from "lib/mongo";
import Group from "models/Group";
import Hotspot from "models/Hotspot";
import { generateRandomId, canEdit } from "lib/helpers";
import Logs from "models/Log";
import secureApi from "lib/secureApi";
import dayjs from "dayjs";

export default secureApi(async (req, res, token) => {
  const { data } = req.body;

  const hotspots = await Hotspot.find({ _id: { $in: data.hotspots } }, ["-_id", "stateCode", "countyCode"]);
  const allStateCodes: string[] = hotspots.map((hotspot: any) => hotspot.stateCode);
  const stateCodes = [...new Set(allStateCodes)];
  const countyCodes: string[] = [];

  hotspots.forEach((hotspot: any) => {
    if (hotspot.countyCode && !countyCodes.includes(hotspot.countyCode)) {
      countyCodes.push(hotspot.countyCode);
    }
  });

  if (!canEdit(token, stateCodes.length > 0 ? stateCodes : data.countryCode)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await connect();
    const locationId = data.locationId || `G${generateRandomId()}`;
    const url = `/group/${locationId}`;
    const updatedAt = dayjs().format();
    const group = await Group.create({ ...data, locationId, url, stateCodes, countyCodes, updatedAt });
    await Hotspot.updateMany({ _id: { $in: data.hotspots } }, { $addToSet: { groupIds: group._id } });

    try {
      await Logs.create({
        user: token.name,
        uid: token.uid,
        type: "add_group",
        message: `added group: ${data.name}`,
        hotspotId: data.locationId,
      });
    } catch (error) {}

    res.status(200).json({ success: true, url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
