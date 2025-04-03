import mongoose from "mongoose";
import dayjs from "dayjs";
const { Schema, model, models } = mongoose;
import { Hotspot as HotspotT } from "lib/types";

const LinkSchema = new Schema({
  label: String,
  url: String,
  cite: Boolean,
});

const CitationSchema = new Schema({
  label: String,
  url: String,
});

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

const HotspotSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  stateCode: String,
  countyCode: String,
  lat: Number,
  lng: Number,
  location: PointSchema,
  zoom: {
    type: Number,
    default: 15,
  },
  locationId: {
    type: String,
    required: true,
    unique: true,
  },
  about: String,
  tips: String,
  birds: String,
  hikes: String,
  address: String,
  links: [LinkSchema],
  webpage: String,
  citeWebpage: Boolean,
  citations: [CitationSchema],
  roadside: {
    type: String,
    enum: ["Yes", "No", "Unknown"],
    default: "Unknown",
  },
  restrooms: {
    type: String,
    enum: ["Yes", "No", "Unknown"],
    default: "Unknown",
  },
  accessible: {
    type: String,
    enum: ["Yes", "No", "Unknown"],
    default: "Unknown",
  },
  fee: {
    type: String,
    enum: ["Yes", "No", "Unknown"],
    default: "Unknown",
  },
  iba: {
    value: String,
    label: String,
  },
  drives: [
    {
      locationId: String,
      name: String,
      driveId: {
        type: Schema.Types.ObjectId,
        ref: "Drive",
      },
    },
  ],
  featuredEbirdId: String,
  images: [
    {
      xsUrl: String,
      smUrl: String,
      lgUrl: String,
      by: String,
      email: String,
      uid: String,
      isMap: Boolean,
      isStreetview: Boolean,
      isPublicDomain: Boolean,
      width: Number,
      height: Number,
      size: Number,
      caption: String,
      legacy: Boolean,
      streetviewData: Object,
      ebirdId: Number,
      ebirdDateDisplay: String,
      isMigrated: Boolean,
    },
  ],
  featuredImg: {
    xsUrl: String,
    smUrl: String,
    lgUrl: String,
    by: String,
    width: Number,
    height: Number,
    size: Number,
    caption: String,
    legacy: Boolean,
    isStreetview: Boolean,
    streetviewData: Object,
    ebirdId: Number,
    ebirdDateDisplay: String,
  },
  groupIds: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  createdAt: {
    type: "string",
    default: () => dayjs().format(),
    required: true,
  },
  updatedAt: String,
  species: Number,
  noContent: Boolean,
  needsDeleting: Boolean,
});

HotspotSchema.virtual("groups", {
  localField: "groupIds",
  foreignField: "_id",
  ref: "Group",
});

HotspotSchema.index({ location: "2dsphere" });
HotspotSchema.index({ locationId: 1 });
HotspotSchema.index({ countyCode: 1 });
HotspotSchema.index({ stateCode: 1 });
HotspotSchema.index({ stateCode: 1, name: 1 });
HotspotSchema.index({ name: 1 });
HotspotSchema.index({ locationId: 1, name: 1, _id: 1 }); //Hotspot async select
HotspotSchema.index({ countyCode: 1, species: -1, name: 1 }); //Top county hotspots
HotspotSchema.index({ stateCode: 1, species: -1, name: 1 }); //Top state hotspots
HotspotSchema.index({ "iba.value": 1, name: 1 });
HotspotSchema.index({ roadside: 1, name: 1, stateCode: 1 });
HotspotSchema.index({ accessible: 1, name: 1, stateCode: 1 });
HotspotSchema.index({ groupIds: 1 });
HotspotSchema.index({ stateCode: 1, noContent: 1, groupIds: 1 });
HotspotSchema.index({ countyCode: 1, noContent: 1, groupIds: 1 });

const Hotspot = models.Hotspot || model("Hotspot", HotspotSchema);

export default Hotspot as mongoose.Model<HotspotT>;
