import type { NextApiRequest, NextApiResponse } from "next";
import admin from "lib/firebaseAdmin";
import nookies from "nookies";
import FlatRegions from "data/flat-regions.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { q, restrict }: any = req.query;

  let limitRegions: string[] | null = null;
  if (restrict === "true") {
    const cookies = nookies.get({ req });
    const token = cookies.session;
    const result = await admin.verifySessionCookie(token || "");
    if (result.role !== "admin") {
      limitRegions = result.regions || [];
    }
  }

  const allowedRegions =
    limitRegions !== null
      ? FlatRegions.filter(({ code }) => limitRegions?.some((it) => code.startsWith(it)))
      : FlatRegions;

  const filteredRegions = allowedRegions
    .filter(({ name }) => name.toLowerCase().startsWith(q.toLowerCase()))
    .map(({ code, name }) => ({
      label: name,
      value: code,
    }));

  res.status(200).json({
    success: true,
    results: filteredRegions,
  });
}
