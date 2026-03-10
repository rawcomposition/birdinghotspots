import React from "react";
import Link from "next/link";
import { getGroupPrimaryHotspotsByRegion } from "lib/mongo";
import { getRegion } from "lib/localData";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { Region } from "lib/types";
import { useModal } from "providers/modals";
import useSecureFetch from "hooks/useSecureFetch";

type StatusValue = "unreviewed" | "retired" | "needsPrimary" | "migrationReady";

type GroupItem = {
  _id: string;
  name: string;
  url: string;
  locationId: string;
  isMigrationReady: boolean;
  isRetired: boolean;
  needsPrimaryHotspot: boolean;
  primaryHotspotName: string | null;
  hasConflictingContent: boolean;
};

function getStatus(group: GroupItem): StatusValue {
  if (group.isRetired) return "retired";
  if (group.isMigrationReady) return "migrationReady";
  if (group.needsPrimaryHotspot) return "needsPrimary";
  return "unreviewed";
}

const statusOptions: { value: StatusValue; label: string }[] = [
  { value: "unreviewed", label: "Unreviewed" },
  { value: "retired", label: "Retired" },
  { value: "needsPrimary", label: "Needs Primary" },
  { value: "migrationReady", label: "Ready" },
];

const statusColors: Record<StatusValue, string> = {
  unreviewed: "bg-gray-200 text-gray-700",
  retired: "bg-orange-100 text-orange-800",
  needsPrimary: "bg-orange-100 text-orange-800",
  migrationReady: "bg-green-800 text-white",
};

function StatusDropdown({
  status,
  onChange,
}: {
  status: StatusValue;
  onChange: (status: StatusValue) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const label = statusOptions.find((o) => o.value === status)?.label;

  React.useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`text-xs pl-2.5 pr-1.5 py-1 rounded whitespace-nowrap cursor-pointer inline-flex items-center gap-1 ${statusColors[status]}`}
      >
        {label}
        <svg className="w-3 h-3 opacity-60" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 bg-white rounded-md shadow-lg ring-1 ring-black/5 py-1 z-10 min-w-[130px]">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-2 py-1 hover:bg-gray-100 ${
                opt.value === status ? "bg-gray-50" : ""
              }`}
            >
              <span className={`text-xs px-2 py-0.5 rounded ${statusColors[opt.value]}`}>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  onShowConflict,
  onStatusChange,
}: {
  group: GroupItem;
  index: number;
  isActive: boolean;
  onClick: (locationId: string, forceActive?: boolean) => void;
  onShowHotspots: (locationId: string) => void;
  onShowConflict: (locationId: string, name: string) => void;
  onStatusChange: (id: string, status: StatusValue) => void;
}) {
  const status = getStatus(group);
  return (
    <tr
      className={`border-b ${isActive ? "bg-blue-50" : ""}`}
      onClick={() => onClick(group.locationId)}
    >
      <td className="py-1.5 pr-2 text-gray-400 text-sm">{index + 1}</td>
      <td className="py-1.5 pr-4">
        <Link href={group.url}>{group.name}</Link>
      </td>
      <td className="py-1.5 pr-4">
        <StatusDropdown status={status} onChange={(s) => onStatusChange(group._id, s)} />
      </td>
      <td className="py-1.5 pr-4 text-gray-600">{group.primaryHotspotName}</td>
      <td className="py-1.5 pr-4">
        {group.hasConflictingContent && (
          <button
            type="button"
            className="text-sm text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onShowConflict(group.locationId, group.name);
            }}
          >
            Conflict
          </button>
        )}
      </td>
      <td className="py-1.5 flex gap-4">
        <button
          type="button"
          className="text-sm text-[#4a84b2]"
          onClick={(e) => {
            e.stopPropagation();
            onClick(group.locationId, true);
            onShowHotspots(group.locationId);
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

type Filter = "all" | "with" | "without" | "withCoPrimary" | "conflicting" | "unreviewed";

export default function GroupPrimaryHotspots({ region, groups: initialGroups }: Props) {
  const { open } = useModal();
  const { send } = useSecureFetch();
  const [groups, setGroups] = React.useState(initialGroups);
  const [page, setPage] = React.useState(0);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [activeRows, setActiveRows] = React.useState<Set<string>>(new Set());
  const [dialogIndex, setDialogIndex] = React.useState<number | null>(null);
  const name = region?.detailedName || "World";

  const filteredGroups = React.useMemo(() => {
    if (filter === "with") return groups.filter((g) => g.primaryHotspotName);
    if (filter === "without") return groups.filter((g) => !g.primaryHotspotName);
    if (filter === "withCoPrimary")
      return groups.filter((g) => g.primaryHotspotName && /\([^)]*\bCo\.\)/i.test(g.primaryHotspotName));
    if (filter === "conflicting") return groups.filter((g) => g.hasConflictingContent);
    if (filter === "unreviewed") return groups.filter((g) => getStatus(g) === "unreviewed");
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

  const openGroupDialog = React.useCallback(
    (index: number) => {
      const group = pageGroups[index];
      if (!group) return;
      setDialogIndex(index);
      setActiveRows((prev) => new Set(prev).add(group.locationId));
      open("groupHotspots", {
        locationId: group.locationId,
        title: (() => {
          const status = getStatus(group);
          const label = statusOptions.find((o) => o.value === status)?.label;
          return (
            <>
              {page * PER_PAGE + index + 1}. {group.name}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded font-normal ${statusColors[status]}`}>{label}</span>
            </>
          );
        })(),
        onDismiss: () => setDialogIndex(null),
      });
    },
    [pageGroups, open, page]
  );

  const handleShowHotspots = React.useCallback(
    (locationId: string) => {
      const index = pageGroups.findIndex((g) => g.locationId === locationId);
      openGroupDialog(index);
    },
    [pageGroups, openGroupDialog]
  );

  const handleShowConflict = React.useCallback(
    (locationId: string, name: string) => {
      open("contentConflict", {
        locationId,
        title: `Content Conflict — ${name}`,
      });
    },
    [open]
  );

  React.useEffect(() => {
    if (dialogIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && dialogIndex > 0) {
        e.preventDefault();
        openGroupDialog(dialogIndex - 1);
      } else if (e.key === "ArrowRight" && dialogIndex < pageGroups.length - 1) {
        e.preventDefault();
        openGroupDialog(dialogIndex + 1);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dialogIndex, pageGroups, openGroupDialog]);

  const handleStatusChange = React.useCallback(
    async (id: string, status: StatusValue) => {
      setGroups((prev) =>
        prev.map((g) =>
          g._id === id
            ? {
                ...g,
                isRetired: status === "retired",
                isMigrationReady: status === "migrationReady",
                needsPrimaryHotspot: status === "needsPrimary",
              }
            : g
        )
      );
      await send({ url: "/api/group/set-status", method: "POST", data: { id, status } });
    },
    [send]
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
                <option value="withCoPrimary">Has (Co.) Primary</option>
                <option value="unreviewed">Unreviewed</option>
                <option value="conflicting">Has Conflicting Content</option>
              </select>
              <p className="text-sm text-gray-600">
                Showing <strong>{filteredGroups.length.toLocaleString()}</strong>
                {filter !== "all" && <> of <strong>{groups.length.toLocaleString()}</strong></>} groups
              </p>
            </div>
            {pagination}
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-4 font-bold" colSpan={2}>
                  Group
                </th>
                <th className="py-2 pr-4 font-bold">Status</th>
                <th className="py-2 pr-4 font-bold">Primary Hotspot</th>
                <th className="py-2 pr-4"></th>
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
                  onShowConflict={handleShowConflict}
                  onStatusChange={handleStatusChange}
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

export const getServerSideProps = getSecureServerSideProps(async ({ query }) => {
  const regionCode = query.region as string;
  const region = regionCode === "world" ? null : getRegion(regionCode);
  if (regionCode !== "world" && !region) return { notFound: true };

  const groups = await getGroupPrimaryHotspotsByRegion(regionCode);

  return {
    props: { region, groups },
  };
}, true);
