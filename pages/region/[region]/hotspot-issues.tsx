import React from "react";
import { GetServerSideProps } from "next";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { getHotspotsForRegion } from "lib/helpers";
import KDBush from "kdbush";
import { around } from "geokdbush";
import HotspotIssueList from "components/HotspotIssueList";

export type Hotspot = {
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
  React.useEffect(() => {
    setIsClientReady(true);
  }, []);

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Hotspot Issues - ${regionCode}`}</Title>
      <PageHeading>Hotspot Issues - {regionCode}</PageHeading>

      <h3 className="text-lg mb-1 font-bold">Duplicate Hotspots</h3>
      <p className="text-sm text-gray-600 mb-4">The following hotspots are within 50 meters of each other.</p>
      {isClientReady && <HotspotIssueList duplicateHotspots={duplicateHotspots} />}
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
