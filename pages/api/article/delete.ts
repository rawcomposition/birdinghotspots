import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Article from "models/Article";
import admin from "lib/firebaseAdmin";
import { getStateByCode } from "lib/localData";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;

  const { id }: any = req.query;

  await connect();
  const article = await Article.findById(id);

  const result = await admin.verifyIdToken(token || "");
  if (result.role !== "admin" && !result.regions?.includes(article?.stateCode)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const state = getStateByCode(article?.stateCode);
    if (!state) {
      throw new Error("Invalid state code");
    }

    await Article.findByIdAndDelete(id);

    await res.revalidate(`/${state.country.toLowerCase()}/${state.slug}`);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
