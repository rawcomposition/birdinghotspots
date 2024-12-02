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
  source: String,
  sourceId: String,
  iNatObsId: String,
  iNatUserId: String,
  iNatFileExt: String,
  author: String,
  license: String,
  licenseVer: String,
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
  downloadedAt: Date,
  familyCode: String,
  taxonVersions: [String],
  flip: Boolean,
});

const Species = models.Species || model("Species", SpeciesSchema);

export default Species as mongoose.Model<SpeciesT>;
