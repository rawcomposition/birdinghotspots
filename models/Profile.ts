import { Profile as ProfileT } from "lib/types";
import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const ProfileSchema = new Schema({
  uid: {
    type: "string",
    required: true,
    unique: true,
  },
  name: String,
  inviteCode: String,
  email: {
    type: "string",
    required: true,
  },
  ebirdId: String,
  subscriptions: [
    {
      type: String,
    },
  ],
  emailFrequency: {
    type: "string",
    enum: ["daily", "instant", "none"],
    default: "daily",
    required: true,
  },
});

const Profile = models.Profile || model("Profile", ProfileSchema);

export default Profile as mongoose.Model<ProfileT>;
