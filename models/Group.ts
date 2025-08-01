import mongoose from "mongoose";
import dayjs from "dayjs";
const { Schema, model, models } = mongoose;
import { Group as GroupT } from "lib/types";

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
  mapImgUrl: String,
  url: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  stateCodes: [String],
  countyCodes: {
    type: [String],
    required: true,
  },
  locationId: {
    type: String,
    required: true,
    unique: true,
  },
  plan: String,
  birding: String,
  about: String,
  address: String,
  links: [LinkSchema],
  webpage: String,
  citeWebpage: Boolean,
  trailMap: String,
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
      by: String,
      width: Number,
      height: Number,
      size: Number,
      caption: String,
      hideFromChildren: Boolean,
    },
  ],
  hotspotCount: Number,
  primaryHotspot: {
    type: Schema.Types.ObjectId,
    ref: "Hotspot",
  },
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
GroupSchema.index({ hotspotCount: -1, name: 1 });
GroupSchema.index({ hotspotCount: -1 });

const Group = models.Group || model("Group", GroupSchema);

export default Group as mongoose.Model<GroupT>;
