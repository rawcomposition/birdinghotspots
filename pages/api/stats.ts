import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot.mjs";
import admin from "lib/firebaseAdmin";
import nookies from "nookies";
import States from "data/states.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const cookies = nookies.get({ req });
  const token = cookies.session;

  const result = await admin.verifySessionCookie(token || "");
  if (!["admin", "editor"].includes(result.role)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { role, regions } = result;

  try {
    await connect();

    const result = await Hotspot.aggregate([
      {
        $group: {
          _id: { featuredImg: { $gt: ["$featuredImg", null] }, stateCode: "$stateCode" },
          count: { $sum: 1 },
        },
      },
    ]);

    const restructured = result.map(({ _id, count }) => ({
      stateCode: _id.stateCode,
      featuredImg: _id.featuredImg,
      count,
    }));

    const filteredStates = States.filter(({ active, code, country }) => {
      return active && (role === "admin" || regions.includes(`${country}-${code}`));
    });

    const data = filteredStates.map(({ code, label, country, slug }) => {
      const url = `/${country.toLowerCase()}/${slug}`;
      const name = `${label}, ${country}`;
      const withImg = restructured.find((it) => it.stateCode === code && it.featuredImg)?.count || 0;
      const withoutImg = restructured.find((it) => it.stateCode === code && !it.featuredImg)?.count || 0;
      const total = withImg + withoutImg;
      return { name, url, withImg, total };
    });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
