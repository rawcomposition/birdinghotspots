import connect from "lib/mongo";
import Settings from "models/Settings";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  try {
    await connect();
    const { featuredIds } = req.body;
    await Settings.updateOne({ key: "global" }, { $set: { featuredIds } });
    await res.revalidate("/");
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "admin");
