import fs from "fs";
import Hotspot from "../models/Hotspot";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { getRegion } from "../lib/localData";
dotenv.config();

type CsvRow = (string | number | boolean | null | undefined)[];

const SAMPLE_SIZE = 10000;

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const ensureExportsDir = () => {
  if (!fs.existsSync("exports")) fs.mkdirSync("exports");
};

const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  const str = String(value);
  const needsQuotes = /[",\n\r]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
};

const makeCsv = (header: string[], rows: CsvRow[]): string => {
  const head = header.map(escapeCsvValue).join(",");
  const body = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  return `${head}\n${body}`;
};

const getRegionName = (hotspot: any): string => {
  const code = hotspot.countyCode || hotspot.stateCode || hotspot.countryCode;
  if (!code) return "";
  const region = getRegion(code);
  return region?.detailedName || code;
};

type ContentArea = {
  field: string;
  label: string;
  filePrefix: string;
};

const CONTENT_AREAS: ContentArea[] = [
  { field: "plan", label: "Plan Your Visit", filePrefix: "plan-your-visit" },
  { field: "birding", label: "How to Bird Here", filePrefix: "how-to-bird-here" },
  { field: "about", label: "About This Place", filePrefix: "about-this-place" },
];

const exportContentSamples = async () => {
  await connect();
  ensureExportsDir();

  const header = ["name", "locationId", "region", "content"];

  for (const area of CONTENT_AREAS) {
    const hotspots = await Hotspot.aggregate([
      { $match: { [area.field]: { $exists: true, $nin: ["", null] } } },
      { $sample: { size: SAMPLE_SIZE } },
      { $project: { name: 1, locationId: 1, countryCode: 1, stateCode: 1, countyCode: 1, [area.field]: 1 } },
    ]);

    if (!hotspots.length) {
      console.log(`No hotspots found with ${area.label} content`);
      continue;
    }

    const rows: CsvRow[] = hotspots.map((h: any) => [h.name, h.locationId, getRegionName(h), h[area.field] || ""]);

    // CSV
    const csv = makeCsv(header, rows);
    const csvFile = `exports/${area.filePrefix}-samples.csv`;
    fs.writeFileSync(csvFile, csv, "utf-8");
    console.log(`Wrote ${hotspots.length} rows to ${csvFile}`);

    // Markdown
    const mdLines = [
      `# ${area.label} - Sample Hotspots`,
      "",
      `${hotspots.length} randomly selected hotspots with ${area.label} content.`,
      "",
      ...hotspots.flatMap((h: any) => [
        `## ${h.name} (${h.locationId})`,
        "",
        `**Region:** ${getRegionName(h)}`,
        "",
        h[area.field] || "",
        "",
        "---",
        "",
      ]),
    ];
    const mdFile = `exports/${area.filePrefix}-samples.md`;
    fs.writeFileSync(mdFile, mdLines.join("\n"), "utf-8");
    console.log(`Wrote ${hotspots.length} rows to ${mdFile}`);
  }

  process.exit(0);
};

exportContentSamples();
