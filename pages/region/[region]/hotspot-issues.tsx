import React from "react";
import { GetServerSideProps } from "next";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { getHotspotsForRegion, haversineDistance, createUnionFind } from "lib/helpers";
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
  closeProximityClusters: {
    name: string;
    hotspots: Hotspot[];
    hasOverlappingMarkers: boolean;
  }[];
};

export default function DuplicateHotspots({ regionCode, closeProximityClusters }: Props) {
  const [isClientReady, setIsClientReady] = React.useState<boolean>(false);
  React.useEffect(() => {
    setIsClientReady(true);
  }, []);

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Hotspot Issues - ${regionCode}`}</Title>
      <PageHeading>Hotspot Issues - {regionCode}</PageHeading>

      <h3 className="text-lg mb-1 font-bold">
        Close Proximity Hotspots{" "}
        <span className="bg-yellow-300 rounded-full px-3 py-[3px] text-sm text-yellow-800 ml-2 font-semibold">
          {closeProximityClusters.length} issues
        </span>
      </h3>
      <p className="text-sm text-gray-600 mb-1">The following hotspots are within 50 meters of each other.</p>
      <p className="text-sm text-gray-600 mb-4">
        <strong>Note:</strong> Changes may take up to 24 hours to appear.
      </p>
      {isClientReady && <HotspotIssueList hotspotClusters={closeProximityClusters} />}
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

  const closeProximityClusters = clusters
    .filter((c) => c.length > 1)
    .map((c) => ({
      name: c.map((h) => h.locationId).join(", "),
      hotspots: c,
      hasOverlappingMarkers: hasOverlappingMarkers(c),
    }));

  return {
    props: { regionCode, closeProximityClusters },
  };
};

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
