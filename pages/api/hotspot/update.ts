import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Logs from "models/Log";
import secureApi from "lib/secureApi";
import { canEdit } from "lib/helpers";
import dayjs from "dayjs";

export default secureApi(async (req, res, token) => {
  const { id, data } = req.body;

  if (!canEdit(token, data.stateCode || data.countryCode)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await connect();
    const url = `/hotspot/${data.locationId}`;

    let location = null;
    if (data.lat && data.lng) {
      location = {
        type: "Point",
        coordinates: [data.lng, data.lat],
      };
    }

    const featuredImg = data?.images?.filter((it: any) => !it.isMap)?.[0] || null;
    const noContent = !data?.about && !data?.tips && !data?.birds && !data?.hikes;
    const updatedAt = dayjs().format();
    await Hotspot.updateOne({ _id: id }, { ...data, url, location, featuredImg, noContent, updatedAt });

    try {
      await Logs.create({
        user: token.name,
        uid: token.uid,
        type: "edit_hotspot",
        message: `edited hotspot: ${data.name}`,
        hotspotId: data.locationId,
      });
    } catch (error) {}

    res.status(200).json({ success: true, url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
