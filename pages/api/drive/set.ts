import connect from "lib/mongo";
import Drive from "models/Drive";
import Hotspot from "models/Hotspot";
import Logs from "models/Log";
import secureApi from "lib/secureApi";
import { canEdit } from "lib/helpers";
import { generateRandomId } from "lib/helpers";

export default secureApi(async (req, res, token) => {
  const { isNew }: any = req.query;
  const { data, id } = req.body;

  if (!canEdit(token, data.stateCode || data.countryCode)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await connect();
    let driveId = id;
    if (isNew === "true") {
      const newDrive = await Drive.create({ ...data, locationId: `D${generateRandomId()}` });
      driveId = newDrive._id;
    } else {
      await Drive.updateOne({ _id: id }, data);
    }

    const hotspotIds = data.entries.map((entry: any) => entry.hotspot);

    await Hotspot.updateMany(
      { "drives.driveId": { $ne: driveId }, _id: { $in: hotspotIds } },
      // @ts-ignore
      { $push: { drives: { slug: data.slug, name: data.name, driveId } } }
    );

    await Hotspot.updateMany(
      { drives: { $elemMatch: { driveId } }, _id: { $nin: hotspotIds } },
      // @ts-ignore
      { $pull: { drives: { driveId } } }
    );

    try {
      await Logs.create({
        user: token.name,
        uid: token.uid,
        type: isNew ? "add_drive" : "edit_drive",
        message: `${isNew ? "added" : "edited"} drive: ${data.name}`,
        driveId: driveId.toString(),
      });
    } catch (error) {}

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
