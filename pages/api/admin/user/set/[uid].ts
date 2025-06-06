import admin from "lib/firebaseAdmin";
import Profile from "models/Profile";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  const { data } = req.body;
  const uid = req.query.uid as string;

  try {
    await admin.updateUser(uid, {
      displayName: data.name,
      email: data.email,
    });
    await admin.setCustomUserClaims(uid, {
      role: data.role || "user",
      regions: data.role === "editor" ? data.regions || [] : null,
    });

    const profile = uid ? await Profile.findOne({ uid }) : null;
    const { subscriptions, email, name, emailFrequency, ebirdId } = data;

    if (!profile) {
      await Profile.create({ uid, subscriptions, email, name, emailFrequency, ebirdId });
    } else {
      await Profile.updateOne({ uid }, { subscriptions, email, name, emailFrequency, ebirdId });
    }

    try {
      await res.revalidate("/about");
    } catch (err) {}

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
}, "admin");
