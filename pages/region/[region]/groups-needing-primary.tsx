import React from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getGroupsNeedingPrimaryByRegion } from "lib/mongo";
import { getRegion } from "lib/localData";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { Region } from "lib/types";
import { useModal } from "providers/modals";

type GroupItem = {
  name: string;
  url: string;
  locationId: string;
  isRetired?: boolean;
};

type Props = {
  region: Region;
  groups: GroupItem[];
};

function RetiredBadge() {
  const { open } = useModal();

  return (
    <button
      type="button"
      onClick={() =>
        open("popover", {
          title: "Flagged for Retirement",
          text: (
            <p>
              In eBird, hotspots can only be assigned to one group (also referred to as a &ldquo;parent&rdquo;). Some of
              our groups on Birding Hotspots overlap with other groups and do not fit eBird&apos;s one-parent model.
              eBird also discourages the use of long, linear groups such as trails or rivers. As a result, some groups
              have been flagged for retirement and will not be migrated to eBird, but their content will remain
              available on Birding Hotspots for at least 12 months.
            </p>
          ),
        })
      }
      className="bg-orange-100 text-orange-800 text-[11px] leading-none px-2 py-1 rounded whitespace-nowrap cursor-pointer"
    >
      Flagged for Retirement
    </button>
  );
}

export default function GroupsNeedingPrimary({ region, groups }: Props) {
  const name = region.detailedName;

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Groups Needing a General Hotspot - ${name}`}</Title>
      <PageHeading region={region}>Groups Needing a General Hotspot</PageHeading>

      {groups.length === 0 ? (
        <p className="text-gray-500">All groups in this region have a general hotspot assigned.</p>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Showing <strong>{groups.length.toLocaleString()}</strong> group{groups.length !== 1 && "s"} without a
            general hotspot
          </p>
          <ul className="space-y-1">
            {groups.map(({ name, url, isRetired }) => (
              <li key={url} className="flex items-center gap-2">
                <Link href={url} target="_blank">
                  {name}
                </Link>
                {isRetired && <RetiredBadge />}
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
  const region = getRegion(regionCode);
  if (!region) return { notFound: true };

  const groups = await getGroupsNeedingPrimaryByRegion(regionCode);

  return {
    props: { region, groups },
  };
};
