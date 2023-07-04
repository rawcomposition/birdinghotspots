import React from "react";
import Link from "next/link";

type Props = {
  regionCode: string;
};

type Stats = {
  total: number;
  withImg: number;
  withContent: number;
};

export default function RegionStats({ regionCode }: Props) {
  const [stats, setStats] = React.useState<Stats>();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/region-stats/${regionCode}`);
        const json = await response.json();
        setStats(json);
      } catch (error) {}
    };
    if (regionCode) fetchData();
  }, [regionCode]);

  return (
    <div className="flex gap-4">
      <Link href={`/hotspots/${regionCode}`} className="flex flex-col rounded bg-gray-100 px-4 py-3">
        <span className="text-2xl font-bold text-secondary">{stats?.total?.toLocaleString() || "--"}</span>
        <span className="text-xs text-gray-700">Hotspots</span>
      </Link>
      <Link href={`/hotspots/${regionCode}?filter=with-images`} className="flex flex-col rounded bg-gray-100 px-4 py-3">
        <span className="text-2xl font-bold text-secondary">{stats?.withImg?.toLocaleString() || "--"}</span>
        <span className="text-xs text-gray-700">With images</span>
      </Link>
      <Link
        href={`/hotspots/${regionCode}?filter=with-content`}
        className="flex flex-col rounded bg-gray-100 px-4 py-3"
      >
        <span className="text-2xl font-bold text-secondary">{stats?.withContent?.toLocaleString() || "--"}</span>
        <span className="text-xs text-gray-700">With content</span>
      </Link>
    </div>
  );
}
