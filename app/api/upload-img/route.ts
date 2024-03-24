import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const xs = 480;
const sm = 1200;
const lg = 2400;

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const data = await request.formData();
    const id = uuidv4();
    const file = data.get("file");
    if (!file) throw new Error("No file");
    // @ts-ignore
    const buffer = await file?.arrayBuffer();

    const { width, height } = await sharp(buffer).metadata();

    const [xsBuffer, smBuffer, lgBuffer] = await Promise.all([
      sharp(buffer)
        .resize({ width: xs, height: xs, fit: sharp.fit.inside, withoutEnlargement: true })
        .withMetadata()
        .jpeg({ quality: 75, progressive: true })
        .toBuffer(),
      sharp(buffer)
        .resize({ width: sm, height: sm, fit: sharp.fit.inside, withoutEnlargement: true })
        .withMetadata()
        .jpeg({ quality: 75, progressive: true })
        .toBuffer(),
      sharp(buffer)
        .resize({ width: lg, height: lg, fit: sharp.fit.inside, withoutEnlargement: true })
        .withMetadata()
        .jpeg({ quality: 75, progressive: true })
        .toBuffer(),
    ]);

    const xsName = `${id}_xsmall.jpg`;
    const smName = `${id}_small.jpg`;
    const lgName = `${id}_large.jpg`;

    const s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.S3_KEY || "",
        secretAccessKey: process.env.S3_SECRET || "",
      },
      region: "us-east-005",
      endpoint: "https://s3.us-east-005.backblazeb2.com",
    });

    await Promise.all([
      s3.send(
        new PutObjectCommand({
          Bucket: "birdinghotspots",
          Key: xsName,
          ACL: "public-read",
          Body: xsBuffer,
          ContentType: "image/jpeg",
        })
      ),
      s3.send(
        new PutObjectCommand({
          Bucket: "birdinghotspots",
          Key: smName,
          ACL: "public-read",
          Body: smBuffer,
          ContentType: "image/jpeg",
        })
      ),
      s3.send(
        new PutObjectCommand({
          Bucket: "birdinghotspots",
          Key: lgName,
          ACL: "public-read",
          Body: lgBuffer,
          ContentType: "image/jpeg",
        })
      ),
    ]);

    return NextResponse.json({
      xsUrl: `https://s3.us-east-005.backblazeb2.com/birdinghotspots/${xsName}`,
      smUrl: `https://s3.us-east-005.backblazeb2.com/birdinghotspots/${smName}`,
      lgUrl: `https://s3.us-east-005.backblazeb2.com/birdinghotspots/${lgName}`,
      by: null,
      width: Number(width) || null,
      height: Number(height) || null,
      size: lgBuffer.byteLength,
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
