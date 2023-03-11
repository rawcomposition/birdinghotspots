import mongoose from "mongoose";
import { Iba as IbaType } from "lib/types";
const { Schema, model, models } = mongoose;

const PointSchema = new Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const GeoSchema = new Schema({
  type: {
    type: String,
    enum: ["Polygon", "MultiPolygon"],
  },
  coordinates: {
    type: Schema.Types.Mixed,
  },
});

const IbaSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  globalId: String,
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  location: PointSchema,
  polygon: GeoSchema,
  website: String,
  ebirdUrl: String,
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
  },
  hotspots: [
    {
      type: Schema.Types.ObjectId,
      ref: "Hotspot",
    },
  ],
});

IbaSchema.index({ location: "2dsphere" });
IbaSchema.index({ polygon: "2dsphere" });
IbaSchema.index({ stateCode: 1 });

const Iba = models.Iba || model("Iba", IbaSchema);

export default Iba as mongoose.Model<IbaType>;
