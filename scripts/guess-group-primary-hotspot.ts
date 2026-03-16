import Hotspot from "../models/Hotspot";
import Group from "../models/Group";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

const DRY_RUN = true;
const ENABLE_EXPERIMENTAL = false;
const IGNORE_LIST = [
  "G880628",
  "G612344",
  "G598870",
  "G531996",
  "G724973",
  "G004657",
  "G658810",
  "G798051",
  "G250215",
  "G280448",
];

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const initHotspotSchema = Hotspot; // Trick to make sure the Hotspot model is loaded

const getParentheticals = (name: string): string[] => {
  return [...name.matchAll(/\(([^)]+)\)/g)].map((m) => m[1].trim());
};

const hasCountyParenthetical = (name: string): boolean => {
  return getParentheticals(name).some((p) => /\bCo\b\.?/i.test(p) || /\bCounty\b/i.test(p));
};

const hasDirectionalParenthetical = (name: string): boolean => {
  return getParentheticals(name).some(
    (p) => /^(north|south|east|west|area\s|within\s)/i.test(p) || /\b(side|overall)\b/i.test(p)
  );
};

const hasSubArea = (name: string): boolean => {
  return /--(?!general\b)/i.test(name);
};

const abbreviations: [RegExp, string][] = [
  // Multi-word abbreviations first (longer/more specific before shorter)
  [/\bNWR\b/g, "National Wildlife Refuge"],
  [/\bNWA\b/g, "National Wildlife Area"],
  [/\bNCA\b/g, "National Conservation Area"],
  [/\bNHS\b/g, "National Historic Site"],
  [/\bNHP\b/g, "National Historical Park"],
  [/\bNRA\b/g, "National Recreation Area"],
  [/\bWMA\b/g, "Wildlife Management Area"],
  [/\bWPA\b/g, "Waterfowl Production Area"],
  [/\bSWA\b/g, "State Wildlife Area"],
  [/\bSHP\b/g, "State Historic Park"],
  [/\bSRA\b/g, "State Recreation Area"],
  [/\bSNA\b/g, "State Natural Area"],
  [/\bSGL\b/g, "State Game Lands"],
  [/\bGMA\b/g, "Game Management Area"],
  [/\bFWA\b/g, "Fish and Wildlife Area"],
  [/\bOSP\b/g, "Open Space Preserve"],
  [/\bNP\b/g, "National Park"],
  [/\bNF\b/g, "National Forest"],
  [/\bNM\b/g, "National Monument"],
  [/\bNS\b/g, "National Seashore"],
  [/\bSP\b/g, "State Park"],
  [/\bSF\b/g, "State Forest"],
  [/\bPN\b/g, "Parque Nacional"],
  [/\bPP\b/g, "Provincial Park"],
  [/\bWR\b/g, "Wildlife Refuge"],
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

  result = result.replace(/'/g, "");

  result = result.toLowerCase().trim();

  result = result.replace(/--general\b/i, "").trim();

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

  const groups = await Group.find({ primaryHotspot: { $in: [null, undefined] } }, [
    "locationId",
    "name",
    "primaryHotspot",
    "hotspots",
  ])
    .populate("hotspots", ["name"])
    .lean();

  const bulkWrites: any[] = [];
  const csvRows: string[] = ["Status,Group Name,General Hotspot Name,Group URL"];

  for (const group of groups) {
    if (IGNORE_LIST.includes(group.locationId)) continue;
    const primaryHotspot = group.hotspots.find(
      (hotspot: any) =>
        !hasSubArea(hotspot.name) &&
        !hasCountyParenthetical(hotspot.name) &&
        !hasDirectionalParenthetical(hotspot.name) &&
        sanitizeName(hotspot.name) === sanitizeName(group.name)
    );
    if (primaryHotspot) {
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
