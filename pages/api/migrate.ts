import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Hotspot from "models/Hotspot";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  await connect();
  const hotspots = await Hotspot.find(
    {
      $or: [{ trailMap: { $in: [null, ""] } }, { trailMap: { $exists: false } }],
      links: {
        $elemMatch: {
          label: {
            $regex: "map",
            $options: "i",
          },
        },
      },
    },
    ["links", "citations"]
  );

  const bulkWrites: any[] = [];

  for (const hotspot of hotspots) {
    const trailMap = hotspot.links?.find((link: any) => link.label.toLowerCase().includes("map"));
    if (!trailMap || !trailMap.url) continue;
    const hasCitation = !!trailMap.cite;

    bulkWrites.push(
      hasCitation
        ? {
            updateOne: {
              filter: { _id: hotspot._id },
              update: {
                $set: {
                  trailMap: trailMap.url,
                  links: hotspot.links!.filter((link) => link.url !== trailMap.url),
                },
                $push: { citations: { url: trailMap.url, label: trailMap.label } },
              },
            },
          }
        : {
            updateOne: {
              filter: { _id: hotspot._id },
              update: {
                $set: {
                  trailMap: trailMap.url,
                  links: hotspot.links!.filter((link) => link.url !== trailMap.url),
                },
              },
            },
          }
    );
  }

  await Hotspot.bulkWrite(bulkWrites);

  res.status(200).json({ updated: bulkWrites.length });
}
