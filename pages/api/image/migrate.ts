import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Profile from "models/Profile";
import secureApi from "lib/secureApi";
import { getHotspotImages } from "lib/mongo";

export default secureApi(async (req, res, token) => {
  try {
    const { locationId, imageId } = req.body;

    if (!locationId || !imageId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    await connect();

    const [profile, hotspot] = await Promise.all([
      Profile.findOne({ uid: token.uid }),
      Hotspot.findOne({ locationId }),
    ]);

    if (!profile || !profile.email) throw new Error("User profile not found");

    if (!hotspot) {
      return res.status(404).json({ error: "Hotspot not found" });
    }

    const image = hotspot.images?.find((img) => img._id?.toString() === imageId && img.email === profile.email);

    if (!image) {
      throw new Error("Image not found or you don't have permission to migrate this image");
    }

    await Hotspot.updateOne({ locationId, "images._id": imageId }, { $set: { "images.$.isMigrated": true } });

    // Re-run logic to update featuredImg
    await getHotspotImages(locationId as string);

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error migrating image:", error);
    return res.status(500).json({ error: error.message || "Error updating image status" });
  }
}, "editor");
