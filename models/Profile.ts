import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const ProfileSchema = new Schema({
  uid: {
    type: "string",
    required: true,
    unique: true,
  },
  name: String,
  inviteCode: {
    type: "string",
    unique: true,
  },
  email: {
    type: "string",
    required: true,
  },
  subscriptions: [
    {
      type: String,
    },
  ],
});

const Profile = models.Profile || model("Profile", ProfileSchema);

export default Profile;
