import React from "react";

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
        const response = await fetch(`/api/region-stats?region=${regionCode}`);
        const json = await response.json();
        setStats(json);
      } catch (error) {}
    };
    if (regionCode) fetchData();
  }, [regionCode]);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col rounded bg-gray-100 px-4 py-3">
        <span className="text-2xl font-bold text-[#325a79]">{stats?.total?.toLocaleString() || "--"}</span>
        <span className="text-xs">Hotspots</span>
      </div>
      <div className="flex flex-col rounded bg-gray-100 px-4 py-3">
        <span className="text-2xl font-bold text-[#325a79]">{stats?.withImg?.toLocaleString() || "--"}</span>
        <span className="text-xs">With images</span>
      </div>
      <div className="flex flex-col rounded bg-gray-100 px-4 py-3">
        <span className="text-2xl font-bold text-[#325a79]">{stats?.withContent?.toLocaleString() || "--"}</span>
        <span className="text-xs">With content</span>
      </div>
    </div>
  );
}
