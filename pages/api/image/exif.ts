import { NextApiRequest, NextApiResponse } from "next";
import exifr from "exifr";
import { getFileUrl } from "lib/s3";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const imgUrl = req.query.imgUrl as string;

    if (!imgUrl || typeof imgUrl !== "string") {
      return res.status(400).json({ error: "Image URL is required" });
    }

    const imageUrl = getFileUrl(imgUrl);

    if (!imageUrl) {
      return res.status(400).json({ error: "Invalid image URL" });
    }

    const response = await fetch(imageUrl);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch image: ${response.statusText}` });
    }

    const imageBuffer = await response.arrayBuffer();

    const exifData = await exifr.parse(imageBuffer, {
      pick: ["DateTimeOriginal", "CreateDate", "ModifyDate"],
      iptc: true,
      xmp: true,
    });

    if (!exifData) {
      return res.status(404).json({ error: "No EXIF data found in the image" });
    }

    const captureDate = exifData.DateTimeOriginal || exifData.CreateDate || exifData.ModifyDate;

    return res.status(200).json({
      captureDate,
    });
  } catch (error) {
    console.error("Error extracting EXIF data:", error);
    return res.status(500).json({ error: "Failed to extract EXIF data" });
  }
}
