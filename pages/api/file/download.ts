import type { NextApiRequest, NextApiResponse } from "next";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { url }: any = req.query;
  const filename = url.split("/").pop();
  const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.WASABI_KEY || "",
      secretAccessKey: process.env.WASABI_SECRET || "",
    },
    region: "us-east-1",
    endpoint: "https://s3.wasabisys.com",
  });

  const params = {
    Bucket: "birdinghotspots",
    Key: filename,
    ResponseContentDisposition: `attachment; filename=${filename}`,
  };
  const command = new GetObjectCommand(params);
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  if (signedUrl) {
    res.redirect(307, signedUrl);
  } else {
    res.status(500).json({ error: "Something went wrong" });
  }
}
