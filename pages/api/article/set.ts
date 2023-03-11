import connect from "lib/mongo";
import Article from "models/Article";
import { getStateByCode } from "lib/localData";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  const { isNew }: any = req.query;
  const { data, id } = req.body;

  if (!token.isAdmin && !token.regions?.includes(data?.stateCode)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const state = getStateByCode(data?.stateCode);
    if (!state) {
      throw new Error("Invalid state code");
    }
    await connect();
    if (isNew === "true") {
      await Article.create({ ...data, _id: id });
    } else {
      await Article.updateOne({ _id: id }, data);
    }

    await res.revalidate(`/${state.country.toLowerCase()}/${state.slug}`);

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
