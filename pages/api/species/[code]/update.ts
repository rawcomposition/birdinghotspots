import connect from "lib/mongo";
import Species from "models/Species";
import secureApi from "lib/secureApi";
import { SpeciesInput } from "lib/types";

export default secureApi(async (req, res, token) => {
  const { code } = req.query;
  const data: SpeciesInput = req.body;

  try {
    await connect();

    await Species.updateOne({ _id: code }, { $set: { ...data, hasImg: true }, $unset: { downloadedAt: 1 } });

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "admin");
