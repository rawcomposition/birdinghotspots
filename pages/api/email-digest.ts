import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import PhotoBatch from "models/PhotoBatch";
import Revision from "models/Revision";
import Profile from "models/Profile";
import Logs from "models/Log";
import { sendEmail } from "lib/email";
import dayjs from "dayjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { key }: any = req.query;

  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}` && key !== process.env.CRON_SECRET) {
    return res.status(401).end("Unauthorized");
  }

  try {
    await connect();

    const date = dayjs().subtract(1, "day").format();
    const photoBatches = await PhotoBatch.find({ createdAt: { $gte: date }, "images.status": "pending" }, [
      "stateCode",
      "countyCode",
      "images",
    ]);
    const revisions = await Revision.find({ createdAt: { $gte: date }, status: "pending" }, [
      "stateCode",
      "countyCode",
    ]);
    const users = await Profile.find({ emailFrequency: "daily" });

    let count = 0;

    await Promise.all(
      users.map(async ({ name, email, subscriptions }) => {
        const userPhotoBatches = photoBatches.filter(
          (batch) => subscriptions.includes(batch.stateCode) || subscriptions.includes(batch.countyCode)
        );
        const userRevisions = revisions.filter(
          (revision) =>
            subscriptions.includes(revision.stateCode || "") || subscriptions.includes(revision.countyCode || "")
        );
        const hasRevisions = userRevisions.length > 0;
        const imageCount = userPhotoBatches.reduce((acc, batch) => acc + batch.images.length, 0);
        const hasUploads = imageCount > 0;

        if (hasUploads || hasRevisions) {
          const countHtml = [
            hasUploads && `${imageCount} pending ${imageCount === 1 ? "image" : "images"}`,
            hasRevisions && `${userRevisions.length} pending ${userRevisions.length === 1 ? "revision" : "revisions"}`,
          ]
            .filter(Boolean)
            .join(" and ");

          const linkHtml = [
            hasUploads && `<a href="https://birdinghotspots.org/admin/image-review">Review Images</a>`,
            hasRevisions && `<a href="https://birdinghotspots.org/admin/revision-review">Review Revisions</a>`,
          ]
            .filter(Boolean)
            .join(" • ");

          await sendEmail({
            to: email,
            subject: "Pending uploads/revisions",
            html: `Hi ${name},<br><br>You have ${countHtml} that came in over the last 24 hours.<br><br>${linkHtml}<br /><br />Thanks,<br />The BirdingHotspots.org Team`,
          });
          count++;
        }
      })
    );

    await Logs.create({
      user: "BirdBot",
      type: "daily-email",
      message: `sent email digest to ${count} ${count === 1 ? "editor" : "editors"}`,
    });
    console.log(`Sent email digest to ${count} editors`);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.log("Error sending email digest. Some emails may still have been sent.", error);
    res.status(500).json({ error: error.message });
  }
}
