import fs from "fs";
import dayjs from "dayjs";
import Hotspot from "../models/Hotspot";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

type CsvRow = (string | number | boolean | null | undefined)[];

const LOCATION_IDS: string[] = [
  "L989821",
  "L6345055", // French
  "L2594573",
  "L30332398",
  "L46829817",
  "L271858",
  "L97555",
  "L1246441",
  "L1544410",
  "L617867",
  "L305929",
  "L3100277",
  "L444656",
  "L599237",
  "L329116",
];

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

const toBoolean = (ynu?: string | null): boolean | "" => {
  if (!ynu) return "";
  if (ynu === "Yes") return true;
  if (ynu === "No") return false;
  return "";
};

const makeCsv = (header: string[], rows: CsvRow[]): string => {
  const head = header.map(escapeCsvValue).join(",");
  const body = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  return `${head}\n${body}`;
};

const exportSampleData = async () => {
  await connect();

  const hotspots = await Hotspot.find({ locationId: { $in: LOCATION_IDS } }, [
    "locationId",
    "webpage",
    "links",
    "fee",
    "restrooms",
    "accessible",
    "roadside",
    "plan",
    "birding",
    "about",
    "createdAt",
    "updatedAt",
  ]).lean();

  if (!hotspots.length) {
    console.log(`No hotspots found for locationIds: ${LOCATION_IDS.join(", ")}`);
    process.exit(0);
    return;
  }

  ensureExportsDir();

  const contentHeader = [
    "loc_id",
    "website_url",
    "links",
    "entrance_fee",
    "restrooms",
    "accessible_trail",
    "roadside_viewing",
    "creation_dt",
    "last_edited_dt",
  ];

  const contentRows: CsvRow[] = hotspots.map((h: any) => [
    h.locationId,
    h.webpage || "",
    h.links ? JSON.stringify(h.links) : "",
    toBoolean(h.fee),
    toBoolean(h.restrooms),
    toBoolean(h.accessible),
    toBoolean(h.roadside),
    (h.createdAt ? new Date(h.createdAt) : new Date()).toISOString(),
    (h.updatedAt ? new Date(h.updatedAt) : h.createdAt ? new Date(h.createdAt) : new Date()).toISOString(),
  ]);

  const contentCsv = makeCsv(contentHeader, contentRows);
  const contentFile = `exports/hotspot_content.csv`;
  fs.writeFileSync(contentFile, contentCsv, "utf-8");
  console.log(`File written to ${contentFile}`);

  const textHeader = [
    "loc_id",
    "language",
    "default_lang",
    "plan_visit_text",
    "birding_text",
    "about_text",
    "creation_dt",
    "last_edited_dt",
  ];

  const textRows: CsvRow[] = hotspots.map((h: any) => [
    h.locationId,
    "en",
    true,
    h.plan || "",
    h.birding || "",
    h.about || "",
    (h.createdAt ? new Date(h.createdAt) : new Date()).toISOString(),
    (h.updatedAt ? new Date(h.updatedAt) : h.createdAt ? new Date(h.createdAt) : new Date()).toISOString(),
  ]);

  const textCsv = makeCsv(textHeader, textRows);
  const textFile = `exports/hotspot_text_content.csv`;
  fs.writeFileSync(textFile, textCsv, "utf-8");
  console.log(`File written to ${textFile}`);

  process.exit(0);
};

exportSampleData();
