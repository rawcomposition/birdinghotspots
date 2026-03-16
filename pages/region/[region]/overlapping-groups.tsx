import React from "react";
import Link from "next/link";
import { getOverlappingGroupsByRegion } from "lib/mongo";
import { getRegion } from "lib/localData";
import { GetServerSideProps } from "next";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { Region } from "lib/types";

type Props = {
  region: Region | null;
  regionCode: string;
  clusters: { name: string; url: string; isMigrationReady: boolean; needsPrimaryHotspot: boolean }[][];
};

export default function OverlappingGroups({ region, regionCode, clusters }: Props) {
  const name = region?.detailedName || "World";

  // Count how many clusters each group appears in
  const clusterCount = new Map<string, number>();
  for (const cluster of clusters) {
    for (const group of cluster) {
      clusterCount.set(group.url, (clusterCount.get(group.url) || 0) + 1);
    }
  }

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Overlapping Groups - ${name}`}</Title>
      <PageHeading region={region || undefined}>Overlapping Groups</PageHeading>

      <div className="flex gap-4 mb-6 border-b">
        <span className="font-bold border-b-2 border-black pb-2">Paired</span>
        <Link href={`/region/${regionCode}/overlapping-groups-transitive`} className="text-gray-500 pb-2">
          Chained
        </Link>
      </div>

      {clusters.length === 0 ? (
        <p className="text-gray-500">No overlapping groups found.</p>
      ) : (
        <>
          <p className="mb-4 text-gray-600">
            <strong>{new Set(clusters.flat().map((g) => g.url)).size.toLocaleString()}</strong> groups in{" "}
            <strong>{clusters.length.toLocaleString()}</strong> {clusters.length === 1 ? "cluster" : "clusters"}.
          </p>
          <p className="mb-4 text-gray-600">
            Each cluster is a set of groups that have a hotspot in common. A group may appear more than once if it
            shares hotspots with different groups.
          </p>
          <ul className="flex flex-col gap-4 divide-y border-t">
            {clusters.map((cluster, i) => (
              <li key={i} className="flex flex-col pt-4">
                {cluster.map((group) => (
                  <div key={group.url} className="flex items-center gap-1">
                    <Link href={group.url}>{group.name}</Link>
                    {group.isMigrationReady && (
                      <span className="bg-green-800 text-white text-[11px] leading-none px-2 py-1 rounded whitespace-nowrap">
                        Migration Ready
                      </span>
                    )}
                    {group.needsPrimaryHotspot && (
                      <span className="bg-orange-100 text-orange-800 text-[11px] leading-none px-2 py-1 rounded whitespace-nowrap">
                        Needs General
                      </span>
                    )}
                    {(clusterCount.get(group.url) || 0) > 1 && (
                      <span
                        title={`Appears in ${clusterCount.get(group.url)} clusters`}
                        className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded"
                      >
                        +{(clusterCount.get(group.url) || 0) - 1} more
                      </span>
                    )}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const regionCode = query.region as string;
  const region = regionCode === "world" ? null : getRegion(regionCode);
  if (regionCode !== "world" && !region) return { notFound: true };

  const clusters = await getOverlappingGroupsByRegion(regionCode);

  return {
    props: { region, regionCode, clusters },
  };
};
