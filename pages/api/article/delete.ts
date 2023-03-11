import connect from "lib/mongo";
import Article from "models/Article";
import { getStateByCode } from "lib/localData";
import secureApi from "lib/secureApi";
import { canEdit } from "lib/helpers";

export default secureApi(async (req, res, token) => {
  const { id }: any = req.query;

  await connect();
  const article = await Article.findById(id);

  if (!canEdit(token, article?.stateCode)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const state = getStateByCode(article?.stateCode);
    if (!state) {
      throw new Error("Invalid state code");
    }

    await Article.findByIdAndDelete(id);

    await res.revalidate(`/${state.country.toLowerCase()}/${state.slug}`);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
