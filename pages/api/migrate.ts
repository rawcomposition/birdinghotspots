import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Group from "models/Group";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connect();

    const groups = await Group.find({ mapImgUrl: { $regex: "https://s3.us-east-1.wasabisys.com" } });

    for (const group of groups) {
      group.mapImgUrl = group.mapImgUrl.replace("https://s3.us-east-1.wasabisys.com/birdinghotspots/", "");
      await group.save();
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
