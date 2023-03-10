import type { NextApiRequest, NextApiResponse } from "next";
import admin from "lib/firebaseAdmin";
import nookies from "nookies";
import type { Token } from "lib/types";

type Callback = (req: NextApiRequest, res: NextApiResponse, token: Token) => Promise<void>;

export default function secureApi(callback: Callback, requireRole?: "admin" | "editor") {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const cookies = nookies.get({ req });
    const token = cookies.session;

    let result;
    try {
      result = await admin.verifySessionCookie(token || "");
    } catch (error) {}

    const tokenObj = { ...result, isAdmin: result?.role === "admin" };

    if (requireRole && result?.role !== requireRole && result?.role !== "admin") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    } else if (!result?.uid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    return await callback(req, res, tokenObj as Token);
  };
}
