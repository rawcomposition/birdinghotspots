import mongoose from "mongoose";
import { SpeciesT } from "lib/types";
const { Schema, model, models } = mongoose;

const SpeciesSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  hasImg: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
  },
  sciName: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  sourceId: {
    type: String,
    required: true,
  },
  iNatObsId: String,
  author: String,
  license: String,
  crop: {
    percent: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
    },
    pixel: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
    },
  },
  active: {
    type: Boolean,
    default: true,
  },
  needsDownload: Boolean,
});

const Species = models.Species || model("Species", SpeciesSchema);

export default Species as mongoose.Model<SpeciesT>;
