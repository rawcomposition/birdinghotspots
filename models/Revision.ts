import mongoose from "mongoose";
import { Revision as RevisionType } from "lib/types";
import dayjs from "dayjs";
const { Schema, model, models } = mongoose;

const RevisionSchema = new Schema({
  locationId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  stateCode: String,
  countyCode: String,
  by: String,
  email: String,
  about: {
    old: String,
    new: String,
  },
  tips: {
    old: String,
    new: String,
  },
  birds: {
    old: String,
    new: String,
  },
  hikes: {
    old: String,
    new: String,
  },
  notes: String,
  roadside: {
    old: String,
    new: String,
  },
  restrooms: {
    old: String,
    new: String,
  },
  accessible: {
    old: String,
    new: String,
  },
  fee: {
    old: String,
    new: String,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: "string",
    default: () => dayjs().format(),
    required: true,
  },
});

RevisionSchema.index({ status: 1 });

const Revision = models.Revision || model("Revision", RevisionSchema);

export default Revision as mongoose.Model<RevisionType>;
