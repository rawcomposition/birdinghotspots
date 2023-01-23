import mongoose from "mongoose";
import { RegionInfo as RegionInfoType } from "lib/types";
const { Schema, model, models } = mongoose;

const LinkSchema = new Schema(
  {
    label: String,
    url: String,
  },
  { _id: false }
);

const RegionInfoSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  websitesHeading: String,
  socialHeading: String,
  clubsHeading: String,
  websiteLinks: [LinkSchema],
  socialLinks: [LinkSchema],
  clubLinks: [LinkSchema],
});

const RegionInfo = models.RegionInfo || model("RegionInfo", RegionInfoSchema);

export default RegionInfo as mongoose.Model<RegionInfoType>;
