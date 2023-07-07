import type { NextApiRequest, NextApiResponse } from "next";
import States from "data/states.json";
import admin from "lib/firebaseAdmin";
import nookies from "nookies";
import FlatRegions from "data/flat-regions.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { q, restrict }: any = req.query;

  let limitStates = null;
  let allowedStates = States;
  if (restrict === "true") {
    const cookies = nookies.get({ req });
    const token = cookies.session;
    const result = await admin.verifySessionCookie(token || "");
    if (result.role !== "admin") {
      limitStates = result.regions || [];
      allowedStates = States.filter((state) => result.regions.includes(state.code));
    }
  }

  const filteredRegions = FlatRegions.filter(({ name }) => name.toLowerCase().startsWith(q.toLowerCase())).map(
    ({ code, name }) => ({
      label: name,
      value: `/region/${code}`,
    })
  );

  res.status(200).json({
    success: true,
    results: filteredRegions,
  });
}
