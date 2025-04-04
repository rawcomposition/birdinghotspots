import connect, { getHotspotImages } from "lib/mongo";
import Hotspot from "models/Hotspot";
import Logs from "models/Log";
import secureApi from "lib/secureApi";
import { canEdit, getEbirdHotspot } from "lib/helpers";
import dayjs from "dayjs";
import { getEbirdImage } from "lib/ml";

export default secureApi(async (req, res, token) => {
  const { id, data } = req.body;

  if (!canEdit(token, data.stateCode || data.countryCode)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await connect();
    const url = `/hotspot/${data.locationId}`;

    const ebirdHotspot = await getEbirdHotspot(data.locationId);

    if (!ebirdHotspot) throw new Error("eBird hotspot not found");

    if (data?.featuredEbirdId) {
      // Don't update the featuredImg, just verify it exists
      await getEbirdImage(data.featuredEbirdId);
    }

    const noContent = !data?.about?.trim() && !data?.tips?.trim() && !data?.birds?.trim() && !data?.hikes?.trim();
    const updatedAt = dayjs().format();

    let location = null;
    if (ebirdHotspot.lat && ebirdHotspot.lng) {
      location = {
        type: "Point",
        coordinates: [ebirdHotspot.lng, ebirdHotspot.lat],
      };
    }

    const { featuredImg, ...rest } = data;

    await Hotspot.updateOne(
      { _id: id },
      {
        ...rest,
        url,
        location,
        noContent,
        updatedAt,
        name: ebirdHotspot.name,
        lat: ebirdHotspot.lat,
        lng: ebirdHotspot.lng,
        species: ebirdHotspot.numSpeciesAllTime,
        countyCode: ebirdHotspot.subnational2Code,
      }
    );

    // Re-run logic to update featuredImg
    await getHotspotImages(data.locationId);

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
