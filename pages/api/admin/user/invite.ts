import admin from "lib/firebaseAdmin";
import Profile from "models/Profile";
import { v4 as uuidv4 } from "uuid";
import { sendInviteEmail } from "lib/email";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  try {
    const { name, email, regions, subscriptions } = req.body;

    const inviteCode = uuidv4();

    const user = await admin.createUser({
      email,
      displayName: name,
    });

    await Profile.create({
      uid: user.uid,
      email,
      name,
      subscriptions,
      inviteCode,
    });

    await admin.setCustomUserClaims(user?.uid, {
      role: "editor",
      regions,
    });

    try {
      await sendInviteEmail(name, email, inviteCode);
    } catch (error) {}

    try {
      await res.revalidate("/about");
    } catch (err) {}

    res.status(200).json({ message: "User invited successfully", success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "admin");
