import mongoose from "mongoose";
import dayjs from "dayjs";
const { Schema, model, models } = mongoose;

const LinkSchema = new Schema({
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
  lat: Number,
  lng: Number,
  zoom: {
    type: Number,
    default: 15,
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
  restrooms: {
    type: String,
    default: null,
  },
  hotspots: [
    {
      type: Schema.Types.ObjectId,
      ref: "Hotspot",
    },
  ],
  images: [
    {
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
    default: dayjs().format("YYYY-MM-DD"),
    required: true,
  },
});

const Group = models.Group || model("Group", GroupSchema);

export default Group;
