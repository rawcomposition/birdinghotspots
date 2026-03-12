import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Group from "../models/Group";
import Hotspot from "../models/Hotspot";
dotenv.config();

const URI = process.env.MONGO_URI;
const connect = async () => (URI ? mongoose.connect(URI) : null);

const EXCLUDE_RETIRED = true;
const KM_PER_DEG_LAT = 111.32;

function boundingBoxAreaKm2(coords: { lat: number; lng: number }[]): number {
  if (coords.length < 2) return 0;
  const lats = coords.map((c) => c.lat);
  const lngs = coords.map((c) => c.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const midLat = (minLat + maxLat) / 2;
  const heightKm = (maxLat - minLat) * KM_PER_DEG_LAT;
  const widthKm = (maxLng - minLng) * KM_PER_DEG_LAT * Math.cos((midLat * Math.PI) / 180);
  return heightKm * widthKm;
}

async function main() {
  await connect();

  // Ensure Hotspot model is registered
  void Hotspot;

  const filter: Record<string, unknown> = {
    $or: [
      { "stateCodes.1": { $exists: true } },
      { "countyCodes.1": { $exists: true } },
    ],
    ...(EXCLUDE_RETIRED ? { isRetired: { $ne: true } } : {}),
  };

  const groups = await Group.find(filter)
    .populate({ path: "hotspots", select: "lat lng name locationId" })
    .lean();

  console.log(`Total groups spanning multiple countyCodes or stateCodes: ${groups.length}\n`);

  const BUCKET_SIZE = 5;
  const buckets = new Map<string, number>();
  let fitsIn80 = 0;

  for (const group of groups) {
    const hotspots = (group.hotspots as any[]).filter((h) => h && h.lat != null && h.lng != null);
    const area = boundingBoxAreaKm2(hotspots.map((h) => ({ lat: h.lat, lng: h.lng })));

    if (area <= 80) fitsIn80++;

    const capped = Math.min(area, 80);
    const bucketStart = Math.floor(capped / BUCKET_SIZE) * BUCKET_SIZE;
    const label = bucketStart >= 80 ? "80+" : `${bucketStart}–${bucketStart + BUCKET_SIZE}`;
    buckets.set(label, (buckets.get(label) || 0) + 1);
  }

  const total = groups.length;
  const fitsPct = total > 0 ? ((fitsIn80 / total) * 100).toFixed(1) : "0";
  const doesNotFitPct = total > 0 ? (((total - fitsIn80) / total) * 100).toFixed(1) : "0";

  console.log(`Fits within 80 km²:         ${fitsIn80} (${fitsPct}%)`);
  console.log(`Does NOT fit within 80 km²:  ${total - fitsIn80} (${doesNotFitPct}%)`);
  console.log();

  const sorted = [...buckets.entries()].sort((a, b) => {
    const aStart = parseInt(a[0]);
    const bStart = parseInt(b[0]);
    return aStart - bStart;
  });

  console.log("Bounding box area distribution (5 km² buckets):");
  for (const [label, count] of sorted) {
    const pct = ((count / total) * 100).toFixed(1);
    console.log(`  ${label.padEnd(15)} ${String(count).padStart(5)}  (${pct}%)`);
  }

  process.exit(0);
}

main();
