import Hotspot from "models/Hotspot";
import Group from "models/Group";
import connect from "lib/mongo";

export default async function handler(req: any, res: any) {
  try {
    await connect();

    const groups = await Group.find({}, ["hotspots"]);

    for (const group of groups) {
      await Hotspot.updateMany({ _id: { $in: group.hotspots } }, { $addToSet: { groupIds: group._id } });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
}
