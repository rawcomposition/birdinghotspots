import mongoose from "mongoose";
import dayjs from "dayjs";
const { Schema, model, models } = mongoose;

const DriveSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  locationId: {
    type: String,
    unique: true,
  },
  int: {
    type: Number,
    unique: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  stateCode: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  description: String,
  mapId: String,
  counties: Array,
  entries: [
    {
      hotspot: {
        type: Schema.Types.ObjectId,
        ref: "Hotspot",
      },
      description: String,
    },
  ],
  images: [
    {
      smUrl: String,
      lgUrl: String,
      originalUrl: String,
      by: String,
      width: Number,
      height: Number,
      caption: String,
      legacy: Boolean,
    },
  ],
  createdAt: {
    type: "string",
    default: () => dayjs().format("YYYY-MM-DD"),
    required: true,
  },
});

DriveSchema.index({ stateCode: 1, name: 1 });

DriveSchema.pre("save", function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  Drive.findOne({})
    .sort({ int: -1 })
    .then((last) => {
      const lastInt = last?.int || 1001;
      const newInt = lastInt + 1;
      this.locationId = `D${newInt}`;
      this.int = newInt;
      next();
    })
    .catch((err) => {
      next(err);
    });
});

const Drive = models.Drive || model("Drive", DriveSchema);

export default Drive;
