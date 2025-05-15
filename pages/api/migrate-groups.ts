import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Group from "models/Group";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  await connect();
  const groups = await Group.find(
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

  for (const group of groups) {
    const trailMap = group.links?.find((link: any) => link.label.toLowerCase().includes("map"));
    if (!trailMap || !trailMap.url) continue;
    const hasCitation = !!trailMap.cite;

    bulkWrites.push(
      hasCitation
        ? {
            updateOne: {
              filter: { _id: group._id },
              update: {
                $set: {
                  trailMap: trailMap.url,
                  links: group.links!.filter((link) => link.url !== trailMap.url),
                },
                $push: { citations: { url: trailMap.url, label: trailMap.label } },
              },
            },
          }
        : {
            updateOne: {
              filter: { _id: group._id },
              update: {
                $set: {
                  trailMap: trailMap.url,
                  links: group.links!.filter((link) => link.url !== trailMap.url),
                },
              },
            },
          }
    );
  }

  await Group.bulkWrite(bulkWrites);

  res.status(200).json({ updated: bulkWrites.length });
}
