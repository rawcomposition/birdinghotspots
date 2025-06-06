import admin from "lib/firebaseAdmin";
import secureApi from "lib/secureApi";
import { getRegion } from "lib/localData";
import Profile from "models/Profile";
import connect from "lib/mongo";

export default secureApi(async (req, res, token) => {
  await connect();

  const [firebaseUsers, profiles] = await Promise.all([admin.listUsers(), Profile.find({}).lean()]);
  const users = firebaseUsers.users
    .filter(({ email }) => email)
    .map(({ email, displayName, uid, customClaims, passwordHash, disabled }) => {
      const profile = uid ? profiles.find((profile) => profile.uid === uid) : null;
      return {
        displayName,
        email,
        uid,
        role: customClaims?.role,
        regions: customClaims?.role === "admin" ? ["All"] : customClaims?.regions?.map(getRegion),
        status: disabled ? "Deactivated" : passwordHash ? "Active" : "Invited",
        disabled: disabled || false,
        ebirdId: profile?.ebirdId,
      };
    });

  res.status(200).json({ users });
}, "admin");
