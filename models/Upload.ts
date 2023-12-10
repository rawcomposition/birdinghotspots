import mongoose from "mongoose";
const { Schema, model, models } = mongoose;
import dayjs from "dayjs";

const UploadSchema = new Schema({
  locationId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  xsUrl: String,
  smUrl: {
    type: String,
    required: true,
  },
  lgUrl: {
    type: String,
    required: true,
  },
  originalUrl: String,
  by: {
    type: String,
    required: true,
  },
  email: String,
  uid: String,
  width: Number,
  height: Number,
  size: Number,
  caption: String,
  countryCode: {
    type: String,
    required: true,
  },
  stateCode: String,
  countyCode: String,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: () => dayjs().format(),
  },
});

UploadSchema.index({ status: 1 });

const Upload = models.Upload || model("Upload", UploadSchema);

export default Upload;
