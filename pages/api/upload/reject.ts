import connect from "lib/mongo";
import PhotoBatch from "models/PhotoBatch";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  const { id }: any = req.query;
  const { imageId }: any = req.body;

  try {
    if (!id || !imageId) throw new Error("Invalid request");
    await connect();

    const batch = await PhotoBatch.findById(id);
    if (!batch) throw new Error("Batch not found");

    const img = batch.images.find((img) => img._id?.toString() === imageId);
    if (!img) throw new Error("Image not found");

    const isBatchReviewed = batch.images.every((img) => img.status !== "pending" || img._id?.toString() === imageId);

    await PhotoBatch.updateOne(
      { _id: id, "images._id": imageId },
      { $set: { "images.$.status": "rejected", isReviewed: isBatchReviewed } }
    );
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
