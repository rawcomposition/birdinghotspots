import mongoose from "mongoose";
import { Species as SpeciesType } from "lib/types";
const { Schema, model, models } = mongoose;

const SpeciesSchema = new Schema({
  _id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  sciName: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  images: [
    {
      smUrl: String,
      lgUrl: String,
      originalUrl: String,
      by: String,
      width: Number,
      height: Number,
      caption: String,
    },
  ],
});

const Species = models.Species || model("Species", SpeciesSchema);

export default Species as mongoose.Model<SpeciesType>;
