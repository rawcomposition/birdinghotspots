import React from "react";
import Link from "next/link";
import { getGroupPrimaryHotspotsByRegion } from "lib/mongo";
import { getRegion } from "lib/localData";
import { GetServerSideProps } from "next";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { Region } from "lib/types";

type Props = {
  region: Region | null;
  groups: {
    name: string;
    url: string;
    locationId: string;
    isMigrationReady: boolean;
    primaryHotspotName: string | null;
  }[];
};

export default function GroupPrimaryHotspots({ region, groups }: Props) {
  const name = region?.detailedName || "World";
  const withPrimary = groups.filter((g) => g.primaryHotspotName).length;

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Group Primary Hotspots - ${name}`}</Title>
      <PageHeading region={region || undefined}>Group Primary Hotspots</PageHeading>

      {groups.length === 0 ? (
        <p className="text-gray-500">No groups found.</p>
      ) : (
        <>
          <p className="mb-4 text-gray-600">
            <strong>{withPrimary.toLocaleString()}</strong> of <strong>{groups.length.toLocaleString()}</strong> groups
            have a primary hotspot.
          </p>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-2 font-bold w-8"></th>
                <th className="py-2 pr-4 font-bold">Group</th>
                <th className="py-2 pr-4 font-bold">Primary Hotspot</th>
                <th className="py-2 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, i) => (
                <tr key={group.url} className="border-b">
                  <td className="py-1.5 pr-2 text-gray-400 text-sm">{i + 1}</td>
                  <td className="py-1.5 pr-4">
                    <span className="inline-flex items-center gap-1">
                      <Link href={group.url}>{group.name}</Link>
                      {group.isMigrationReady && (
                        <span className="bg-green-800 text-white text-[11px] leading-none px-2 py-1 rounded">
                          Migration Ready
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-1.5 pr-4 text-gray-600">{group.primaryHotspotName}</td>
                  <td className="py-1.5">
                    <Link href={`/edit/group/${group.locationId}`} className="text-sm">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const regionCode = query.region as string;
  const region = regionCode === "world" ? null : getRegion(regionCode);
  if (regionCode !== "world" && !region) return { notFound: true };

  const groups = await getGroupPrimaryHotspotsByRegion(regionCode);

  return {
    props: { region, groups },
  };
};
