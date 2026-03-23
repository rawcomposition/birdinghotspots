import fs from "fs";
import Hotspot from "../models/Hotspot";
import Group from "../models/Group";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const EBIRD_USER_ID = "USER8869006";

const LANGUAGE_OVERRIDES: Record<string, string> = {
  "CA-QC": "fr",
};

function getLanguageForHotspot(hotspot: { countryCode: string; stateCode?: string; countyCode?: string }): string {
  const { countryCode, stateCode, countyCode } = hotspot;
  if (countyCode && LANGUAGE_OVERRIDES[countyCode]) return LANGUAGE_OVERRIDES[countyCode];
  if (stateCode && LANGUAGE_OVERRIDES[stateCode]) return LANGUAGE_OVERRIDES[stateCode];
  if (countryCode && LANGUAGE_OVERRIDES[countryCode]) return LANGUAGE_OVERRIDES[countryCode];
  return "en";
}

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

function featureVal(val?: string | null): string {
  if (val === "Yes") return "'yes'";
  if (val === "No") return "'no'";
  return "NULL";
}

// Uses PostgreSQL dollar-quoting to avoid escaping single quotes in HTML content
function sqlStr(val?: string | null): string {
  if (val === null || val === undefined || val === "") return "NULL";
  if (!val.includes("$$")) return `$$${val}$$`;
  let tag = "$q$";
  let i = 0;
  while (val.includes(tag)) {
    tag = `$q${i++}$`;
  }
  return `${tag}${val}${tag}`;
}

function sqlQuote(val?: string | null): string {
  if (val === null || val === undefined || val === "") return "NULL";
  return `'${val.replace(/'/g, "''")}'`;
}

// Strips `cite` from link objects; appends trailMap as a link entry
function formatLinks(links?: { label?: string; url?: string; cite?: boolean }[], trailMap?: string | null): string {
  const cleaned: { label: string; url: string }[] = (links || [])
    .filter((l) => l.url)
    .map((l) => ({ label: l.label || "", url: l.url! }));
  if (trailMap) {
    cleaned.push({ label: "Trail Map", url: trailMap });
  }
  if (cleaned.length === 0) return "NULL";
  return sqlStr(JSON.stringify(cleaned)) + "::jsonb";
}

// Convert Google Maps map-links to data-location format
// From: <a href="https://www.google.com/maps/search/?api=1&amp;query=42.44,-71.43" rel="noopener" target="_blank" class="map-link mceNonEditable">Label</a>
// To:   <span data-location="42.44, -71.43" class="location-link">Label</span>
function convertMapLinks(html: string): string {
  return html.replace(
    /<a\s+href=["']https:\/\/www\.google\.com\/maps\/search\/\?api=1&(?:amp;)?query=([^"']+)["'][^>]*class=["'][^"]*map-link[^"]*["'][^>]*>(.*?)<\/a>/gi,
    (_match, coords, label) => {
      const trimmed = decodeURIComponent(coords).trim().replace(", ", ",");
      return `<a href="" data-location="${trimmed}">${label}</a>`;
    }
  );
}

function checkLength(locId: string, column: string, val: string | null | undefined, limit: number) {
  if (val && val.length > limit) {
    console.error(`ERROR: ${locId} ${column} exceeds varchar(${limit}) — ${val.length} chars`);
    process.exit(1);
  }
}

function sqlTimestamp(val?: string | null): string {
  if (!val) return "statement_timestamp()";
  try {
    return `'${new Date(val).toISOString()}'::timestamptz`;
  } catch {
    return "statement_timestamp()";
  }
}

function buildFilter(regionCode?: string): Record<string, unknown> {
  if (!regionCode) return {};
  const parts = regionCode.split("-");
  if (parts.length >= 3) return { countyCode: regionCode };
  if (parts.length === 2) return { stateCode: regionCode };
  return { countryCode: regionCode };
}

function hasExportableContent(hotspot: any): boolean {
  return Boolean(
    hotspot.plan ||
      hotspot.birding ||
      hotspot.about ||
      hotspot.webpage ||
      hotspot.trailMap ||
      (hotspot.links || []).some((link: any) => link.url) ||
      hotspot.fee === "Yes" ||
      hotspot.fee === "No" ||
      hotspot.restrooms === "Yes" ||
      hotspot.restrooms === "No" ||
      hotspot.accessible === "Yes" ||
      hotspot.roadside === "Yes" ||
      hotspot.roadside === "No"
  );
}

function mergeGroupContent(hotspot: any, group: any | undefined) {
  if (!group) return hotspot;

  const plan = hotspot.plan || group.plan || "";
  const birding = hotspot.birding || group.birding || "";
  const about = hotspot.about || group.about || "";
  const restrooms =
    hotspot.restrooms === "Yes" || hotspot.restrooms === "No" ? hotspot.restrooms : group.restrooms || hotspot.restrooms;
  const webpage = hotspot.webpage || group.webpage || "";
  const trailMap = hotspot.trailMap || group.trailMap || "";

  const hotspotLinks: { label?: string; url?: string; cite?: boolean }[] = hotspot.links || [];
  const groupLinks: { label?: string; url?: string; cite?: boolean }[] = group.links || [];
  const seenUrls = new Set<string>();
  const mergedLinks: typeof hotspotLinks = [];
  for (const link of [...hotspotLinks, ...groupLinks]) {
    if (link.url && !seenUrls.has(link.url)) {
      seenUrls.add(link.url);
      mergedLinks.push(link);
    }
  }

  return { ...hotspot, plan, birding, about, restrooms, webpage, trailMap, links: mergedLinks };
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const regionCode = args[0];
  await connect();

  const groups = await Group.find(
    { primaryHotspot: { $exists: true, $ne: null }, isMigrationReady: true },
    ["primaryHotspot", "name", "plan", "birding", "about", "restrooms", "links", "webpage", "trailMap"]
  ).lean();

  const groupByHotspotId = new Map<string, any>();
  for (const g of groups) {
    const key = g.primaryHotspot.toString();
    if (groupByHotspotId.has(key)) {
      console.warn(`WARNING: Hotspot ${key} is primaryHotspot in multiple groups ("${groupByHotspotId.get(key).name}" and "${g.name}"). Using first group found.`);
      continue;
    }
    groupByHotspotId.set(key, g);
  }

  const primaryHotspotIds = [...groupByHotspotId.keys()].map((id) => new mongoose.Types.ObjectId(id));

  const contentConditions = [
    { plan: { $exists: true, $ne: "" } },
    { birding: { $exists: true, $ne: "" } },
    { about: { $exists: true, $ne: "" } },
    { webpage: { $exists: true, $ne: "" } },
    { links: { $exists: true, $not: { $size: 0 } } },
    { trailMap: { $exists: true, $ne: "" } },
    { fee: { $in: ["Yes", "No"] } },
    { restrooms: { $in: ["Yes", "No"] } },
    { accessible: { $in: ["Yes", "No"] } },
    { roadside: { $in: ["Yes", "No"] } },
  ];

  const filter: Record<string, unknown> = {
    ...buildFilter(regionCode),
    $or: [
      ...contentConditions,
      ...(primaryHotspotIds.length ? [{ _id: { $in: primaryHotspotIds } }] : []),
    ],
  };

  const rawHotspots = await Hotspot.find(filter, [
    "locationId",
    "countryCode",
    "stateCode",
    "countyCode",
    "webpage",
    "links",
    "trailMap",
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

  const hotspots = (rawHotspots as any[])
    .map((h) => mergeGroupContent(h, groupByHotspotId.get(h._id.toString())))
    .filter(hasExportableContent);

  if (!hotspots.length) {
    console.log(`No hotspots with content found${regionCode ? ` for region ${regionCode}` : ""}.`);
    process.exit(0);
  }

  const primaryHotspotCount = hotspots.filter((h: any) => groupByHotspotId.has(h._id.toString())).length;
  console.log(`Found ${hotspots.length} hotspot(s) with content (${primaryHotspotCount} are primary hotspots for migration-ready groups).`);

  const lines: string[] = [];
  lines.push("-- Exported from BirdingHotspots.org");
  lines.push(`-- Region: ${regionCode || "ALL"}`);
  lines.push(`-- Date: ${new Date().toISOString()}`);
  lines.push(`-- Count: ${hotspots.length}`);
  lines.push("");
  lines.push("BEGIN;");
  lines.push("");
  lines.push("-- hotspot_content");

  for (const h of hotspots as any[]) {
    checkLength(h.locationId, "website_url", h.webpage, 2048);

    const locId = sqlQuote(h.locationId);
    const websiteUrl = sqlStr(h.webpage);
    const links = formatLinks(h.links, h.trailMap);
    const entranceFee = featureVal(h.fee);
    const restrooms = featureVal(h.restrooms);
    const accessibleTrail = h.accessible === "No" ? "NULL" : featureVal(h.accessible);
    const roadsideViewing = featureVal(h.roadside);
    const creationDt = sqlTimestamp(h.createdAt);
    const lastEditedDt = sqlTimestamp(h.updatedAt || h.createdAt);

    lines.push(`INSERT INTO cur.hotspot_content (
  loc_id, website_url, links,
  entrance_fee, restrooms, accessible_trail, roadside_viewing,
  restricted_access, seasonal_access, parking, scope_recommended, beginner_friendly, observation_amenities,
  created_by_user_id, edited_by_user_id, creation_dt, last_edited_dt
) VALUES (
  ${locId}, ${websiteUrl}, ${links},
  ${entranceFee}, ${restrooms}, ${accessibleTrail}, ${roadsideViewing},
  NULL, NULL, NULL, NULL, NULL, NULL,
  '${EBIRD_USER_ID}', '${EBIRD_USER_ID}', ${creationDt}, ${lastEditedDt}
) ON CONFLICT (loc_id) DO NOTHING;`);
  }

  lines.push("");
  lines.push("-- hotspot_text_content");

  for (const h of hotspots as any[]) {
    const hasText = h.plan || h.birding || h.about;
    if (!hasText) continue;

    checkLength(h.locationId, "plan_visit_text", h.plan, 16384);
    checkLength(h.locationId, "birding_text", h.birding, 16384);
    checkLength(h.locationId, "about_text", h.about, 16384);

    const locId = sqlQuote(h.locationId);
    const language = sqlQuote(getLanguageForHotspot(h));
    const planText = sqlStr(h.plan ? convertMapLinks(h.plan) : h.plan);
    const birdingText = sqlStr(h.birding ? convertMapLinks(h.birding) : h.birding);
    const aboutText = sqlStr(h.about ? convertMapLinks(h.about) : h.about);
    const creationDt = sqlTimestamp(h.createdAt);
    const lastEditedDt = sqlTimestamp(h.updatedAt || h.createdAt);

    lines.push(`INSERT INTO cur.hotspot_text_content (
  loc_id, language, default_lang,
  plan_visit_text, birding_text, about_text,
  created_by_user_id, edited_by_user_id, creation_dt, last_edited_dt
) VALUES (
  ${locId}, ${language}, true,
  ${planText}, ${birdingText}, ${aboutText},
  '${EBIRD_USER_ID}', '${EBIRD_USER_ID}', ${creationDt}, ${lastEditedDt}
) ON CONFLICT (loc_id, language) DO NOTHING;`);
  }

  lines.push("");
  lines.push("COMMIT;");
  lines.push("");

  if (!fs.existsSync("exports")) fs.mkdirSync("exports");
  const suffix = regionCode ? `-${regionCode}` : "";
  const outPath = `exports/birdinghotspots${suffix}.sql`;
  fs.writeFileSync(outPath, lines.join("\n"), "utf-8");
  console.log(`Written to ${outPath}`);

  process.exit(0);
}

main();
