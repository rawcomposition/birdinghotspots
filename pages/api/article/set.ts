import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import admin from "lib/firebaseAdmin";
import Article from "models/Article";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;
  const { isNew }: any = req.query;
  const { data, id } = req.body;

  const result = await admin.verifyIdToken(token || "");
  if (result.role !== "admin" && !result.regions?.includes(data?.stateCode)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await connect();
    if (isNew === "true") {
      await Article.create({ ...data, _id: id });
    } else {
      await Article.updateOne({ _id: id }, data);
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
