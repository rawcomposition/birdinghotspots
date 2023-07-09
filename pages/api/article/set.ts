import connect from "lib/mongo";
import Article from "models/Article";
import secureApi from "lib/secureApi";
import { canEdit } from "lib/helpers";

export default secureApi(async (req, res, token) => {
  const { isNew }: any = req.query;
  const { data, id } = req.body;

  if (!canEdit(token, data.stateCode || data.countryCode)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await connect();
    if (isNew === "true") {
      const article = await Article.create(data);
      res.status(200).json({ success: true, articleId: article.articleId });
    } else {
      await Article.updateOne({ _id: id }, data);
      res.status(200).json({ success: true, articleId: data.articleId });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
