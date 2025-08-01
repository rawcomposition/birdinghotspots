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
  plan: {
    old: String,
    new: String,
  },
  birding: {
    old: String,
    new: String,
  },
  about: {
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
