import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getStaticMap } from "lib/helpers";
import { v4 as uuidv4 } from "uuid";

export const region = "us-east-005";
export const endpoint = "https://nyc3.digitaloceanspaces.com";
export const cdnEndpoint = "https://birdinghotspots.nyc3.cdn.digitaloceanspaces.com";
export const legacyEndpoint = "https://s3.us-east-1.wasabisys.com";
export const bucket = "birdinghotspots";

export const getFileUrl = (key?: string) => {
  if (!key) return undefined;
  if (key.startsWith("http")) return key.replace(legacyEndpoint, cdnEndpoint);
  return `${endpoint}/${bucket}/${key}`;
};

export const uploadGroupMapImg = async (hotspots: { species?: number; lat: number; lng: number }[]) => {
  const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.S3_KEY || "",
      secretAccessKey: process.env.S3_SECRET || "",
    },
    region,
    endpoint,
  });

  const uploadUrlToS3 = async (url: string, key: string) => {
    const uploadParams = {
      Bucket: bucket,
      Key: key,
      ACL: "public-read",
      Body: await fetch(url).then((res) => res.arrayBuffer()),
    };
    // @ts-ignore
    await s3.send(new PutObjectCommand(uploadParams));
  };

  const url = getStaticMap(hotspots);
  const filename = `groupmap${uuidv4()}.jpg`;

  await uploadUrlToS3(url, filename);

  return filename;
};
