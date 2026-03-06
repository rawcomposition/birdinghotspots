import type { NextApiRequest, NextApiResponse } from "next";
import connect from "lib/mongo";
import Group from "models/Group";
import Hotspot from "models/Hotspot";

type Point = [number, number]; // [lng, lat]
const INSIDE_FOOTPRINT_LIMIT = 200;
const FOOTPRINT_BUFFER_KM = 0.5;
const KM_PER_DEG_LAT = 110.574;

// Graham scan convex hull
function convexHull(points: Point[]): Point[] {
  const unique = points.filter((p, i) => points.findIndex((q) => q[0] === p[0] && q[1] === p[1]) === i);
  if (unique.length < 3) return unique;

  unique.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const cross = (o: Point, a: Point, b: Point) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lower: Point[] = [];
  for (const p of unique) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Point[] = [];
  for (const p of unique.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function closeRing(points: Point[]): Point[] {
  if (points.length === 0) return points;
  const first = points[0];
  const last = points[points.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return points;
  return [...points, first];
}

function addBufferToPoints(points: Point[], bufferKm: number): Point[] {
  const expanded: Point[] = [];
  for (const [lng, lat] of points) {
    const latDelta = bufferKm / KM_PER_DEG_LAT;
    const lngKmPerDeg = Math.max(Math.abs(111.32 * Math.cos((lat * Math.PI) / 180)), 0.0001);
    const lngDelta = bufferKm / lngKmPerDeg;

    expanded.push(
      [lng, lat],
      [lng + lngDelta, lat],
      [lng - lngDelta, lat],
      [lng, lat + latDelta],
      [lng, lat - latDelta],
      [lng + lngDelta, lat + latDelta],
      [lng + lngDelta, lat - latDelta],
      [lng - lngDelta, lat + latDelta],
      [lng - lngDelta, lat - latDelta]
    );
  }
  return expanded;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { locationId } = req.query;

  if (!locationId || typeof locationId !== "string") {
    return res.status(400).json({ error: "locationId is required" });
  }

  try {
    await connect();
    const group = await Group.findOne({ locationId }, ["hotspots"])
      .populate("hotspots", ["name", "url", "locationId", "lat", "lng"])
      .lean()
      .exec();

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const hotspots = (group.hotspots || [])
      .map((h: any) => ({ name: h.name, url: h.url, locationId: h.locationId }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    const allHotspots = (group.hotspots || []) as any[];
    const withCoords = allHotspots.filter((h: any) => h.lat != null && h.lng != null);
    let nearby: any[] = [];

    if (withCoords.length >= 3) {
      const childIds = allHotspots.map((h: any) => h.locationId);
      const childPoints = withCoords.map((h: any) => [h.lng, h.lat] as Point);
      const bufferedPoints = addBufferToPoints(childPoints, FOOTPRINT_BUFFER_KM);
      const hull = convexHull(bufferedPoints);
      if (hull.length >= 3) {
        const polygon = closeRing(hull);

        const nearbyResults = await Hotspot.find(
          {
            locationId: { $nin: childIds },
            location: {
              $geoWithin: {
                $geometry: {
                  type: "Polygon",
                  coordinates: [polygon],
                },
              },
            },
          },
          ["name", "url", "lat", "lng"]
        )
          .sort({ name: 1 })
          .limit(INSIDE_FOOTPRINT_LIMIT)
          .lean()
          .exec();

        nearby = nearbyResults.map((h: any) => ({
          name: h.name,
          url: h.url,
          _id: h._id,
          insideBounds: true,
        }));
      }
    }

    res.status(200).json({
      success: true,
      hotspots,
      nearby,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
