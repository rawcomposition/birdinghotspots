import connect from "lib/mongo";
import Drive from "models/Drive";
import Hotspot from "models/Hotspot";
import Logs from "models/Log";
import secureApi from "lib/secureApi";
import { canEdit } from "lib/helpers";

export default secureApi(async (req, res, token) => {
  const { id }: any = req.query;

  await connect();
  const drive = await Drive.findById(id);

  if (!canEdit(token, drive?.stateCode)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await connect();
    await Drive.deleteOne({ _id: id });
    await Hotspot.updateMany({ drives: { $elemMatch: { driveId: id } } }, { $pull: { drives: { driveId: id } } });

    try {
      await Logs.create({
        user: token.name,
        uid: token.uid,
        type: "delete_drive",
        message: `deleted drive: ${drive.name}`,
        driveId: drive._id.toString(),
      });
    } catch (error) {}

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
