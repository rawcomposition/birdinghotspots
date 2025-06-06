import admin from "lib/firebaseAdmin";
import secureApi from "lib/secureApi";
import { getRegion } from "lib/localData";

export default secureApi(async (req, res, token) => {
  const request = await admin.listUsers();
  const response = request.users
    .filter(({ email }) => email)
    .map(({ email, displayName, uid, customClaims, passwordHash, disabled }) => ({
      displayName,
      email,
      uid,
      role: customClaims?.role,
      regions: customClaims?.role === "admin" ? ["All"] : customClaims?.regions?.map(getRegion),
      status: disabled ? "Deactivated" : passwordHash ? "Active" : "Invited",
      disabled: disabled || false,
    }));

  res.status(200).json({ users: response });
}, "admin");
