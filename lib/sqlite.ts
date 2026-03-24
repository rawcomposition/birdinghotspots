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

function getMany<T = any>(type: string, filter?: (item: T) => boolean): T[] {
  const db = getDb();
  const rows = db.prepare("SELECT data FROM content WHERE type = ?").all(type) as { data: string }[];
  const items = rows.map((row) => JSON.parse(row.data));
  return filter ? items.filter(filter) : items;
}

// --- Group queries ---

export function getGroupByLocationId(locationId: string) {
  return getOne(locationId, "group");
}

export function getGroupsByRegion(region: string) {
  const groups = getMany("group", (g: any) => {
    const parts = region.split("-").length;
    if (parts === 3) return g.countyCodes?.includes(region);
    if (parts === 2) return g.stateCodes?.includes(region);
    return g.countryCode === region;
  });
  return groups
    .map(({ name, url, isRetired, isMigrationReady, needsPrimaryHotspot }: any) => ({
      name,
      url,
      isRetired,
      isMigrationReady,
      needsPrimaryHotspot,
    }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));
}

export function getTopGroupsByRegion(region: string, limit: number) {
  const groups = getMany("group", (g: any) => {
    const parts = region.split("-").length;
    if (parts === 3) return g.countyCodes?.includes(region);
    if (parts === 2) return g.stateCodes?.includes(region);
    return g.countryCode === region;
  });
  return groups
    .map(({ name, url, mapImgUrl, hotspots }: any) => ({
      name,
      url,
      mapImgUrl,
      hotspots,
    }))
    .sort((a: any, b: any) => (b.hotspots?.length || 0) - (a.hotspots?.length || 0))
    .slice(0, limit);
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

export function getDrivesByState(stateCode: string) {
  return getMany("drive", (d: any) => d.stateCode === stateCode)
    .map(({ locationId, name, slug, counties }: any) => ({ locationId, name, slug, counties }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));
}

// --- Article queries ---

export function getArticleByArticleId(articleId: string) {
  return getOne(articleId, "article");
}

export function getArticlesByRegion(regionCode: string) {
  return getMany("article", (a: any) => {
    const parts = regionCode.split("-").length;
    if (parts === 2) return a.stateCode === regionCode;
    return a.countryCode === regionCode;
  })
    .map(({ name, articleId, images }: any) => ({ name, articleId, images }))
    .sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

// --- Hotspot queries ---

export function getHotspotsByRegion(region: string) {
  return getMany("hotspot", (h: any) => {
    const parts = region.split("-").length;
    if (parts === 3) return h.countyCode === region;
    if (parts === 2) return h.stateCode === region;
    return h.countryCode === region;
  })
    .map(({ name, drives, url, iba, noContent, needsDeleting, lat, lng, species, groups }: any) => ({
      name,
      drives,
      url,
      iba,
      noContent,
      needsDeleting,
      lat,
      lng,
      species,
      groupIds: groups?.length ? groups.map(() => "has-group") : [],
    }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));
}
