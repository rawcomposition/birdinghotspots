import mongoose from "mongoose";
const { Schema, model, models } = mongoose;
import dayjs from "dayjs";

const LogsSchema = new Schema({
  user: String,
  uid: String,
  message: String,
  hotspotId: String,
  driveId: String,
  groupId: String,
  type: String,
  createdAt: {
    type: "string",
    default: () => dayjs().format(),
  },
});

const Logs = models.Logs || model("Logs", LogsSchema);

export default Logs;
