import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  await connect();
  const hotspots = await Hotspot.find(
    {
      $or: [{ webpage: { $in: [null, ""] } }, { webpage: { $exists: false } }],
      links: {
        $elemMatch: {
          label: {
            $regex: "webpage",
            $options: "i",
          },
        },
      },
    },
    ["locationId", "name", "links"]
  );

  const csv = ["locationId,name,link"];
  const bulkWrites: any[] = [];

  for (const hotspot of hotspots) {
    const webpage = hotspot.links?.find(
      (link: any) => simplifyName(link.label).replace("webpage", "") === simplifyName(hotspot.name)
    );
    if (!webpage || !webpage.url) continue;

    csv.push(`${hotspot.locationId},${hotspot.name},${webpage.label}`);

    bulkWrites.push({
      updateOne: {
        filter: { _id: hotspot._id },
        update: {
          $set: {
            webpage: webpage.url,
            links: hotspot.links!.filter((link) => link.url !== webpage.url),
            cite: webpage.cite,
          },
        },
      },
    });
  }

  await Hotspot.bulkWrite(bulkWrites);
  console.log(JSON.stringify(bulkWrites, null, 2));
  res.status(200).json({ updated: bulkWrites.length });

  //res.status(200).send(csv.join("\n"));
}

const simplifyName = (name: string, removeParentheses = false) => {
  return name
    .toLowerCase()
    .replaceAll("-", "")
    .replaceAll(" ", "")
    .replace(removeParentheses ? /\(.*?\)/g : "", "")
    .trim();
};
