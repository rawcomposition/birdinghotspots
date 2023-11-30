import mongoose from "mongoose";
import dayjs from "dayjs";
const { Schema, model, models } = mongoose;

const LinkSchema = new Schema({
  label: String,
  url: String,
  cite: Boolean,
});

const CitationSchema = new Schema({
  label: String,
  url: String,
});

const GroupSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  stateCodes: {
    type: [String],
    required: true,
  },
  countyCodes: {
    type: [String],
    required: true,
  },
  locationId: {
    type: String,
    required: true,
    unique: true,
  },
  about: String,
  tips: String,
  birds: String,
  hikes: String,
  address: String,
  links: [LinkSchema],
  webpage: String,
  citeWebpage: Boolean,
  citations: [CitationSchema],
  restrooms: {
    type: String,
    enum: ["Yes", "No", "Unknown"],
    default: "Unknown",
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
      caption: String,
      hideFromChildren: Boolean,
    },
  ],
  createdAt: {
    type: "string",
    default: () => dayjs().format(),
    required: true,
  },
  updatedAt: String,
});

GroupSchema.index({ hotspots: 1 });
GroupSchema.index({ locationId: 1 });
GroupSchema.index({ stateCodes: 1, name: 1 });
GroupSchema.index({ countyCodes: 1, name: 1 });

const Group = models.Group || model("Group", GroupSchema);

export default Group;
