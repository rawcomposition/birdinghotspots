import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Hotspot from "../models/Hotspot";
import Group from "../models/Group";
import LegacyImage from "../models/LegacyImage";

type ModelName = "Hotspot" | "Group";
type SourceIdField = "locationId";

dotenv.config();

const MODEL_TO_MIGRATE: ModelName = "Group";
const BATCH_SIZE = 1000;

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

type LegacyType = "hotspot" | "group";

const MODEL_CONFIG: Record<
  ModelName,
  { model: mongoose.Model<any>; sourceIdField: SourceIdField; legacyType: LegacyType }
> = {
  Hotspot: { model: Hotspot, sourceIdField: "locationId", legacyType: "hotspot" },
  Group: { model: Group, sourceIdField: "locationId", legacyType: "group" },
};

const migrateImages = async () => {
  await connect();

  const { model: Model, sourceIdField, legacyType } = MODEL_CONFIG[MODEL_TO_MIGRATE];

  let lastCursor: string | null = null;
  let totalDocs = 0;
  let totalImages = 0;
  let totalWrites = 0;
  let totalSkipped = 0;

  while (true) {
    const query: any = {
      images: { $exists: true, $ne: [] },
      [sourceIdField]: { $exists: true, $ne: "" },
    };
    if (lastCursor) {
      query[sourceIdField] = { $gt: lastCursor };
    }

    const docs = await Model.find(query)
      .select({ images: 1, [sourceIdField]: 1 })
      .sort({ [sourceIdField]: 1 })
      .limit(BATCH_SIZE)
      .lean();
    if (!docs.length) {
      break;
    }

    const legacyDocs: any[] = [];

    for (const doc of docs) {
      totalDocs += 1;
      const sourceId = String(doc[sourceIdField]);
      lastCursor = sourceId;

      const images = Array.isArray(doc.images) ? doc.images : [];
      images.forEach((image: any, index: number) => {
        if (!!image?.ebirdId) {
          totalSkipped += 1;
          return;
        }
        if (!image?.smUrl) {
          totalSkipped += 1;
          return;
        }

        totalImages += 1;

        const legacyDoc = {
          locationId: sourceId,
          type: legacyType,
          xsUrl: image.xsUrl,
          smUrl: image.smUrl,
          lgUrl: image.lgUrl,
          by: image.by,
          email: image.email,
          uid: image.uid,
          caption: image.caption,
          width: image.width,
          height: image.height,
          size: image.size,
          isMap: legacyType === "group" ? true : image.isMap,
          isStreetview: image.isStreetview,
          isPublicDomain: image.isPublicDomain,
          legacy: image.legacy,
          streetviewData: image.streetviewData,
          isMigrated: image.isMigrated,
          hideFromChildren: image.hideFromChildren,
          order: index,
        };

        legacyDocs.push(legacyDoc);
      });
    }

    if (legacyDocs.length) {
      try {
        const inserted = await LegacyImage.insertMany(legacyDocs, { ordered: false });
        totalWrites += inserted.length;
      } catch (err: any) {
        const insertedCount = err?.insertedDocs?.length ?? 0;
        totalWrites += insertedCount;
        console.warn(`InsertMany had errors; inserted ${insertedCount} docs in this batch.`);
      }
    }

    console.log(
      `Processed ${totalDocs} docs | migrated ${totalImages} images | skipped ${totalSkipped} | writes ${totalWrites}`
    );
  }

  console.log("Done!");
  process.exit();
};

migrateImages();
