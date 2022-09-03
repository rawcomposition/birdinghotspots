import type { NextApiRequest, NextApiResponse } from "next";
import admin from "lib/firebaseAdmin";
import nookies from "nookies";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const cookies = nookies.get({ req });
  const token = cookies.session;

  const result = await admin.verifySessionCookie(token || "");
  if (result.role !== "admin") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const request = await admin.listUsers();
  const response = request.users
    .filter(({ email }) => email)
    .map(({ email, displayName, uid, customClaims, passwordHash }) => ({
      displayName,
      email,
      uid,
      role: customClaims?.role,
      regions: customClaims?.role === "admin" ? ["All"] : customClaims?.regions || [],
      status: passwordHash ? "Active" : "Invited",
    }));

  res.status(200).json({ users: response });
}
