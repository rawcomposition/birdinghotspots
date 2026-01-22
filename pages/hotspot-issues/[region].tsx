import React from "react";
import { GetServerSideProps } from "next";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { getHotspotsForRegion, haversineDistance, createUnionFind, getRegion } from "lib/helpers";
import KDBush from "kdbush";
import { around } from "geokdbush";
import HotspotIssueList from "components/HotspotIssues/List";
import { EBirdRegion } from "lib/types";
import HotspotIssuesNotice from "components/HotspotIssues/Notice";
import clsx from "clsx";
import SyncRegions from "data/sync-regions.json";

export type Hotspot = {
  locationId: string;
  name: string;
  lat: number;
  lng: number;
  total: number;
  checklists: number;
  countryCode: string;
  subnational1Code: string;
  subnational2Code: string;
};

type Props = {
  regionCode: string;
  regionName: string;
  isRegionActive: boolean;
  closeProximityClusters: {
    name: string;
    hotspots: Hotspot[];
    hasOverlappingMarkers: boolean;
  }[];
  duplicateNameClusters: {
    name: string;
    hotspots: Hotspot[];
    hasOverlappingMarkers: boolean;
  }[];
};

export default function DuplicateHotspots({
  regionName,
  closeProximityClusters,
  duplicateNameClusters,
  isRegionActive,
}: Props) {
  const [isClientReady, setIsClientReady] = React.useState<boolean>(false);
  React.useEffect(() => {
    setIsClientReady(true);
  }, []);

  const totalIssues = closeProximityClusters.length + duplicateNameClusters.length;

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Hotspot Issues - ${regionName}`}</Title>
      <PageHeading>Hotspot Issues</PageHeading>
      <p className="text-lg mb-2 -mt-10">
        We found{" "}
        <strong>
          {totalIssues} potential hotspot {totalIssues === 1 ? "issue" : "issues"}
        </strong>{" "}
        in {regionName}.
      </p>
      <p className="mb-8">
        Jump to{" "}
        <a href="#close-proximity" className="text-sky-700 font-bold">
          Close Proximity ({closeProximityClusters.length})
        </a>{" "}
        or{" "}
        <a href="#duplicate-names" className="text-sky-700 font-bold">
          Duplicate Names ({duplicateNameClusters.length})
        </a>
        .
      </p>

      {isClientReady && <HotspotIssuesNotice />}

      <h3 id="close-proximity" className="text-lg mb-1 font-bold">
        Close Proximity Hotspots <ClusterBadge count={closeProximityClusters.length} />
      </h3>
      {closeProximityClusters.length === 0 && (
        <p className="text-sm text-gray-600 mb-1">Fantastic! No close proximity hotspot issues found.</p>
      )}
      {closeProximityClusters.length > 0 && (
        <p className="text-sm text-gray-600 mb-1">The following hotspots are within 50 meters of each other.</p>
      )}
      {isClientReady && <HotspotIssueList hotspotClusters={closeProximityClusters} isRegionActive={isRegionActive} />}

      <h3 id="duplicate-names" className="text-lg mb-1 mt-12 font-bold">
        Duplicate Name Hotspots <ClusterBadge count={duplicateNameClusters.length} />
      </h3>
      {duplicateNameClusters.length === 0 && (
        <p className="text-sm text-gray-600 mb-1">Fantastic! No duplicate name hotspot issues found.</p>
      )}
      {duplicateNameClusters.length > 0 && (
        <p className="text-sm text-gray-600 mb-1">The following hotspots share the same name within the same region.</p>
      )}
      {isClientReady && <HotspotIssueList hotspotClusters={duplicateNameClusters} isRegionActive={isRegionActive} />}
    </div>
  );
}

const ClusterBadge = ({ count }: { count: number }) => {
  return (
    <span
      className={clsx(
        count > 0 ? "bg-yellow-300 text-yellow-800" : "bg-gray-300 text-gray-600",
        "rounded-full px-3 py-[3px] text-sm ml-2 font-semibold"
      )}
    >
      {count} {count === 1 ? "issue" : "issues"}
    </span>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const regionCode = query.region as string;
  if (!regionCode) return { notFound: true };
  if (regionCode === "US") return { notFound: true };
  const isRegionActive = SyncRegions.some(
    (syncRegion) => syncRegion === regionCode || regionCode.startsWith(syncRegion)
  );

  let hotspots: Hotspot[];
  let region: EBirdRegion;
  try {
    hotspots = await getHotspotsForRegion(regionCode);
    region = await getRegion(regionCode);
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
    props: {
      regionCode,
      regionName: region.result,
      closeProximityClusters,
      duplicateNameClusters: getDuplicateNameClusters(hotspots, closeProximityClusters),
      isRegionActive,
    },
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

function getDuplicateNameClusters(
  hotspots: Hotspot[],
  closeProximityClusters: { hotspots: Hotspot[] }[]
): { name: string; hotspots: Hotspot[]; hasOverlappingMarkers: boolean }[] {
  const closeProximityIds = new Set<string>();
  closeProximityClusters.forEach((cluster) => {
    cluster.hotspots.forEach((hotspot) => closeProximityIds.add(hotspot.locationId));
  });

  const clustersByKey = new Map<string, Hotspot[]>();
  hotspots.forEach((hotspot) => {
    const trimmedName = hotspot.name.trim().toLowerCase();
    const scopeKey = hotspot.subnational2Code?.trim() || hotspot.subnational1Code?.trim() || hotspot.countryCode.trim();
    const key = `${scopeKey}::${trimmedName}`;
    const cluster = clustersByKey.get(key);
    if (cluster) cluster.push(hotspot);
    else clustersByKey.set(key, [hotspot]);
  });

  return [...clustersByKey.entries()]
    .map(([key, cluster]) => {
      return {
        name: cluster[0].name,
        hotspots: cluster,
        hasOverlappingMarkers: hasOverlappingMarkers(cluster),
      };
    })
    .filter((cluster) => cluster.hotspots.length > 1)
    .filter((cluster) => {
      const allInCloseProximity = cluster.hotspots.every((hotspot) => closeProximityIds.has(hotspot.locationId));
      return !allInCloseProximity;
    });
}
