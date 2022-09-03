import type { NextApiRequest, NextApiResponse } from "next";
import nookies from "nookies";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    nookies.destroy({ res }, "session", { path: "/" });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(401).json({ message: "Error closing session" });
  }
}
