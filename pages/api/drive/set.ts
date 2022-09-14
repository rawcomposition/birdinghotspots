import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import admin from "lib/firebaseAdmin";
import Drive from "models/Drive";
import Hotspot from "models/Hotspot";
import { HotspotDrive } from "lib/types";

type Entry = {
  hotspot: string;
  description: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const token = req.headers.authorization;
  const { isNew }: any = req.query;
  const { data, id } = req.body;

  const result = await admin.verifyIdToken(token || "");
  if (result.role !== "admin" && !result.regions?.includes(data?.stateCode)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await connect();
    let driveId = id;
    if (isNew === "true") {
      const newDrive = await Drive.create(data);
      driveId = newDrive._id;
    } else {
      await Drive.replaceOne({ _id: id }, data);
    }

    const hotspotIds = data.entries.map((entry: any) => entry.hotspot);

    await Hotspot.updateMany(
      { "drives.driveId": { $ne: driveId }, _id: { $in: hotspotIds } },
      // @ts-ignore
      { $push: { drives: { slug: data.slug, name: data.name, driveId } } }
    );

    await Hotspot.updateMany(
      { drives: { $elemMatch: { driveId } }, _id: { $nin: hotspotIds } },
      // @ts-ignore
      { $pull: { drives: { driveId } } }
    );

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
