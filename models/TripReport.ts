import { TripReportT } from "lib/types";
import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

type SchemaT = Record<keyof Omit<TripReportT, "_id" | "createdAt" | "updatedAt">, any>;

export const fields: SchemaT = {
  locationId: {
    type: String,
    required: true,
  },
  checklistId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  distance: String,
  duration: String,
  species: String,
  profileId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  images: [
    {
      smUrl: String,
      lgUrl: String,
      originalUrl: String,
      width: Number,
      height: Number,
      caption: String,
    },
  ],
};

const TripReportSchema = new Schema(fields, {
  timestamps: true,
});

const TripReport = models?.TripReport || model("TripReport", TripReportSchema);

export default TripReport as mongoose.Model<TripReportT>;
