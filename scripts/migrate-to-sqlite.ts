import mongoose from "mongoose";
import fs from "fs";
import Database from "better-sqlite3";
import KDBush from "kdbush";
import * as geokdbush from "geokdbush";
import Hotspot from "../models/Hotspot";
import Group from "../models/Group";
import Article from "../models/Article";
import Drive from "../models/Drive";
import City from "../models/City";
import { getRegion } from "../lib/localData";
import { convertMlImageToImage } from "../lib/ml";
import * as dotenv from "dotenv";
dotenv.config();

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const initHotspotSchema = Hotspot; // Ensure Hotspot model is loaded for populate()

const DB_PATH = "data/birdinghotspots.db";
const HOTSPOTS_JSON = "exports/production.hotspots.json";

function initSqlite() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS content (
      id TEXT NOT NULL,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      PRIMARY KEY (id, type)
    )
  `);
  return db;
}

// Replicated from lib/helpers.tsx
function formatMarker(hotspot: any) {
  let name = hotspot.name || "";
  if (name.includes("--")) {
    name = name.split("--")[1];
  }
  return {
    lat: hotspot.lat,
    lng: hotspot.lng,
    url: hotspot.url || null,
    name,
    species: hotspot.species,
  };
}

function getShortName(name: string) {
  if (name.includes("--")) {
    return name.split("--").pop();
  }
  return name;
}

// --- Group migration ---

async function migrateGroups(db: Database.Database) {
  console.log("Fetching groups from MongoDB...");

  const groups = await Group.find({})
    .populate("primaryHotspot", ["name", "locationId"])
    .populate("hotspots", [
      "url",
      "name",
      "featuredImg",
      "lat",
      "lng",
      "species",
      "locationId",
      "countyCode",
      "stateCode",
    ])
    .lean()
    .exec();

  console.log(`Found ${groups.length} groups`);

  // Build a lookup map by MongoDB _id for hotspot group resolution
  const groupById = new Map<string, any>();
  for (const group of groups) {
    groupById.set((group as any)._id.toString(), group);
  }

  const insert = db.prepare("INSERT OR REPLACE INTO content (id, type, data) VALUES (?, ?, ?)");
  const insertMany = db.transaction((rows: { id: string; type: string; data: string }[]) => {
    for (const row of rows) {
      insert.run(row.id, row.type, row.data);
    }
  });

  const rows = groups.map((group) => {
    const data = JSON.parse(JSON.stringify(group));
    delete data._id;
    delete data.__v;

    // Clean up populated hotspots
    if (data.hotspots) {
      data.hotspots = data.hotspots.map((h: any) => {
        const { _id, __v, ...rest } = h;
        return rest;
      });
    }
    if (data.primaryHotspot) {
      const { _id, __v, ...rest } = data.primaryHotspot;
      data.primaryHotspot = rest;
    }

    // --- Server-side transforms from getServerSideProps ---

    // Resolve region for the group
    const regionCode =
      data.countyCodes?.length === 1
        ? data.countyCodes[0]
        : data.stateCodes?.length === 1
        ? data.stateCodes[0]
        : data.countryCode;
    data.region = getRegion(regionCode);

    // Build markers from hotspots
    data.markers = data.hotspots?.map((h: any) => formatMarker(h)) || [];

    // Shorten hotspot names if they all share a prefix
    const hotspotPrefixes = data.hotspots
      ?.filter((h: any) => h.name?.includes("--"))
      .map((h: any) => h.name.split("--")[0]);
    const uniquePrefixes = [...new Set(hotspotPrefixes)];

    if (data.hotspots) {
      data.hotspots = data.hotspots.map((h: any) => ({
        ...h,
        locationLine: getRegion(h.countyCode || h.stateCode || h.countryCode)?.detailedName || "",
        name: uniquePrefixes.length === 1 ? getShortName(h.name) : h.name,
      }));
    }

    return {
      id: group.locationId,
      type: "group",
      data: JSON.stringify(data),
    };
  });

  insertMany(rows);
  console.log(`Inserted ${rows.length} groups into SQLite`);

  return groupById;
}

// --- Spatial index ---

function buildSpatialIndex(hotspots: any[]) {
  console.log("Building spatial index...");
  const hotspotsWithCoords = hotspots.filter((h: any) => h.lat && h.lng);
  const index = new KDBush(hotspotsWithCoords.length);
  for (const h of hotspotsWithCoords) {
    index.add(h.lng, h.lat);
  }
  index.finish();

  function findNearby(lat: number, lng: number, radiusKm: number, maxResults: number, excludeLocationId?: string) {
    const nearby = geokdbush.around(index, lng, lat, maxResults + 1, radiusKm);
    return nearby
      .map((i: number) => hotspotsWithCoords[i])
      .filter((h: any) => !excludeLocationId || h.locationId !== excludeLocationId)
      .slice(0, maxResults)
      .map((h: any) => ({
        name: h.name,
        url: h.url,
        featuredImg: h.featuredImg || undefined,
        lat: h.lat,
        lng: h.lng,
        species: h.species,
        countryCode: h.countryCode,
        noContent: h.noContent,
        groupIds: h.groupIds,
      }));
  }

  return findNearby;
}

// --- Hotspot migration ---

function migrateHotspots(
  db: Database.Database,
  groupById: Map<string, any>,
  hotspots: any[],
  findNearby: ReturnType<typeof buildSpatialIndex>
) {
  console.log(`Processing ${hotspots.length} hotspots...`);

  // Compute images for each hotspot (replicates getHotspotImages with ENABLE_PHOTO_SYNC=false)
  function computeImages(hotspot: any) {
    const legacyImages = hotspot.images?.filter((it: any) => !it.isMap && !it.isMigrated) || [];

    const { featuredImg1, featuredImg2, featuredImg3, featuredImg4 } = hotspot;

    const currentFeaturedMlImages = [featuredImg1, featuredImg2, featuredImg3, featuredImg4].filter(
      (it: any): it is NonNullable<typeof it> => !!it
    );

    // With ENABLE_PHOTO_SYNC=false, no eBird fetch happens
    const featuredMlImages = currentFeaturedMlImages.map((it: any) => convertMlImageToImage(it));

    const combinedImages = [...featuredMlImages, ...legacyImages];

    return combinedImages;
  }

  // Resolve groupIds ($oid refs) to group objects
  function resolveGroups(groupIds: any[]) {
    if (!groupIds?.length) return [];
    return groupIds
      .map((ref: any) => {
        const id = ref?.$oid || ref?.toString();
        return groupById.get(id);
      })
      .filter(Boolean);
  }

  const insert = db.prepare("INSERT OR REPLACE INTO content (id, type, data) VALUES (?, ?, ?)");
  const insertMany = db.transaction((rows: { id: string; type: string; data: string }[]) => {
    for (const row of rows) {
      insert.run(row.id, row.type, row.data);
    }
  });

  console.log("Processing hotspots...");
  const rows = hotspots.map((hotspot: any, i: number) => {
    if (i % 10000 === 0) console.log(`  ${i}/${hotspots.length}`);

    const data = { ...hotspot };
    const groups = resolveGroups(data.groupIds);
    delete data._id;
    delete data.__v;
    delete data.groupIds;
    delete data.location; // GeoJSON point, no longer needed

    // --- Compute images (replaces useHotspotImages + /api/hotspot/[locationId]/images) ---
    data.combinedImages = computeImages(data);

    // Clean up raw image fields that are now baked into combinedImages
    delete data.featuredImg1;
    delete data.featuredImg2;
    delete data.featuredImg3;
    delete data.featuredImg4;

    // --- Server-side transforms from getServerSideProps ---

    // Resolve region
    const region = getRegion(data.countyCode || data.stateCode || data.countryCode);
    data.region = region;

    // Build marker
    data.marker = formatMarker(data);

    // Build links (merge hotspot + group links)
    const links = [
      { url: data.webpage || "", label: "Official Website", cite: data.citeWebpage },
      { url: data.trailMap || "", label: "Trail Map", cite: false },
      ...(data.links || []),
    ].filter((it: any) => it.url);

    const groupLinks: any[] = [];
    const uniqueCitations = [...(data.citations || [])];

    groups.forEach(({ name, links, webpage, citeWebpage, trailMap, citations }: any) => {
      if (webpage) groupLinks.push({ url: webpage, label: `${name} Official Website`, cite: citeWebpage });
      if (trailMap) groupLinks.push({ url: trailMap, label: `${name} Trail Map`, cite: false });
      if (links) groupLinks.push(...links);
      if (citations) {
        citations.forEach((citation: any) => {
          if (!uniqueCitations.some((uc: any) => uc.label === citation.label)) {
            uniqueCitations.push(citation);
          }
        });
      }
    });

    data.links = [...links, ...groupLinks];
    data.citations = uniqueCitations;

    // Store slimmed-down group data for the component
    data.groups = groups.map((g: any) => ({
      name: g.name,
      about: g.about,
      locationId: g.locationId,
      images: g.images,
    }));

    // Clean up fields consumed into links
    delete data.webpage;
    delete data.citeWebpage;
    delete data.trailMap;

    // --- Nearby hotspots ---
    if (data.lat && data.lng) {
      data.nearby = findNearby(data.lat, data.lng, 16.09, 12, data.locationId);
    } else {
      data.nearby = [];
    }

    return {
      id: hotspot.locationId,
      type: "hotspot",
      data: JSON.stringify(data),
    };
  });

  // Insert in batches to avoid memory issues
  const BATCH_SIZE = 5000;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    insertMany(batch);
    console.log(`  Inserted ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
  }

  console.log(`Inserted ${rows.length} hotspots into SQLite`);
}

// --- Article migration ---

async function migrateArticles(db: Database.Database, hotspotById: Map<string, any>) {
  console.log("Fetching articles from MongoDB...");

  const articles = await Article.find({}).lean().exec();
  console.log(`Found ${articles.length} articles`);

  const insert = db.prepare("INSERT OR REPLACE INTO content (id, type, data) VALUES (?, ?, ?)");
  const insertMany = db.transaction((rows: { id: string; type: string; data: string }[]) => {
    for (const row of rows) {
      insert.run(row.id, row.type, row.data);
    }
  });

  const rows = articles.map((article: any) => {
    const data = JSON.parse(JSON.stringify(article));
    delete data._id;
    delete data.__v;

    // Resolve hotspot ObjectId refs from the JSON export
    const populatedHotspots = (data.hotspots || [])
      .map((ref: any) => {
        const id = ref?.$oid || ref?.toString();
        const h = hotspotById.get(id);
        if (!h) return null;
        return {
          _id: id,
          url: h.url,
          name: h.name,
          countyCode: h.countyCode,
          stateCode: h.stateCode,
          countryCode: h.countryCode,
          featuredImg: h.featuredImg,
          species: h.species,
        };
      })
      .filter(Boolean);

    // --- Server-side transforms from getServerSideProps ---

    const region = getRegion(data.stateCode || data.countryCode);
    data.region = region;

    const formattedHotspots = populatedHotspots.map((hotspot: any) => {
      const regionCode = hotspot.countyCode || hotspot.stateCode || hotspot.countryCode;
      const r = getRegion(regionCode);
      return {
        ...hotspot,
        locationLine: r?.detailedName || regionCode || "",
      };
    });

    const sortBy = data.sortHotspotsBy || "none";
    data.formattedHotspots = formattedHotspots.sort((a: any, b: any) =>
      sortBy === "region"
        ? `${a.locationLine} ${a.name}`.localeCompare(`${b.locationLine} ${b.name}`)
        : sortBy === "species" && a.species && b.species
        ? b.species - a.species
        : 0
    );

    // Clean up — hotspots are now in formattedHotspots
    delete data.hotspots;
    delete data.sortHotspotsBy;
    delete data.int;

    return {
      id: article.articleId,
      type: "article",
      data: JSON.stringify(data),
    };
  });

  insertMany(rows);
  console.log(`Inserted ${rows.length} articles into SQLite`);
}

// --- Drive migration ---

async function migrateDrives(db: Database.Database, hotspotById: Map<string, any>) {
  console.log("Fetching drives from MongoDB...");

  const drives = await Drive.find({}).lean().exec();
  console.log(`Found ${drives.length} drives`);

  const insert = db.prepare("INSERT OR REPLACE INTO content (id, type, data) VALUES (?, ?, ?)");
  const insertMany = db.transaction((rows: { id: string; type: string; data: string }[]) => {
    for (const row of rows) {
      insert.run(row.id, row.type, row.data);
    }
  });

  const rows = drives.map((drive: any) => {
    const data = JSON.parse(JSON.stringify(drive));
    delete data._id;
    delete data.__v;
    delete data.int;

    // Resolve entry hotspot refs and filter out entries with missing hotspots
    data.entries = (data.entries || [])
      .map((entry: any) => {
        const ref = entry.hotspot;
        const id = ref?.$oid || ref?.toString();
        const h = hotspotById.get(id);
        if (!h) return null;
        return {
          description: entry.description,
          hotspot: {
            _id: id,
            url: h.url,
            name: h.name,
            address: h.address,
          },
        };
      })
      .filter(Boolean);

    // --- Server-side transforms from getServerSideProps ---
    const region = getRegion(data.countyCode || data.stateCode || data.countryCode);
    data.region = region;

    return {
      id: drive.locationId,
      type: "drive",
      data: JSON.stringify(data),
    };
  });

  insertMany(rows);
  console.log(`Inserted ${rows.length} drives into SQLite`);
}

// --- City migration ---

async function migrateCities(db: Database.Database, findNearby: ReturnType<typeof buildSpatialIndex>) {
  console.log("Fetching cities from MongoDB...");

  const cities = await City.find({}).lean().exec();
  console.log(`Found ${cities.length} cities`);

  const insert = db.prepare("INSERT OR REPLACE INTO content (id, type, data) VALUES (?, ?, ?)");
  const insertMany = db.transaction((rows: { id: string; type: string; data: string }[]) => {
    for (const row of rows) {
      insert.run(row.id, row.type, row.data);
    }
  });

  console.log("Processing cities...");
  const rows = cities.map((city: any, i: number) => {
    if (i % 5000 === 0) console.log(`  ${i}/${cities.length}`);

    const data = JSON.parse(JSON.stringify(city));
    delete data._id;
    delete data.__v;

    // --- Server-side transforms from getServerSideProps ---
    const region = getRegion(data.stateCode || data.countryCode);
    data.region = region;

    // Hotspots within 5 miles (8.05 km), sorted by species desc (geokdbush sorts by distance,
    // but the original query sorts by species)
    if (data.lat && data.lng) {
      const nearby = findNearby(data.lat, data.lng, 8.05, 500);
      data.hotspots = nearby
        .map((h: any) => ({
          ...h,
          noContent: (h.noContent && !h.groupIds?.length) || false,
        }))
        .sort((a: any, b: any) => (b.species || 0) - (a.species || 0));
    } else {
      data.hotspots = [];
    }

    return {
      id: city.locationId,
      type: "city",
      data: JSON.stringify(data),
    };
  });

  // Insert in batches
  const BATCH_SIZE = 5000;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    insertMany(batch);
    console.log(`  Inserted ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
  }

  console.log(`Inserted ${rows.length} cities into SQLite`);
}

async function main() {
  await connect();
  const db = initSqlite();

  // Load hotspots JSON and build lookup by MongoDB _id
  if (!fs.existsSync(HOTSPOTS_JSON)) {
    throw new Error(`Hotspot export not found at ${HOTSPOTS_JSON}. Export from MongoDB first.`);
  }
  console.log(`Reading hotspots from ${HOTSPOTS_JSON}...`);
  const rawHotspots = JSON.parse(fs.readFileSync(HOTSPOTS_JSON, "utf-8"));
  const hotspotById = new Map<string, any>();
  for (const h of rawHotspots) {
    hotspotById.set(h._id?.$oid || h._id?.toString(), h);
  }

  const groupById = await migrateGroups(db);
  const findNearby = buildSpatialIndex(rawHotspots);
  migrateHotspots(db, groupById, rawHotspots, findNearby);
  await migrateArticles(db, hotspotById);
  await migrateDrives(db, hotspotById);
  await migrateCities(db, findNearby);

  db.close();
  await mongoose.disconnect();
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
