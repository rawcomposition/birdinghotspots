import connect from "lib/mongo";
import Revision from "models/Revision";
import Hotspot from "models/Hotspot";
import secureApi from "lib/secureApi";
import dayjs from "dayjs";

export default secureApi(async (req, res, token) => {
  const { id }: any = req.query;

  try {
    await connect();
    const revision = await Revision.findOne({ _id: id });
    if (!revision) {
      res.status(500).json({ error: "suggestion not found" });
      return;
    }

    const shouldCite = !!revision.plan?.new || !!revision.birding?.new || !!revision.about?.new;

    const hotspot = await Hotspot.findOne({ locationId: revision.locationId });
    if (!hotspot) {
      res.status(500).json({ error: "Hotspot not found" });
      return;
    }

    const plan = typeof revision.plan?.new === "string" ? revision.plan?.new : hotspot.plan;
    const birding = typeof revision.birding?.new === "string" ? revision.birding?.new : hotspot.birding;
    const about = typeof revision.about?.new === "string" ? revision.about?.new : hotspot.about;
    const roadside = revision.roadside?.new || hotspot.roadside;
    const restrooms = revision.restrooms?.new || hotspot.restrooms;
    const accessible = revision.accessible?.new || hotspot.accessible;
    const fee = revision.fee?.new || hotspot.fee;

    const noContent = !about?.trim() && !plan?.trim() && !birding?.trim();

    const updatedAt = dayjs().format();
    await Hotspot.updateOne(
      { locationId: revision.locationId },
      {
        $set: {
          noContent,
          about,
          plan,
          birding,
          roadside,
          restrooms,
          accessible,
          fee,
          updatedAt,
        },
      }
    );
    await Revision.updateOne({ _id: id }, { status: "approved" });

    if (
      shouldCite &&
      !hotspot.citations?.find(({ label }: any) => label.trim().toLowerCase() === revision.by.trim().toLowerCase())
    ) {
      hotspot.citations?.push({ label: revision.by });
      await hotspot.save();
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
