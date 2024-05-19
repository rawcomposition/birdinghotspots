import admin from "lib/firebaseAdmin";
import secureApi from "lib/secureApi";
import { getRegion } from "lib/localData";

export default secureApi(async (req, res, token) => {
  const request = await admin.listUsers();
  const response = request.users
    .filter(({ email }) => email)
    .map(({ email, displayName, uid, customClaims, passwordHash }) => ({
      displayName,
      email,
      uid,
      role: customClaims?.role,
      regions: customClaims?.role === "admin" ? ["All"] : customClaims?.regions?.map(getRegion),
      status: passwordHash ? "Active" : "Invited",
    }));

  res.status(200).json({ users: response });
}, "admin");
