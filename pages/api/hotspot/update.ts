import connect, { getHotspotImages } from "lib/mongo";
import Hotspot from "models/Hotspot";
import Logs from "models/Log";
import secureApi from "lib/secureApi";
import { canEdit, getEbirdHotspot } from "lib/helpers";
import dayjs from "dayjs";
import { getImages } from "lib/ml";
import { HotspotInput } from "lib/types";
import { convertMlImageToImage } from "lib/ml";

export default secureApi(async (req, res, token) => {
  const { id, data } = req.body as { id: string; data: HotspotInput };

  if (!canEdit(token, data.stateCode || data.countryCode)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await connect();
    const url = `/hotspot/${data.locationId}`;

    const assetIds = [
      data.featuredImg1?.id,
      data.featuredImg2?.id,
      data.featuredImg3?.id,
      data.featuredImg4?.id,
    ].filter((it): it is number => !!it);

    const [ebirdHotspot, ebirdImages] = await Promise.all([getEbirdHotspot(data.locationId), getImages(assetIds)]);

    if (!ebirdHotspot) throw new Error("eBird hotspot not found");

    const noContent = !data?.about?.trim() && !data?.plan?.trim() && !data?.birding?.trim();
    const updatedAt = dayjs().format();

    let location = null;
    if (ebirdHotspot.lat && ebirdHotspot.lng) {
      location = {
        type: "Point",
        coordinates: [ebirdHotspot.lng, ebirdHotspot.lat],
      };
    }

    const { featuredImg, ...rest } = data;
    const newFeaturedImg1 = data.featuredImg1?.id ? ebirdImages?.find((it) => it.id === data.featuredImg1?.id) : null;
    const newFeaturedImg2 = data.featuredImg2?.id ? ebirdImages?.find((it) => it.id === data.featuredImg2?.id) : null;
    const newFeaturedImg3 = data.featuredImg3?.id ? ebirdImages?.find((it) => it.id === data.featuredImg3?.id) : null;
    const newFeaturedImg4 = data.featuredImg4?.id ? ebirdImages?.find((it) => it.id === data.featuredImg4?.id) : null;

    // Only update the featuredImg if available, otherwise, leave the auto-assigned one from eBird
    let featuredImgUpdate = {};
    const bestLegacyImg = data?.images?.find((it) => !it.isMap && !it.isMigrated) || null;
    if (newFeaturedImg1 || bestLegacyImg) {
      featuredImgUpdate = {
        featuredImg: newFeaturedImg1 ? convertMlImageToImage(newFeaturedImg1) : bestLegacyImg,
      };
    }

    await Hotspot.updateOne(
      { _id: id },
      {
        ...rest,
        ...featuredImgUpdate,
        featuredImg1: data.featuredImg1?.id ? newFeaturedImg1 || data.featuredImg1 : null,
        featuredImg2: data.featuredImg2?.id ? newFeaturedImg2 || data.featuredImg2 : null,
        featuredImg3: data.featuredImg3?.id ? newFeaturedImg3 || data.featuredImg3 : null,
        featuredImg4: data.featuredImg4?.id ? newFeaturedImg4 || data.featuredImg4 : null,
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
