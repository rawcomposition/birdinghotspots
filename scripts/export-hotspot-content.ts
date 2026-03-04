import fs from "fs";
import Hotspot from "../models/Hotspot";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

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
      const trimmed = decodeURIComponent(coords).trim();
      return `<span data-location="${trimmed}" class="location-link">${label}</span>`;
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

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const regionCode = args[0];
  await connect();

  const filter: Record<string, unknown> = {
    ...buildFilter(regionCode),
    $or: [
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
    ],
  };

  const hotspots = await Hotspot.find(filter, [
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

  if (!hotspots.length) {
    console.log(`No hotspots with content found${regionCode ? ` for region ${regionCode}` : ""}.`);
    process.exit(0);
  }

  console.log(`Found ${hotspots.length} hotspot(s) with content.`);

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
    const accessibleTrail = featureVal(h.accessible);
    const roadsideViewing = featureVal(h.roadside);
    const creationDt = sqlTimestamp(h.createdAt);
    const lastEditedDt = sqlTimestamp(h.updatedAt || h.createdAt);

    lines.push(`INSERT INTO cur.hotspot_content (
  loc_id, website_url, links,
  entrance_fee, restrooms, accessible_trail, roadside_viewing,
  restricted_access, seasonal_access, parking, scope_recommended, beginner_friendly, observation_amenities,
  creation_dt, last_edited_dt
) VALUES (
  ${locId}, ${websiteUrl}, ${links},
  ${entranceFee}, ${restrooms}, ${accessibleTrail}, ${roadsideViewing},
  NULL, NULL, NULL, NULL, NULL, NULL,
  ${creationDt}, ${lastEditedDt}
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
  creation_dt, last_edited_dt
) VALUES (
  ${locId}, ${language}, true,
  ${planText}, ${birdingText}, ${aboutText},
  ${creationDt}, ${lastEditedDt}
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
