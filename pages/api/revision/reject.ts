import connect from "lib/mongo";
import Revision from "models/Revision";
import secureApi from "lib/secureApi";
import { assertWriteEnabled } from "lib/config";

export default secureApi(async (req, res, token) => {
  if (!assertWriteEnabled(res, token.role)) return;
  const { id }: any = req.query;

  try {
    await connect();
    await Revision.updateOne({ _id: id }, { status: "rejected" });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
