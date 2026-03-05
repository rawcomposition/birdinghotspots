import React from "react";
import Link from "next/link";
import { getTransitiveOverlappingGroupsByRegion } from "lib/mongo";
import { getRegion } from "lib/localData";
import { GetServerSideProps } from "next";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { Region } from "lib/types";

type Props = {
  region: Region | null;
  regionCode: string;
  clusters: { name: string; url: string }[][];
};

export default function OverlappingGroupsTransitive({ region, regionCode, clusters }: Props) {
  const name = region?.detailedName || "World";
  return (
    <div className="container pb-16 mt-12">
      <Title>{`Overlapping Groups (Transitive) - ${name}`}</Title>
      <PageHeading region={region || undefined}>Overlapping Groups</PageHeading>

      <div className="flex gap-4 mb-6 border-b">
        <Link href={`/region/${regionCode}/overlapping-groups`} className="text-gray-500 pb-2">
          Paired
        </Link>
        <span className="font-bold border-b-2 border-black pb-2">Chained</span>
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
            If Group A shares a hotspot with Group B, and Group B shares a hotspot with Group C, all three appear
            together — even if A and C don&apos;t share anything directly.
          </p>
          <ul className="flex flex-col gap-4 divide-y border-t">
            {clusters.map((cluster, i) => (
              <li key={i} className="flex flex-col pt-4">
                {cluster.map((group) => (
                  <Link key={group.url} href={group.url}>{group.name}</Link>
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

  const clusters = await getTransitiveOverlappingGroupsByRegion(regionCode);

  return {
    props: { region, regionCode, clusters },
  };
};
