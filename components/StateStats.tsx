import React from "react";

type Props = {
  stateCode: string;
};

type Stats = {
  total: number;
  withImg: number;
};

export default function StateStats({ stateCode }: Props) {
  const [stats, setStats] = React.useState<Stats>();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/state-stats?state=${stateCode}`);
        const json = await response.json();
        setStats(json);
      } catch (error) {}
    };
    if (stateCode) fetchData();
  }, [stateCode]);

  return (
    <div className="flex gap-4 mt-8">
      <div className="flex flex-col rounded bg-gray-100 px-4 py-3">
        <span className="text-2xl font-bold text-[#325a79]">{stats?.total?.toLocaleString()}</span>
        <span className="text-xs">Hotspots</span>
      </div>
      <div className="flex flex-col rounded bg-gray-100 px-4 py-3">
        <span className="text-2xl font-bold text-[#325a79]">{stats?.withImg?.toLocaleString()}</span>
        <span className="text-xs">With Images</span>
      </div>
    </div>
  );
}
