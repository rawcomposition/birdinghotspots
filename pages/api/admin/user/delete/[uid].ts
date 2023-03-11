import admin from "lib/firebaseAdmin";
import Profile from "models/Profile";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  const { uid }: any = req.query;
  try {
    await admin.deleteUser(uid);
    await Profile.deleteOne({ uid });

    try {
      await res.revalidate("/about");
    } catch (err) {}

    res.status(200).json({ message: "User deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
}, "admin");
