import Hotspot from "../models/Hotspot";
import Group from "../models/Group";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const initHotspotSchema = Hotspot; // Trick to make sure the Hotspot model is loaded

// Matches any trailing parenthetical, e.g. "(Maricopa Co.)", "(East)", "(Main Entrance)"
const trailingParenRegex = /\s*\(.*\)$/;

const stripParens = (name: string) => name.replace(trailingParenRegex, "").trim();

const findBetterPrimaryHotspots = async () => {
  await connect();

  const groups = await Group.find({ primaryHotspot: { $exists: true } }, [
    "locationId",
    "name",
    "hotspots",
    "primaryHotspot",
  ])
    .populate("primaryHotspot", ["name", "locationId"])
    .populate("hotspots", ["name", "locationId"])
    .lean();

  const results: { group: string; locationId: string; current: string; currentId: string; better: string; betterId: string; reason: string }[] = [];

  for (const group of groups) {
    const primaryHotspot = group.primaryHotspot as any;
    if (!primaryHotspot?.name) continue;

    // Skip if primary hotspot name has no parenthetical
    if (!trailingParenRegex.test(primaryHotspot.name)) continue;

    const primaryBaseName = stripParens(primaryHotspot.name);
    const hotspots = group.hotspots as any[];

    // Strategy 1: Is there a hotspot matching the group name exactly?
    const exactGroupMatch = hotspots.find(
      (h: any) => h.name === group.name && h._id.toString() !== primaryHotspot._id.toString()
    );

    // Strategy 2: Is there a hotspot matching the primary name with parens stripped?
    const strippedMatch = !exactGroupMatch
      ? hotspots.find(
          (h: any) => h.name === primaryBaseName && h._id.toString() !== primaryHotspot._id.toString()
        )
      : null;

    const betterMatch = exactGroupMatch || strippedMatch;
    if (betterMatch) {
      const reason = exactGroupMatch ? "exact group name match" : "name without parenthetical";
      results.push({
        group: group.name,
        locationId: group.locationId,
        current: primaryHotspot.name,
        currentId: primaryHotspot.locationId,
        better: betterMatch.name,
        betterId: betterMatch.locationId,
        reason,
      });
    }
  }

  // Print results grouped by reason
  for (const r of results) {
    console.log(
      `\nGroup: ${r.group} (${r.locationId})`,
      `\n  Current primary: ${r.current} (${r.currentId})`,
      `\n  Better match:    ${r.better} (${r.betterId})`,
      `\n  Reason:          ${r.reason}`
    );
  }

  const parentheticalCount = groups.filter((g: any) => g.primaryHotspot?.name && trailingParenRegex.test(g.primaryHotspot.name)).length;

  console.log(`\n--- Summary ---`);
  console.log(`Total groups with parenthetical in primary hotspot name: ${parentheticalCount}`);
  console.log(`Groups with a better match available: ${results.length}`);

  process.exit();
};

findBetterPrimaryHotspots();
