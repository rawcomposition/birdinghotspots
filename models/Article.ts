import mongoose from "mongoose";
import dayjs from "dayjs";
const { Schema, model, models } = mongoose;

const ArticleSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  articleId: {
    type: String,
    unique: true,
  },
  int: {
    type: Number,
    unique: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  stateCode: String,
  content: String,
  sortHotspotsBy: {
    type: String,
    enum: ["region", "species", "none"],
    default: "name",
  },
  hotspots: [
    {
      type: Schema.Types.ObjectId,
      ref: "Hotspot",
    },
  ],
  images: [
    {
      xsUrl: String,
      smUrl: String,
      lgUrl: String,
      originalUrl: String,
      by: String,
      width: Number,
      height: Number,
      size: Number,
      caption: String,
    },
  ],
  createdAt: {
    type: "string",
    default: () => dayjs().format("YYYY-MM-DD"),
    required: true,
  },
});

ArticleSchema.index({ stateCode: 1 });

ArticleSchema.pre("save", function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  Article.findOne({})
    .sort({ int: -1 })
    .then((last) => {
      const lastInt = last?.int || 1001;
      const newInt = lastInt + 1;
      this.articleId = `A${newInt}`;
      this.int = newInt;
      next();
    })
    .catch((err) => {
      next(err);
    });
});

const Article = models.Article || model("Article", ArticleSchema);

export default Article;
