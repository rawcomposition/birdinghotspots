import Hotspot from "../models/Hotspot";
import Group from "../models/Group";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

const DRY_RUN = true;
const ENABLE_EXPERIMENTAL = true;

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const initHotspotSchema = Hotspot; // Trick to make sure the Hotspot model is loaded

const getParenthetical = (name: string): string | null => {
  const match = name.match(/\(([^)]+)\)/);
  return match ? match[1].trim() : null;
};

const abbreviations: [RegExp, string][] = [
  // Multi-word abbreviations first (longer/more specific before shorter)
  [/\bNWR\b/g, "National Wildlife Refuge"],
  [/\bNCA\b/g, "National Conservation Area"],
  [/\bNHS\b/g, "National Historic Site"],
  [/\bWMA\b/g, "Wildlife Management Area"],
  [/\bSWA\b/g, "State Wildlife Area"],
  [/\bSHP\b/g, "State Historic Park"],
  [/\bOSP\b/g, "Open Space Preserve"],
  [/\bNP\b/g, "National Park"],
  [/\bNF\b/g, "National Forest"],
  [/\bNM\b/g, "National Monument"],
  [/\bSP\b/g, "State Park"],
  [/\bPN\b/g, "Parque Nacional"],
  [/\bRA\b/g, "Recreation Area"],
  // Punctuated abbreviations
  [/\bRd\./g, "Road"],
  [/\bPt\./g, "Point"],
  [/\bCo\./g, "County"],
  [/\bTwp\./g, "Township"],
  [/\bBlvd\./g, "Boulevard"],
  [/\bMt\./g, "Mount"],
  // Symbol
  [/\s&\s/g, " and "],
];

const sanitizeName = (name: string) => {
  let result = name;
  for (const [pattern, replacement] of abbreviations) {
    result = result.replace(pattern, replacement);
  }

  result = result.toLowerCase().trim();

  const parenthesisIndex = result.indexOf("(");
  if (parenthesisIndex !== -1) {
    result = result.substring(0, parenthesisIndex).trim();
  }

  return result;
};

const findGroupPrimaryHotspot = async () => {
  await connect();

  let matchCount = 0;
  let noMatchCount = 0;

  const groups = await Group.find({ primaryHotspot: { $exists: false } }, [
    "locationId",
    "name",
    "primaryHotspot",
    "hotspots",
  ])
    .populate("hotspots", ["name"])
    .lean();

  const bulkWrites: any[] = [];
  const csvRows: string[] = ["Status,Group Name,Primary Hotspot Name,Group URL"];

  for (const group of groups) {
    const primaryHotspot = group.hotspots.find(
      (hotspot: any) => sanitizeName(hotspot.name) === sanitizeName(group.name)
    );
    if (primaryHotspot) {
      const paren = getParenthetical(primaryHotspot.name);
      if (paren && paren.endsWith("Co.")) {
        const othersWithSameParen = group.hotspots.filter(
          (h: any) => h._id !== primaryHotspot._id && getParenthetical(h.name) === paren
        );
        if (othersWithSameParen.length > 0) {
          console.log("SKIP (multiple Co.)", group.name, primaryHotspot.name, `(${othersWithSameParen.length} others)`);
          csvRows.push(
            `SKIP,"${group.name}","${primaryHotspot.name}",https://birdinghotspots.org/group/${group.locationId}`
          );
          noMatchCount++;
          continue;
        }
      }
      matchCount++;
      console.log(
        "MATCH",
        `https://birdinghotspots.org/group/${group.locationId}`,
        group.name,
        "|",
        primaryHotspot.name
      );
      csvRows.push(
        `MATCH,"${group.name}","${primaryHotspot.name}",https://birdinghotspots.org/group/${group.locationId}`
      );
      bulkWrites.push({
        updateOne: {
          filter: { _id: group._id },
          update: { $set: { primaryHotspot: primaryHotspot._id } },
        },
      });
    } else {
      // EXPERIMENTAL: Split group name on "and", try matching each half
      let andMatch: any = null;
      if (ENABLE_EXPERIMENTAL && group.name.toLowerCase().includes(" and ")) {
        const parts = group.name.split(/\s+and\s+/i);
        andMatch = group.hotspots.find((h: any) =>
          parts.some((part: string) => sanitizeName(h.name) === sanitizeName(part.trim()))
        );
      }
      if (andMatch) {
        matchCount++;
        console.log(
          "MATCH (and-split)",
          `https://birdinghotspots.org/group/${group.locationId}`,
          group.name,
          "|",
          andMatch.name
        );
        csvRows.push(
          `MATCH (and-split),"${group.name}","${andMatch.name}",https://birdinghotspots.org/group/${group.locationId}`
        );
        bulkWrites.push({
          updateOne: {
            filter: { _id: group._id },
            update: { $set: { primaryHotspot: andMatch._id } },
          },
        });
      } else {
        noMatchCount++;
      }
    }
  }

  if (!DRY_RUN) {
    await Group.bulkWrite(bulkWrites);
  }

  const csvPath = path.join(__dirname, "..", "exports", "guess-group-primary-hotspot-results.csv");
  fs.writeFileSync(csvPath, csvRows.join("\n"));
  console.log(`CSV written to ${csvPath}`);

  console.log(`Done! ${DRY_RUN ? "(dry run)" : ""}`);
  console.log(`Match count: ${matchCount}`);
  console.log(`No match count: ${noMatchCount}`);
  process.exit();
};

findGroupPrimaryHotspot();
