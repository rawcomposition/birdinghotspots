import connect from "lib/mongo";
import RegionInfo from "models/RegionInfo";
import secureApi from "lib/secureApi";
import { canEdit } from "lib/helpers";

export default secureApi(async (req, res, token) => {
  const { data, code } = req.body;

  if (!canEdit(token, code)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await connect();
    const current = await RegionInfo.findOne({ code });
    if (current) {
      await RegionInfo.updateOne({ code }, { $set: data });
    } else {
      await RegionInfo.create({ ...data, code });
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
