import mongoose from "mongoose";
const { Schema, model, models } = mongoose;
import dayjs from "dayjs";

const UploadSchema = new Schema({
  locationId: {
    type: String,
    required: true,
  },
  smUrl: String,
  lgUrl: String,
  originalUrl: String,
  by: String,
  email: String,
  width: Number,
  height: Number,
  caption: String,
  countryCode: String,
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

const Upload = models.Upload || model("Upload", UploadSchema);

export default Upload;
