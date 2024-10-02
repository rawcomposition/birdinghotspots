import connect from "lib/mongo";
import Species from "models/Species";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  const { code } = req.query;

  try {
    await connect();

    await Species.updateOne(
      { _id: code },
      {
        $unset: {
          downloadedAt: 1,
          hasImg: 1,
          author: 1,
          crop: 1,
          iNatFileExt: 1,
          iNatObsId: 1,
          license: 1,
          sourceId: 1,
          source: 1,
        },
      }
    );

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "admin");
