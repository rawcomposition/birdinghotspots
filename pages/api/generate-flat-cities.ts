import connect, { getActiveCities } from "lib/mongo";
import secureApi from "lib/secureApi";
import { getRegion } from "lib/localData";
import { promises as fs } from "fs";

export default secureApi(async (req, res, token) => {
  await connect();

  const keyValues: any = {};

  const cities = (await getActiveCities()) || [];

  const formatted = cities.map(({ name, stateCode, countryCode, locationId }) => {
    const region = getRegion(stateCode || countryCode);
    const detailedName = `${name}, ${region?.detailedName || stateCode || countryCode}`;
    return { name: detailedName, code: locationId };
  });

  await fs.writeFile("data/flat-cities.json", JSON.stringify(formatted));

  res.status(200).json({ success: true });
}, "admin");
