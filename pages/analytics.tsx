import React from "react";
import connect from "lib/mongo";
import Pageview from "models/Pageview";
import PageHeading from "components/PageHeading";
import { GetServerSideProps } from "next";
import LineChart from "components/LineChart";
import Title from "components/Title";
import { getRegion } from "lib/localData";
import { Region } from "lib/types";
import Link from "next/link";
import Regions from "data/regions.json";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

type Props = {
  regionName?: string;
  subregions: Region[];
  parents: Region[];
  hasRegion: boolean;
  data: {
    label: string;
    count: number;
  }[];
};

export default function Analytics({ data, regionName, subregions, parents, hasRegion }: Props) {
  return (
    <div className="container pb-16 mt-12">
      <Title>Analytics</Title>
      <PageHeading>Analytics</PageHeading>

      {hasRegion && (
        <p className="text-sm text-gray-500 mb-8 -mt-10">
          <Link href="/analytics">Site wide</Link> <ChevronRightIcon className="inline-block w-4 h-4" />{" "}
          {parents.map((parent) => (
            <React.Fragment key={parent.code}>
              <Link key={parent.code} href={`/analytics?region=${parent.code}`}>
                {parent.name}
              </Link>
              <ChevronRightIcon className="inline-block w-4 h-4" />
            </React.Fragment>
          ))}
          <span>{regionName}</span>
        </p>
      )}

      <h2 className="text-xl font-bold mb-4">{regionName} page views by month</h2>

      <LineChart data={data} className="mb-12" />

      {!!subregions?.length && (
        <>
          <h3 className="text-lg font-bold mb-2">Subregions</h3>
          <ul className={clsx("ml-2", subregions.length > 10 && "columns-2 sm:columns-5")}>
            {subregions.map((subregion) => (
              <li key={subregion.code}>
                <Link href={`/analytics?region=${subregion.code}`}>{subregion.name}</Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="text-xs text-gray-500 mt-8">
        • Only visits to hotspot, region, and city/town pages are counted. Editor and bots views are excluded.
      </p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const regionCode = query.region as string | undefined;
  const region = regionCode ? getRegion(regionCode) : null;

  const isCounty = regionCode?.split("-").length === 3;
  const isState = regionCode?.split("-").length === 2;

  await connect();

  const results = await Pageview.aggregate([
    {
      $match: isCounty
        ? { countyCode: regionCode }
        : isState
        ? { stateCode: regionCode }
        : !!regionCode
        ? { countryCode: regionCode }
        : {},
    },
    {
      $group: {
        _id: {
          year: "$year",
          month: "$month",
        },
        totalPageviews: { $sum: "$count" },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  const data = results.map(({ _id: { year, month }, totalPageviews }) => ({
    label: `${year}-${month.toString().padStart(2, "0")}`,
    count: totalPageviews,
  }));

  const subregions = region ? region.subregions || [] : Regions.map(({ name, code }) => ({ name, code }));

  return {
    props: {
      data,
      regionName: region?.name || "Site wide",
      subregions,
      parents: region?.parents?.reverse() || [],
      hasRegion: !!region,
    },
  };
};
