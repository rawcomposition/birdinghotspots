import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data/birdinghotspots.db");

let cached: Database.Database | null = null;

function getDb() {
  if (!cached) {
    cached = new Database(DB_PATH, { readonly: true });
    cached.pragma("journal_mode = WAL");
  }
  return cached;
}

function getOne<T = any>(id: string, type: string): T | null {
  const db = getDb();
  const row = db.prepare("SELECT data FROM content WHERE id = ? AND type = ?").get(id, type) as
    | { data: string }
    | undefined;
  return row ? JSON.parse(row.data) : null;
}

// --- Group queries ---

export function getGroupByLocationId(locationId: string) {
  return getOne(locationId, "group");
}

// --- Hotspot queries ---

export function getHotspotByLocationId(locationId: string) {
  return getOne(locationId, "hotspot");
}

// --- City queries ---

export function getCityByLocationId(locationId: string) {
  return getOne(locationId, "city");
}

// --- Drive queries ---

export function getDriveByLocationId(locationId: string) {
  return getOne(locationId, "drive");
}

// --- Article queries ---

export function getArticleByArticleId(articleId: string) {
  return getOne(articleId, "article");
}

// --- Region queries (one precomputed entry per URL) ---

export function getRegionPageData(regionCode: string) {
  return getOne(regionCode, "region");
}

export function getRegionHotspotIndex(regionCode: string) {
  return getOne<any[]>(regionCode, "region-hotspot-index");
}

export function getRegionGroupIndex(regionCode: string) {
  return getOne<any[]>(regionCode, "region-group-index");
}

export function getRegionDrives(regionCode: string) {
  return getOne<any[]>(regionCode, "region-drives");
}

export function getRegionRoadside(regionCode: string) {
  return getOne<any[]>(regionCode, "region-roadside");
}

export function getRegionAccessible(regionCode: string) {
  return getOne<any[]>(regionCode, "region-accessible");
}

export function getRegionCities(regionCode: string) {
  return getOne<any[]>(regionCode, "region-cities");
}

export function getRegionIba(regionCode: string) {
  return getOne<any[]>(regionCode, "region-iba");
}
