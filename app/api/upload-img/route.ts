import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const sm = 1200;
const lg = 2400;

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const data = await request.formData();
    const id = uuidv4();
    const type = data.get("type") as string;
    const file = data.get("file");
    if (!file) throw new Error("No file");
    // @ts-ignore
    const buffer = await file?.arrayBuffer();

    const { width, height } = await sharp(buffer).metadata();

    const [smBuffer, lgBuffer] = await Promise.all([
      sharp(buffer)
        .resize({ width: sm, height: sm, fit: sharp.fit.contain })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer(),
      sharp(buffer)
        .resize({ width: lg, height: lg, fit: sharp.fit.contain })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer(),
    ]);

    const smName = `${id}_small.jpg`;
    const lgName = `${id}_large.jpg`;
    const originalName = `${id}_original.${mimeTypeExt(type)}`;

    const s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.WASABI_KEY || "",
        secretAccessKey: process.env.WASABI_SECRET || "",
      },
      region: "us-east-1",
      endpoint: "https://s3.wasabisys.com",
    });

    await Promise.all([
      s3.send(
        new PutObjectCommand({
          Bucket: "birdinghotspots",
          Key: smName,
          ACL: "public-read",
          Body: smBuffer,
        })
      ),
      s3.send(
        new PutObjectCommand({
          Bucket: "birdinghotspots",
          Key: lgName,
          ACL: "public-read",
          Body: lgBuffer,
        })
      ),
      s3.send(
        new PutObjectCommand({
          Bucket: "birdinghotspots",
          Key: originalName,
          ACL: "public-read",
          Body: buffer,
        })
      ),
    ]);

    return NextResponse.json({
      smUrl: `https://s3.us-east-1.wasabisys.com/birdinghotspots/${smName}`,
      lgUrl: `https://s3.us-east-1.wasabisys.com/birdinghotspots/${lgName}`,
      originalUrl: `https://s3.us-east-1.wasabisys.com/birdinghotspots/${originalName}`,
      by: null,
      width: Number(width) || null,
      height: Number(height) || null,
      isMap: false,
    });
  } catch (error: any) {
    let message = "An unknown error occurred";
    if (typeof error === "string") {
      message = error;
    } else if (error.message) {
      message = error.message;
    }
    console.log(error);
    return new Response(JSON.stringify({ message }), { status: 500 });
  }
}

const mimeTypeExt = (mimeType?: string) => {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    default:
      return "jpg";
  }
};
