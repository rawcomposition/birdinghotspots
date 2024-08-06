import Profile from "models/Profile";
import { sendInviteEmail } from "lib/email";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  try {
    const { email } = req.body;

    const profile = await Profile.findOne({ email }).lean();
    const { name, inviteCode } = profile || {};

    if (!inviteCode) {
      res.status(401).json({ message: "No invite code" });
      return;
    }

    try {
      await sendInviteEmail(name || "User", email, inviteCode);
    } catch (error) {}

    res.status(200).json({ message: "Email resent successfully", success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "admin");
