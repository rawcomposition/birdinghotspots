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
  images: [
    {
      sm: String,
      md: String,
      lg: String,
    },
  ],
  source: {
    type: String,
    required: true,
  },
  sourceId: {
    type: String,
    required: true,
  },
  isVerified: Boolean,
  author: String,
  license: String,
  active: {
    type: Boolean,
    default: true,
  },
});

const Species = models.Species || model("Species", SpeciesSchema);

export default Species as mongoose.Model<SpeciesT>;
