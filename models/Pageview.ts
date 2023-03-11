import mongoose from "mongoose";
import { Pageview as PageviewType } from "lib/types";
import dayjs from "dayjs";
const { Schema, model, models } = mongoose;

const PageviewSchema = new Schema({
  count: {
    type: Number,
    default: 1,
    required: true,
  },
  locationId: String,
  stateCode: String,
  countyCode: String,
  countryCode: String,
  entity: {
    type: String,
    enum: ["hotspot", "group", "county", "state"],
    required: true,
  },
  year: {
    type: "number",
    default: () => Number(dayjs().format("YYYY")),
    required: true,
  },
  month: {
    type: "number",
    default: () => Number(dayjs().format("M")),
    required: true,
  },
});

const Pageview = models.Pageview || model("Pageview", PageviewSchema);

export default Pageview as mongoose.Model<PageviewType>;
