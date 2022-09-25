import mongoose from "mongoose";
import dayjs from "dayjs";
const { Schema, model, models } = mongoose;

const RevisionSchema = new Schema({
  locationId: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  stateCode: {
    type: String,
    required: true,
  },
  countyCode: {
    type: String,
    required: true,
  },
  by: String,
  email: String,
  about: String,
  tips: String,
  birds: String,
  hikes: String,
  notes: String,
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

const Revision = models.Revision || model("Revision", RevisionSchema);

export default Revision;
