import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Logs from "models/Log";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  const { id, data } = req.body;

  if (!token.isAdmin && !token.regions?.includes(data?.stateCode)) {
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
    await Hotspot.updateOne({ _id: id }, { ...data, url, location, featuredImg, noContent });

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
