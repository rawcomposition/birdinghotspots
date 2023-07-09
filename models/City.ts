import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const CitySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  locationId: {
    type: String,
    required: true,
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
  slug: String,
  countyName: String,
  pop: Number,
  density: Number,
  tz: String,
  lat: Number,
  lng: Number,
});

CitySchema.index({ stateCode: 1, name: 1 });

const City = models.City || model("City", CitySchema);

export default City;
