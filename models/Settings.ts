import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const SettingsSchema = new Schema({
  lastSyncRegion: String,
});

const Settings = models.Settings || model("Settings", SettingsSchema);

export default Settings;
