import React from "react";
import { GetServerSideProps } from "next";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { getHotspotsForRegion } from "lib/helpers";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import MapKit from "components/HotspotIssueMapKit";
import KDBush from "kdbush";
import { around } from "geokdbush";

type Hotspot = {
  locationId: string;
  name: string;
  lat: number;
  lng: number;
  total: number;
  subnational1Code: string;
  subnational2Code: string;
};

type Props = {
  regionCode: string;
  duplicateHotspots: {
    name: string;
    hotspots: Hotspot[];
    hasOverlappingMarkers: boolean;
  }[];
};

export default function DuplicateHotspots({ regionCode, duplicateHotspots }: Props) {
  const [isClientReady, setIsClientReady] = React.useState<boolean>(false);
  const [reviewed, setReviewed] = React.useState<Set<string>>(new Set());
  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    const initial = new Set<string>();
    duplicateHotspots.forEach((item) => {
      initial.add(item.name);
    });
    return initial;
  });

  React.useEffect(() => {
    setIsClientReady(true);

    const handleError = (event: ErrorEvent) => {
      const message = event.message || event.error?.message || "";
      if (
        message.includes("message channel closed") ||
        message.includes("asynchronous response") ||
        message.includes("Extension context invalidated")
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason || "");
      if (
        message.includes("message channel closed") ||
        message.includes("asynchronous response") ||
        message.includes("Extension context invalidated")
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection, true);

    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, true);
    };
  }, []);

  const toggleExpanded = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleReviewedChange = (name: string, checked: boolean) => {
    setReviewed((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(name);
        setExpanded((exp) => {
          const nextExp = new Set(exp);
          nextExp.delete(name);
          return nextExp;
        });
      } else {
        next.delete(name);
        setExpanded((exp) => {
          const nextExp = new Set(exp);
          nextExp.add(name);
          return nextExp;
        });
      }
      return next;
    });
  };

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Hotspot Issues - ${regionCode}`}</Title>
      <PageHeading>Hotspot Issues - {regionCode}</PageHeading>

      <h3 className="text-lg mb-1 font-bold">Duplicate Hotspots</h3>
      <p className="text-sm text-gray-600 mb-4">The following hotspots are within 50 meters of each other.</p>
      <div className="space-y-6 mt-8">
        {duplicateHotspots.map((duplicateHotspot) => {
          const isExpanded = expanded.has(duplicateHotspot.name);
          const isReviewed = reviewed.has(duplicateHotspot.name);

          return (
            <div key={duplicateHotspot.name} className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-t-lg border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(duplicateHotspot.name)}
                    className="hover:bg-gray-200 rounded-md p-1 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-500 -rotate-90" />
                    )}
                  </button>
                  <h2 className="font-bold text-gray-700">{duplicateHotspot.name}</h2>
                </div>
                <label className="flex items-center gap-2 cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={isReviewed}
                    onChange={(e) => handleReviewedChange(duplicateHotspot.name, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Reviewed</span>
                </label>
              </div>
              {isExpanded && (
                <div className="px-6 pt-3 pb-4">
                  <div className="flex gap-6">
                    <div className="flex-1 space-y-3">
                      {duplicateHotspot.hotspots.map((hotspot) => (
                        <div
                          key={hotspot.locationId}
                          className="flex items-center justify-between pt-2 pb-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{hotspot.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-mono">{hotspot.locationId}</span>
                              <span className="mx-2">•</span>
                              {hotspot.total > 0 && <span>{hotspot.total} species</span>}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4 text-sm">
                            <a
                              href={`https://ebird.org/hotspot/${hotspot.locationId}`}
                              className="font-semibold"
                              target="_blank"
                              rel="noreferrer"
                            >
                              View Details
                            </a>
                            <span className="text-gray-300">|</span>
                            <a
                              href={`https://ebird.org/mylocations/edit/${hotspot.locationId}`}
                              className="font-semibold"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Manage
                            </a>
                          </div>
                        </div>
                      ))}
                      {duplicateHotspot.hasOverlappingMarkers && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Some markers in this cluster are plotted directly over each other on
                            the map due to extremely close proximity.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="w-96 flex-shrink-0">
                      {isClientReady && (
                        <MapKit
                          key={duplicateHotspot.name}
                          markers={duplicateHotspot.hotspots.map((hotspot) => ({
                            name: hotspot.name,
                            lat: hotspot.lat,
                            lng: hotspot.lng,
                            type: "hotspot",
                            url: `https://ebird.org/hotspot/${hotspot.locationId}`,
                            customLink: {
                              label: "Manage",
                              url: `https://ebird.org/mylocations/edit/${hotspot.locationId}`,
                            },
                            species: hotspot.total,
                          }))}
                          zoom={12}
                          useTargetBlank
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const regionCode = query.region as string;
  if (!regionCode) return { notFound: true };
  if (regionCode === "US") return { notFound: true };

  let hotspots: Hotspot[];
  try {
    hotspots = await getHotspotsForRegion(regionCode);
  } catch {
    return { notFound: true };
  }

  const clusters = clusterHotspotsByRadius(hotspots, 0.05);

  const duplicateHotspots = clusters
    .filter((c) => c.length > 1)
    .map((c) => ({
      name: c.map((h) => h.locationId).join(", "),
      hotspots: c,
      hasOverlappingMarkers: hasOverlappingMarkers(c),
    }));

  return {
    props: { regionCode, duplicateHotspots },
  };
};

function createUnionFind(size: number) {
  const parent = new Int32Array(size);
  const rank = new Uint8Array(size);
  for (let i = 0; i < size; i++) parent[i] = i;

  const find = (x: number): number => {
    let p = x;
    while (parent[p] !== p) p = parent[p];
    while (parent[x] !== x) {
      const next = parent[x];
      parent[x] = p;
      x = next;
    }
    return p;
  };

  const union = (a: number, b: number): void => {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return;
    if (rank[ra] < rank[rb]) {
      parent[ra] = rb;
    } else if (rank[ra] > rank[rb]) {
      parent[rb] = ra;
    } else {
      parent[rb] = ra;
      rank[ra]++;
    }
  };

  return { find, union };
}

function clusterHotspotsByRadius(hotspots: Hotspot[], maxDistanceKm: number): Hotspot[][] {
  const n = hotspots.length;
  if (n === 0) return [];

  const index = new KDBush(n);
  for (let i = 0; i < n; i++) {
    const h = hotspots[i];
    index.add(h.lng, h.lat); // x=lng, y=lat
  }
  index.finish();

  const { find, union } = createUnionFind(n);

  for (let i = 0; i < n; i++) {
    const h = hotspots[i];
    const neighbors = around(index, h.lng, h.lat, undefined, maxDistanceKm) as number[];
    for (const j of neighbors) {
      if (j > i) union(i, j);
    }
  }

  const clustersByRoot = new Map<number, Hotspot[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    const cluster = clustersByRoot.get(root);
    if (cluster) cluster.push(hotspots[i]);
    else clustersByRoot.set(root, [hotspots[i]]);
  }

  return [...clustersByRoot.values()];
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function hasOverlappingMarkers(cluster: Hotspot[]): boolean {
  const OVERLAP_THRESHOLD_KM = 0.002;

  for (let i = 0; i < cluster.length; i++) {
    for (let j = i + 1; j < cluster.length; j++) {
      const distance = haversineDistance(cluster[i].lat, cluster[i].lng, cluster[j].lat, cluster[j].lng);
      if (distance <= OVERLAP_THRESHOLD_KM) {
        return true;
      }
    }
  }
  return false;
}
