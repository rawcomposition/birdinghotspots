import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Pageview from "models/Pageview";
import dayjs from "dayjs";
import isbot from "isbot";
import nookies from "nookies";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { locationId, stateCode, countyCode, countryCode, entity }: any = req.body;

  const cookies = nookies.get({ req });
  const loggedIn = !!cookies.session;

  if (loggedIn || isbot(req.headers["user-agent"])) {
    return res.status(200).json({ success: true, logged: false });
  }

  try {
    await connect();

    await Pageview.findOneAndUpdate(
      {
        locationId,
        stateCode,
        countyCode,
        countryCode,
        entity,
        year: Number(dayjs().format("YYYY")),
        month: Number(dayjs().format("M")),
      },
      {
        $inc: { count: 1 },
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.status(200).json({ success: true, logged: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
