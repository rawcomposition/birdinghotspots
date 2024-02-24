import connect from "lib/mongo";
import PhotoBatch from "models/PhotoBatch";
import Hotspot from "models/Hotspot";
import { Image } from "lib/types";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  const { id }: any = req.query;
  const { imageId }: any = req.body;

  try {
    if (!id || !imageId) throw new Error("Invalid request");
    await connect();

    const batch = await PhotoBatch.findById(id);
    if (!batch) throw new Error("Batch not found");

    const hotspot = await Hotspot.findOne({ locationId: batch.locationId });
    if (!hotspot) throw new Error("Hotspot not found");

    const img = batch.images.find((img) => img._id?.toString() === imageId);
    if (!img) throw new Error("Image not found");

    const isBatchReviewed = batch.images.every((img) => img.status !== "pending" || img._id?.toString() === imageId);

    let featuredImg = hotspot.featuredImg;
    if (!featuredImg?.smUrl) {
      featuredImg = img;
    }
    const formattedImage = { ...img, isPublicDomain: true, by: batch.by, email: batch.email, uid: batch.uid };

    const urls = hotspot.images?.map((image: Image) => image.smUrl) || [];
    const hasImage = urls.includes(img.smUrl);

    await Promise.all(
      [
        PhotoBatch.updateOne(
          { _id: id, "images._id": imageId },
          { $set: { "images.$.status": "approved", isReviewed: isBatchReviewed } }
        ),
        hasImage
          ? null
          : await Hotspot.updateOne(
              { locationId: batch.locationId },
              { featuredImg, $push: { images: formattedImage } }
            ),
      ].filter(Boolean)
    );

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
