import admin from "lib/firebaseAdmin";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  const { uid }: any = req.query;
  try {
    const user = await admin.getUser(uid);
    if (user.disabled) {
      await admin.updateUser(uid, { disabled: false });
      res.status(200).json({ success: true, message: "User activated successfully" });
    } else {
      await admin.updateUser(uid, { disabled: true });
      res.status(200).json({ success: true, message: "User deactivated successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating user status" });
  }
}, "admin");
