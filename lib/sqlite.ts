import Database from "better-sqlite3";
import zlib from "zlib";
import path from "path";

// SQLITE_DB_PATH lets the archive live on a mounted data volume (e.g. Dokploy's
// /data). Absolute paths are used as-is; relative paths resolve from cwd.
const DB_PATH = process.env.SQLITE_DB_PATH
  ? path.resolve(process.env.SQLITE_DB_PATH)
  : path.join(process.cwd(), "data/birdinghotspots.db");

let cached: Database.Database | null = null;

function getDb() {
  if (!cached) {
    // The archive is shipped in DELETE journal mode (see migrate script), so a
    // plain read-only open is a single self-contained file with no -wal/-shm
    // sidecars — works on a read-only deploy filesystem.
    cached = new Database(DB_PATH, { readonly: true, fileMustExist: true });
    cached.pragma("query_only = true");
    cached.pragma("cache_size = -16000"); // ~16 MB page cache
    cached.pragma("mmap_size = 268435456"); // 256 MB; read straight from the mmap'd file
    cached.pragma("temp_store = MEMORY");
  }
  return cached;
}

function getOne<T = any>(id: string, type: string): T | null {
  const db = getDb();
  const row = db.prepare("SELECT data FROM content WHERE id = ? AND type = ?").get(id, type) as
    | { data: Buffer }
    | undefined;
  // `data` is gzip-compressed JSON (see scripts/migrate-to-sqlite.ts).
  return row ? JSON.parse(zlib.gunzipSync(row.data).toString("utf8")) : null;
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
