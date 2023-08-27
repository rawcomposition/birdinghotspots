import React from "react";
import Link from "next/link";
import { RegionStatsT } from "lib/types";

type Props = {
  data?: RegionStatsT;
  regionCode: string;
};

export default function RegionStats({ regionCode, data }: Props) {
  return (
    <div className="flex gap-4">
      <Link href={`/region/${regionCode}/hotspots`} className="flex flex-col rounded bg-gray-100 px-4 py-3">
        <span className="text-2xl font-bold text-secondary">{data?.total?.toLocaleString() || "--"}</span>
        <span className="text-xs text-gray-700">Hotspots</span>
      </Link>
      <Link href={`/region/${regionCode}/hotspots?images=Yes`} className="flex flex-col rounded bg-gray-100 px-4 py-3">
        <span className="text-2xl font-bold text-secondary">{data?.withImg?.toLocaleString() || "--"}</span>
        <span className="text-xs text-gray-700">With images</span>
      </Link>
      <Link href={`/region/${regionCode}/hotspots?content=Yes`} className="flex flex-col rounded bg-gray-100 px-4 py-3">
        <span className="text-2xl font-bold text-secondary">{data?.withContent?.toLocaleString() || "--"}</span>
        <span className="text-xs text-gray-700">With content</span>
      </Link>
    </div>
  );
}
