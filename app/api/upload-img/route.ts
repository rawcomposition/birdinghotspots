import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { promises as fs } from "fs";

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

    console.log(xsBuffer.byteLength / 1024, smBuffer.byteLength / 1024, lgBuffer.byteLength / 1024);

    const xsName = `${id}_xsmall.jpg`;
    const smName = `${id}_small.jpg`;
    const lgName = `${id}_large.jpg`;

    const s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.WASABI_KEY || "",
        secretAccessKey: process.env.WASABI_SECRET || "",
      },
      region: "us-east-1",
      endpoint: "https://s3.wasabisys.com",
    });

    /*await Promise.all([
      s3.send(
        new PutObjectCommand({
          Bucket: "birdinghotspots",
          Key: xsName,
          ACL: "public-read",
          Body: xsBuffer,
        })
      ),
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
    ]);*/

    // Save buffers to disk
    const xsPath = `tmp/${xsName}`;
    const smPath = `tmp/${smName}`;
    const lgPath = `tmp/${lgName}`;

    await fs.writeFile(xsPath, xsBuffer);
    await fs.writeFile(smPath, smBuffer);
    await fs.writeFile(lgPath, lgBuffer);

    return NextResponse.json({
      xsUrl: `https://s3.us-east-1.wasabisys.com/birdinghotspots/${xsName}`,
      smUrl: `https://s3.us-east-1.wasabisys.com/birdinghotspots/${smName}`,
      lgUrl: `https://s3.us-east-1.wasabisys.com/birdinghotspots/${lgName}`,
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
