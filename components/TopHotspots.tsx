import React from "react";
import { Hotspot } from "lib/types";
import HotspotGrid from "components/HotspotGrid";
import Link from "next/link";
import { ArrowLongRightIcon } from "@heroicons/react/24/solid";

type Props = {
  region: string;
  className?: string;
};

export default function TopHotspots({ region, className }: Props) {
  const [results, setResults] = React.useState<Hotspot[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/hotspot/by-region?region=${region}&limit=10`);
        const json = await response.json();
        setResults(json?.results || []);
      } catch (error) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  if (!loading && results.length === 0) {
    return <p className="text-base text-gray-500">None</p>;
  }

  return (
    <>
      <div className={`grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${className || ""}`}>
        <HotspotGrid hotspots={results} loading={loading} skeletonCount={10} smallTitle />
      </div>
      {results.length > 0 && (
        <Link
          href={`/region/${region}/hotspots`}
          className="bg-primary hover:bg-secondary text-white font-bold py-1.5 text-sm px-4 rounded-full w-[140px] mx-auto block mt-4 text-center"
        >
          View More
          <ArrowLongRightIcon className="inline-block w-4 h-4 ml-2" />
        </Link>
      )}
    </>
  );
}
