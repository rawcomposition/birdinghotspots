import type { NextApiRequest, NextApiResponse } from "next";
import States from "data/states.json";
import { getAllCounties } from "lib/localData";
import admin from "lib/firebaseAdmin";
import nookies from "nookies";

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

  const allCounties = getAllCounties(limitStates);

  const filteredCounties = allCounties
    .filter((county: any) => {
      return county.name.toLowerCase().startsWith(q.toLowerCase());
    })
    .map(({ name, code, stateLabel, country }: any) => ({ label: `${name}, ${stateLabel}, ${country}`, value: code }));

  const filteredStates = allowedStates
    .filter((state) => state.active && state.label.toLowerCase().startsWith(q.toLowerCase()))
    .map((state) => ({ label: `${state.label.split("-").pop()}, ${state.country}`, value: state.code }));

  res.status(200).json({
    success: true,
    results: [...filteredStates, ...filteredCounties],
  });
}
