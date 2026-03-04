import * as dotenv from "dotenv";
import { DuckDBInstance } from "@duckdb/node-api";
import fs from "fs";
import { haversineDistance, createUnionFind } from "../lib/helpers";

dotenv.config();

const EBIRD_API_KEY = process.env.EBIRD_API_KEY;
const DB_PATH = "exports/hotspots.duckdb";
const CONCURRENCY = 1;

type EBirdCountry = { code: string; name: string };
type EBirdHotspot = {
  locId: string;
  locName: string;
  lat: number;
  lng: number;
  numSpeciesAllTime?: number;
  numChecklistsAllTime?: number;
  countryCode: string;
  subnational1Code: string;
  subnational2Code: string;
};

async function runConcurrent<T>(
  items: T[],
  fn: (item: T, index: number) => Promise<void>,
  concurrency: number
): Promise<void> {
  let index = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (index < items.length) {
      const currentIndex = index++;
      await fn(items[currentIndex], currentIndex);
    }
  });
  await Promise.all(workers);
}

async function fetchCountries(): Promise<EBirdCountry[]> {
  const response = await fetch(`https://api.ebird.org/v2/ref/region/list/country/world?fmt=json&key=${EBIRD_API_KEY}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch countries: ${response.status}`);
  }
  return response.json();
}

async function fetchHotspotsForCountry(countryCode: string): Promise<EBirdHotspot[]> {
  const response = await fetch(`https://api.ebird.org/v2/ref/hotspot/${countryCode}?fmt=json&key=${EBIRD_API_KEY}`);
  if (!response.ok) {
    console.warn(`  Failed to fetch hotspots for ${countryCode}: ${response.status}`);
    return [];
  }
  const json = await response.json();
  if (!Array.isArray(json)) {
    console.warn(`  Unexpected response for ${countryCode}`);
    return [];
  }
  return json;
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function generateReportA(connection: any): Promise<void> {
  const outputPath = "exports/global-hotspots-full.csv";
  await connection.run(`
    COPY (
      SELECT
        locId AS "LocID",
        locName AS "Name",
        lat AS "Latitude",
        lng AS "Longitude",
        countryCode AS "Country Code",
        subnational1Code AS "Subnat1 Code",
        subnational2Code AS "Subnat2 Code"
      FROM hotspots
      ORDER BY countryCode, subnational1Code, subnational2Code, locName
    ) TO '${outputPath}' (HEADER, DELIMITER ',')
  `);

  const countReader = await connection.runAndReadAll("SELECT COUNT(*) FROM hotspots");
  const count = Number(countReader.getRows()[0][0]);
  console.log(`  Report A: Full Global List -> ${outputPath} (${count.toLocaleString()} rows)`);
}

async function generateReportB(connection: any): Promise<void> {
  const outputPath = "exports/global-hotspots-exact-overlaps.csv";
  await connection.run(`
    COPY (
      WITH coord_groups AS (
        SELECT lat, lng
        FROM hotspots
        GROUP BY lat, lng
        HAVING COUNT(*) > 1
      ),
      ranked AS (
        SELECT
          h.*,
          ROW_NUMBER() OVER (
            PARTITION BY h.lat, h.lng
            ORDER BY h.numChecklistsAllTime DESC, h.locId ASC
          ) AS rn
        FROM hotspots h
        INNER JOIN coord_groups cg ON h.lat = cg.lat AND h.lng = cg.lng
      ),
      recipients AS (
        SELECT * FROM ranked WHERE rn = 1
      )
      SELECT
        r.locId AS "Location 1 LocID",
        r.locName AS "Location 1 Name",
        r.numChecklistsAllTime AS "Location 1 # Checklists",
        rec.locId AS "Final/Recipient LocID",
        rec.locName AS "Final/Recipient Name",
        rec.numChecklistsAllTime AS "Final/Recipient # Checklists"
      FROM ranked r
      INNER JOIN recipients rec ON r.lat = rec.lat AND r.lng = rec.lng
      WHERE r.rn > 1
      ORDER BY rec.locId, r.locId
    ) TO '${outputPath}' (HEADER, DELIMITER ',')
  `);

  const countReader = await connection.runAndReadAll(`
    WITH coord_groups AS (
      SELECT lat, lng FROM hotspots GROUP BY lat, lng HAVING COUNT(*) > 1
    ),
    ranked AS (
      SELECT h.*, ROW_NUMBER() OVER (
        PARTITION BY h.lat, h.lng ORDER BY h.numChecklistsAllTime DESC, h.locId ASC
      ) AS rn
      FROM hotspots h INNER JOIN coord_groups cg ON h.lat = cg.lat AND h.lng = cg.lng
    )
    SELECT COUNT(*) FROM ranked WHERE rn > 1
  `);
  const count = Number(countReader.getRows()[0][0]);
  console.log(`  Report B: Exact Overlaps -> ${outputPath} (${count.toLocaleString()} pairs)`);
}

async function generateReportC(connection: any): Promise<void> {
  const outputPath = "exports/global-hotspots-duplicate-names-500m.csv";

  // Phase 1: SQL query to find same-name pairs within 500m
  const pairsReader = await connection.runAndReadAll(`
    WITH name_groups AS (
      SELECT LOWER(TRIM(locName)) AS normalized_name
      FROM hotspots
      GROUP BY LOWER(TRIM(locName))
      HAVING COUNT(*) > 1
    )
    SELECT
      a.locId AS a_id,
      a.locName AS a_name,
      a.lat AS a_lat,
      a.lng AS a_lng,
      a.numChecklistsAllTime AS a_checklists,
      b.locId AS b_id,
      b.locName AS b_name,
      b.lat AS b_lat,
      b.lng AS b_lng,
      b.numChecklistsAllTime AS b_checklists
    FROM hotspots a
    INNER JOIN name_groups ng ON LOWER(TRIM(a.locName)) = ng.normalized_name
    INNER JOIN hotspots b ON LOWER(TRIM(b.locName)) = ng.normalized_name
      AND a.locId < b.locId
      AND ABS(a.lat - b.lat) < 0.01
      AND ABS(a.lng - b.lng) < 0.01
    WHERE st_distance_spheroid(
      st_point(a.lat, a.lng),
      st_point(b.lat, b.lng)
    ) <= 500
    ORDER BY a.locName, a.locId
  `);

  const pairs = pairsReader.getRows();

  if (pairs.length === 0) {
    const header =
      "Location Name,Location 1 LocID,Location 1 # Checklists,Final/Recipient LocID,Final/Recipient # Checklists,Distance between points in meters";
    fs.writeFileSync(outputPath, header);
    console.log(`  Report C: Duplicate Names within 500m -> ${outputPath} (0 pairs)`);
    return;
  }

  // Build a lookup of all involved hotspots
  type HotspotInfo = { locId: string; locName: string; lat: number; lng: number; checklists: number };
  const hotspotMap = new Map<string, HotspotInfo>();
  const columnNames = pairsReader.columnNames();

  for (const row of pairs) {
    const aId = String(row[0]);
    const bId = String(row[5]);
    if (!hotspotMap.has(aId)) {
      hotspotMap.set(aId, {
        locId: aId,
        locName: String(row[1]),
        lat: Number(row[2]),
        lng: Number(row[3]),
        checklists: Number(row[4]),
      });
    }
    if (!hotspotMap.has(bId)) {
      hotspotMap.set(bId, {
        locId: bId,
        locName: String(row[6]),
        lat: Number(row[7]),
        lng: Number(row[8]),
        checklists: Number(row[9]),
      });
    }
  }

  // Phase 2: Cluster using union-find
  const idArray = [...hotspotMap.keys()];
  const idToIndex = new Map(idArray.map((id, i) => [id, i]));
  const uf = createUnionFind(idArray.length);

  for (const row of pairs) {
    const aId = String(row[0]);
    const bId = String(row[5]);
    uf.union(idToIndex.get(aId)!, idToIndex.get(bId)!);
  }

  // Group into clusters
  const clusters = new Map<number, string[]>();
  for (let i = 0; i < idArray.length; i++) {
    const root = uf.find(i);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root)!.push(idArray[i]);
  }

  // Phase 3: Generate CSV rows
  const csvRows: string[] = [];
  for (const [, memberIds] of clusters) {
    const members = memberIds.map((id) => hotspotMap.get(id)!);
    // Recipient = most checklists, tie-break by locId
    members.sort((a, b) => b.checklists - a.checklists || a.locId.localeCompare(b.locId));
    const recipient = members[0];

    for (let i = 1; i < members.length; i++) {
      const member = members[i];
      const distKm = haversineDistance(member.lat, member.lng, recipient.lat, recipient.lng);
      const distM = Math.round(distKm * 1000);
      csvRows.push(
        [
          escapeCsvField(recipient.locName),
          member.locId,
          member.checklists,
          recipient.locId,
          recipient.checklists,
          distM,
        ].join(",")
      );
    }
  }

  const header =
    "Location Name,Location 1 LocID,Location 1 # Checklists,Final/Recipient LocID,Final/Recipient # Checklists,Distance between points in meters";
  fs.writeFileSync(outputPath, `${header}\n${csvRows.join("\n")}`);
  console.log(`  Report C: Duplicate Names within 500m -> ${outputPath} (${csvRows.length.toLocaleString()} pairs)`);
}

async function main() {
  if (!EBIRD_API_KEY) {
    console.error("Error: EBIRD_API_KEY not set in .env");
    process.exit(1);
  }

  const shouldRefetch = process.argv.includes("--refetch");

  console.log("Starting global hotspot report...");
  console.log(`Database: ${DB_PATH}\n`);

  // Ensure exports directory exists
  if (!fs.existsSync("exports")) {
    fs.mkdirSync("exports");
  }

  const instance = await DuckDBInstance.create(DB_PATH);
  const connection = await instance.connect();

  try {
    // Install and load spatial extension
    await connection.run("INSTALL spatial");
    await connection.run("LOAD spatial");
  } catch (err) {
    console.error("Failed to install DuckDB spatial extension. Internet access is required on first run.");
    console.error(err);
    process.exit(1);
  }

  // Create table
  await connection.run(`
    CREATE TABLE IF NOT EXISTS hotspots (
      locId VARCHAR PRIMARY KEY,
      locName VARCHAR NOT NULL,
      lat DOUBLE NOT NULL,
      lng DOUBLE NOT NULL,
      numSpeciesAllTime INTEGER DEFAULT 0,
      numChecklistsAllTime INTEGER DEFAULT 0,
      countryCode VARCHAR NOT NULL,
      subnational1Code VARCHAR DEFAULT '',
      subnational2Code VARCHAR DEFAULT ''
    )
  `);

  // Check existing data
  const countReader = await connection.runAndReadAll("SELECT COUNT(*) FROM hotspots");
  const existingCount = Number(countReader.getRows()[0][0]);

  if (existingCount > 0 && !shouldRefetch) {
    console.log(
      `Database already contains ${existingCount.toLocaleString()} hotspots. Use --refetch to re-download.\n`
    );
  } else {
    // Fetch data
    if (shouldRefetch && existingCount > 0) {
      console.log("Refetching: clearing existing data...");
      await connection.run("DELETE FROM hotspots");
    }

    console.log("Fetching country list from eBird API...");
    const countries = await fetchCountries();
    console.log(`Found ${countries.length} countries.\n`);

    console.log(`Fetching hotspots (concurrency: ${CONCURRENCY})...`);
    let totalHotspots = 0;
    const failedCountries: string[] = [];

    await runConcurrent(
      countries,
      async (country, i) => {
        try {
          const hotspots = await fetchHotspotsForCountry(country.code);

          if (hotspots.length > 0) {
            // Batch insert using multi-row VALUES
            const BATCH_SIZE = 500;
            for (let start = 0; start < hotspots.length; start += BATCH_SIZE) {
              const batch = hotspots.slice(start, start + BATCH_SIZE);
              const values = batch
                .map((h) => {
                  const locName = (h.locName || "").trim().replace(/'/g, "''");
                  return `('${h.locId}', '${locName}', ${h.lat}, ${h.lng}, ${h.numSpeciesAllTime || 0}, ${
                    h.numChecklistsAllTime || 0
                  }, '${h.countryCode || ""}', '${h.subnational1Code || ""}', '${h.subnational2Code || ""}')`;
                })
                .join(",\n");

              await connection.run(`
                INSERT OR REPLACE INTO hotspots
                  (locId, locName, lat, lng, numSpeciesAllTime, numChecklistsAllTime, countryCode, subnational1Code, subnational2Code)
                VALUES ${values}
              `);
            }
          }

          totalHotspots += hotspots.length;
          console.log(
            `  [${i + 1}/${countries.length}] ${
              country.code
            }: ${hotspots.length.toLocaleString()} hotspots (${totalHotspots.toLocaleString()} total)`
          );
        } catch (err) {
          failedCountries.push(country.code);
          console.warn(`  [${i + 1}/${countries.length}] ${country.code}: FAILED - ${err}`);
        }
      },
      CONCURRENCY
    );

    console.log(
      `\nFetch complete: ${totalHotspots.toLocaleString()} hotspots from ${countries.length} countries` +
        (failedCountries.length > 0 ? ` (${failedCountries.length} failed: ${failedCountries.join(", ")})` : "")
    );
  }

  // Generate reports
  console.log("\nGenerating reports...");
  await generateReportA(connection);
  await generateReportB(connection);
  await generateReportC(connection);

  connection.closeSync();
  console.log("\nDone!");
  process.exit();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
