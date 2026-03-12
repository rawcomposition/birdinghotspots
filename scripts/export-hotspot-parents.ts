import fs from "fs";
import Hotspot from "../models/Hotspot";
import Group from "../models/Group";

const initHotspotSchema = Hotspot; // Trick to make sure the Hotspot model is loaded
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const EBIRD_USER_ID = "USER8869006";

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

async function main() {
  await connect();

  const groups = await Group.find({
    primaryHotspot: { $exists: true, $ne: null },
    isMigrationReady: true,
  })
    .populate("hotspots", "locationId")
    .populate("primaryHotspot", "locationId")
    .lean();

  if (!groups.length) {
    console.log("No migration-ready groups with a primary hotspot found.");
    process.exit(0);
  }

  console.log(`Found ${groups.length} migration-ready group(s).`);

  const lines: string[] = [];
  lines.push("-- Exported from BirdingHotspots.org");
  lines.push(`-- Date: ${new Date().toISOString()}`);
  lines.push(`-- Groups: ${groups.length}`);
  lines.push("");
  lines.push("BEGIN;");
  lines.push("");
  lines.push("-- hotspot_parents");

  const childToParents = new Map<string, string[]>();
  let count = 0;
  for (const group of groups as any[]) {
    const parentLocId = group.primaryHotspot?.locationId;

    for (const child of group.hotspots || []) {
      const childLocId = child.locationId;
      if (!childLocId) continue;
      if (childLocId === parentLocId) continue;

      const existing = childToParents.get(childLocId) || [];
      existing.push(parentLocId);
      childToParents.set(childLocId, existing);

      lines.push(
        `INSERT INTO hotspot_parents (loc_id, parent_loc_id, created_by_user_id) VALUES ('${childLocId}', '${parentLocId}', '${EBIRD_USER_ID}') ON CONFLICT DO NOTHING;`
      );
      count++;
    }
  }

  for (const [childLocId, parents] of childToParents) {
    if (parents.length > 1) {
      console.warn(`WARNING: Hotspot "${childLocId}" is assigned to ${parents.length} parents: ${parents.join(", ")}`);
    }
  }

  lines.push("");
  lines.push("COMMIT;");
  lines.push("");

  console.log(`Generated ${count} hotspot_parents insert(s).`);

  if (!fs.existsSync("exports")) fs.mkdirSync("exports");
  const outPath = "exports/hotspot-parents.sql";
  fs.writeFileSync(outPath, lines.join("\n"), "utf-8");
  console.log(`Written to ${outPath}`);

  process.exit(0);
}

main();
