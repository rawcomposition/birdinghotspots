import connect from "lib/mongo";
import type { NextApiRequest, NextApiResponse } from "next";
import Species from "models/Species";
import { IMG_SIZES, getSourceUrl } from "lib/species";
import sharp from "sharp";
import path from "path";

const SOURCE = "inat";
const LIMIT = 100;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  await connect();

  const species = await Species.find({ source: SOURCE, downloadedAt: { $exists: false } }).limit(LIMIT);

  for (const { source, sourceId, crop, _id, iNatFileExt } of species) {
    let original = getSourceUrl({ source, sourceId, size: 2400, ext: iNatFileExt });
    if (!original) {
      console.log("No original for", sourceId);
      continue;
    }

    const originalRes = await fetch(original);
    if (!originalRes.ok) {
      console.log("Failed to fetch original", original);
      continue;
    }

    const buffer = await originalRes.arrayBuffer();

    await Promise.all(
      IMG_SIZES.map(async (size) => {
        const outputPath = path.join(process.cwd(), "species-images", `${_id}-${size}.jpg`);
        const image = sharp(buffer);

        await image
          .extract({
            left: crop.pixel.x,
            top: crop.pixel.y,
            width: crop.pixel.width,
            height: crop.pixel.height,
          })
          .resize(size, size, { fit: sharp.fit.inside })
          .jpeg()
          .toFile(outputPath);
      })
    );

    await Species.updateOne({ _id }, { downloadedAt: new Date() });
  }

  res.status(200).json({ success: true });
}
