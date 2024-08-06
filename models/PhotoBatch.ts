import mongoose from "mongoose";
import { PhotoBatchT } from "lib/types";
import dayjs from "dayjs";
const { Schema, model, models } = mongoose;

const PhotoBatchSchema = new Schema({
  locationId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  by: {
    type: String,
    required: true,
  },
  email: String,
  uid: String,
  countryCode: {
    type: String,
    required: true,
  },
  stateCode: String,
  countyCode: String,
  images: [
    {
      xsUrl: String,
      smUrl: {
        type: String,
        required: true,
      },
      lgUrl: {
        type: String,
        required: true,
      },
      width: Number,
      height: Number,
      size: Number,
      caption: String,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: () => dayjs().format(),
  },
});

const PhotoBatch = models.PhotoBatch || model("PhotoBatch", PhotoBatchSchema);

export default PhotoBatch as mongoose.Model<PhotoBatchT>;
