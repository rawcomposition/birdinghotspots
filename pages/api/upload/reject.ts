import connect from "lib/mongo";
import Upload from "models/Upload";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  const { id }: any = req.query;

  try {
    await connect();
    await Upload.updateOne({ _id: id }, { status: "rejected" });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
