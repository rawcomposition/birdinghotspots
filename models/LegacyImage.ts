import mongoose from "mongoose";
const { Schema, model, models } = mongoose;
import { LegacyImage as LegacyImageT } from "lib/types";

const LegacyImageSchema = new Schema(
  {
    locationId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["hotspot", "group"],
      required: true,
    },
    xsUrl: String,
    smUrl: {
      type: String,
      required: true,
    },
    lgUrl: String,
    by: String,
    email: String,
    uid: String,
    caption: String,
    width: Number,
    height: Number,
    size: Number,
    isMap: Boolean,
    isStreetview: Boolean,
    isPublicDomain: Boolean,
    legacy: Boolean,
    streetviewData: Object,
    isMigrated: Boolean,
    hideFromChildren: Boolean,
    order: Number,
  },
  { timestamps: true }
);

const LegacyImage = models.LegacyImage || model("LegacyImage", LegacyImageSchema);

export default LegacyImage as mongoose.Model<LegacyImageT>;
