import connect from "lib/mongo";
import Profile from "models/Profile";
import admin from "lib/firebaseAdmin";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  const uid = token.uid;
  try {
    await connect();
    const profile = uid ? await Profile.findOne({ uid }) : null;
    const { subscriptions, email, name, password, emailFrequency } = req.body;

    await admin.updateUser(uid, password ? { password, email, displayName: name } : { email, displayName: name });

    if (!profile) {
      await Profile.create({ uid, subscriptions, email, name, emailFrequency });
    } else {
      await Profile.updateOne({ uid }, { subscriptions, email, name, emailFrequency });
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "admin");
