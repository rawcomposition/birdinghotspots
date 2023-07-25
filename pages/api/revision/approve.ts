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

    const shouldCite = !!revision.tips?.new && !!revision.birds?.new && !!revision.about?.new && !!revision.hikes?.new;

    const hotspot = await Hotspot.findOne({ locationId: revision.locationId });
    if (!hotspot) {
      res.status(500).json({ error: "Hotspot not found" });
      return;
    }

    const about = revision.about?.new || hotspot.about;
    const tips = revision.tips?.new || hotspot.tips;
    const birds = revision.birds?.new || hotspot.birds;
    const hikes = revision.hikes?.new || hotspot.hikes;
    const roadside = revision.roadside?.new || hotspot.roadside;
    const restrooms = revision.restrooms?.new || hotspot.restrooms;
    const accessible = revision.accessible?.new || hotspot.accessible;
    const fee = revision.fee?.new || hotspot.fee;

    const noContent = !about && !tips && !birds && !hikes;

    const updatedAt = dayjs().format();
    await Hotspot.updateOne(
      { locationId: revision.locationId },
      {
        $set: {
          noContent,
          about,
          tips,
          birds,
          hikes,
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
      !hotspot.citations.find(({ label }: any) => label.trim().toLowerCase() === revision.by.trim().toLowerCase())
    ) {
      hotspot.citations.push({ label: revision.by });
      await hotspot.save();
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
