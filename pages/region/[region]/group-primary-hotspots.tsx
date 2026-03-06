import React from "react";
import Link from "next/link";
import { getGroupPrimaryHotspotsByRegion } from "lib/mongo";
import { getRegion } from "lib/localData";
import { GetServerSideProps } from "next";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { Region } from "lib/types";
import { useModal } from "providers/modals";
import { useUser } from "providers/user";

type GroupItem = {
  name: string;
  url: string;
  locationId: string;
  isMigrationReady: boolean;
  isRetired: boolean;
  needsPrimaryHotspot: boolean;
  primaryHotspotName: string | null;
};

type Props = {
  region: Region | null;
  groups: GroupItem[];
};

const GroupRow = React.memo(function GroupRow({
  group,
  index,
  isActive,
  onClick,
  onShowHotspots,
}: {
  group: GroupItem;
  index: number;
  isActive: boolean;
  onClick: (locationId: string, forceActive?: boolean) => void;
  onShowHotspots: (locationId: string, name: string) => void;
}) {
  return (
    <tr
      className={`border-b ${isActive ? "bg-blue-50" : ""}`}
      onClick={() => onClick(group.locationId)}
    >
      <td className="py-1.5 pr-2 text-gray-400 text-sm">{index + 1}</td>
      <td className="py-1.5 pr-4">
        <span className="inline-flex items-center gap-1">
          <Link href={group.url}>{group.name}</Link>
          {group.isRetired && (
            <span className="bg-orange-100 text-orange-800 text-[11px] leading-none px-2 py-1 rounded whitespace-nowrap">Retired</span>
          )}
          {group.isMigrationReady && (
            <span className="bg-green-800 text-white text-[11px] leading-none px-2 py-1 rounded whitespace-nowrap">Migration Ready</span>
          )}
          {group.needsPrimaryHotspot && (
            <span className="bg-orange-100 text-orange-800 text-[11px] leading-none px-2 py-1 rounded whitespace-nowrap">Needs Primary</span>
          )}
        </span>
      </td>
      <td className="py-1.5 pr-4 text-gray-600">{group.primaryHotspotName}</td>
      <td className="py-1.5 flex gap-4">
        <button
          type="button"
          className="text-sm text-[#4a84b2]"
          onClick={(e) => {
            e.stopPropagation();
            onClick(group.locationId, true);
            onShowHotspots(group.locationId, group.name);
          }}
        >
          Hotspots
        </button>
        <Link href={`/group/${group.locationId}`} className="text-sm" target="_blank">
          View
        </Link>
        <Link href={`/edit/group/${group.locationId}`} className="text-sm" target="_blank">
          Edit
        </Link>
      </td>
    </tr>
  );
});

const PER_PAGE = 500;

type Filter = "all" | "with" | "without";

export default function GroupPrimaryHotspots({ region, groups }: Props) {
  const { open } = useModal();
  const [page, setPage] = React.useState(0);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [activeRows, setActiveRows] = React.useState<Set<string>>(new Set());
  const name = region?.detailedName || "World";
  const withPrimary = groups.filter((g) => g.primaryHotspotName).length;

  const filteredGroups = React.useMemo(() => {
    if (filter === "with") return groups.filter((g) => g.primaryHotspotName);
    if (filter === "without") return groups.filter((g) => !g.primaryHotspotName);
    return groups;
  }, [groups, filter]);

  const totalPages = Math.ceil(filteredGroups.length / PER_PAGE);
  const pageGroups = filteredGroups.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const handleRowClick = React.useCallback((locationId: string, forceActive?: boolean) => {
    setActiveRows((prev) => {
      const next = new Set(prev);
      if (forceActive) {
        next.add(locationId);
      } else if (next.has(locationId)) {
        next.delete(locationId);
      } else {
        next.add(locationId);
      }
      return next;
    });
  }, []);

  const handleShowHotspots = React.useCallback(
    (locationId: string, groupName: string) => {
      open("groupHotspots", { locationId, title: groupName });
    },
    [open]
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0 });
  };

  const pagination = totalPages > 1 && (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 0}
        className="text-[#4a84b2] disabled:text-gray-300"
      >
        Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2 py-1 rounded ${i === page ? "bg-blue-100 font-bold text-gray-800" : "text-[#4a84b2]"}`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages - 1}
        className="text-[#4a84b2] disabled:text-gray-300"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Group Primary Hotspots - ${name}`}</Title>
      <PageHeading region={region || undefined}>Group Primary Hotspots</PageHeading>

      {groups.length === 0 ? (
        <p className="text-gray-500">No groups found.</p>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-gray-600">
                <strong>{withPrimary.toLocaleString()}</strong> of <strong>{groups.length.toLocaleString()}</strong>{" "}
                groups have a primary hotspot.
              </p>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as Filter);
                  setPage(0);
                }}
                className="text-sm border border-gray-200 rounded px-2 py-1 pr-8 text-gray-600 bg-gray-50"
              >
                <option value="all">All</option>
                <option value="with">With Primary</option>
                <option value="without">Without Primary</option>
              </select>
            </div>
            {pagination}
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-4 font-bold" colSpan={2}>
                  Group
                </th>
                <th className="py-2 pr-4 font-bold">Primary Hotspot</th>
                <th className="py-2 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {pageGroups.map((group, i) => (
                <GroupRow
                  key={group.url}
                  group={group}
                  index={page * PER_PAGE + i}
                  isActive={activeRows.has(group.locationId)}
                  onClick={handleRowClick}
                  onShowHotspots={handleShowHotspots}
                />
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end">{pagination}</div>
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
