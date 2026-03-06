import React from "react";
import Link from "next/link";
import { getSingleHotspotGroups } from "lib/mongo";
import { GetServerSideProps } from "next";
import Title from "components/Title";

type Props = {
  groups: {
    name: string;
    url: string;
    locationId: string;
    hotspotName: string | null;
  }[];
};

export default function SingleHotspotGroups({ groups }: Props) {
  return (
    <div className="container pb-16 mt-12">
      <Title>Single Hotspot Groups</Title>
      <h1 className="text-2xl font-bold mb-4">Single Hotspot Groups</h1>

      {groups.length === 0 ? (
        <p className="text-gray-500">No groups found.</p>
      ) : (
        <>
          <p className="mb-4 text-gray-600">
            <strong>{groups.length.toLocaleString()}</strong> groups with only one child hotspot.
          </p>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-4 font-bold" colSpan={2}>Group</th>
                <th className="py-2 pr-4 font-bold">Child Hotspot</th>
                <th className="py-2 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, i) => (
                <tr key={group.locationId} className="border-b">
                  <td className="py-1.5 pr-2 text-gray-400 text-sm">{i + 1}</td>
                  <td className="py-1.5 pr-4">
                    <Link href={group.url}>{group.name}</Link>
                  </td>
                  <td className="py-1.5 pr-4 text-gray-600">{group.hotspotName}</td>
                  <td className="py-1.5 flex gap-2">
                    <Link href={`/group/${group.locationId}`} className="text-sm" target="_blank">
                      View
                    </Link>
                    <Link href={`/edit/group/${group.locationId}`} className="text-sm" target="_blank">
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

export const getServerSideProps: GetServerSideProps = async () => {
  const groups = await getSingleHotspotGroups();
  return { props: { groups } };
};
