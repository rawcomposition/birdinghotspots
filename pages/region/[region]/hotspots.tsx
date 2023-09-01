import * as React from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import Title from "components/Title";
import { Hotspot, Region } from "lib/types";
import HotspotGrid from "components/HotspotGrid";
import { MapIcon, Bars3Icon } from "@heroicons/react/24/outline";
import ExploreMap from "components/ExploreMap";
import toast from "react-hot-toast";
import { getRegion } from "lib/localData";
import HotspotFilters from "components/HotspotFilters";
import { useRouter } from "next/router";

type Props = {
  region: Region;
};

export default function Explore({ region }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<Hotspot[]>([]);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [count, setCount] = React.useState<number | null>(null);
  const router = useRouter();
  const view = router.query.view || "grid";
  const { images, content, features } = router.query;

  const fetchHotspots = async (reset?: boolean) => {
    const offset = reset ? 0 : results.length;
    try {
      const response = await fetch(
        `/api/hotspot/by-region?region=${region.code}&offset=${offset}&images=${images}&content=${content}&features=${features}`
      );
      const json = await response.json();
      if (reset) {
        setResults(json?.results || []);
      } else {
        setResults((prev) => [...prev, ...(json?.results || [])]);
      }
      if (json?.count !== undefined) setCount(json?.count || 0);
    } catch (error) {
      toast.error("Error fetching hotspots");
    }
  };

  const loadMore = async () => {
    if (loading) return;
    setLoadingMore(true);
    await fetchHotspots();
    setLoadingMore(false);
  };

  React.useEffect(() => {
    setLoading(true);
    fetchHotspots(true);
    setLoading(false);
  }, [images, content, features]);

  const hasMore = count !== null && results.length < count;

  return (
    <div className={view === "grid" ? "container pb-16 mt-4 max-w-[975px]" : "flex flex-col h-full"}>
      <Title>{`Hotspots in ${region.name}`}</Title>
      <div
        className={`mt-8 mb-4 sm:flex justify-between items-center ${
          view === "map" ? "container my-2 max-w-[975px]" : ""
        }`}
      >
        {!loading && (
          <div>
            <p className="text-lg text-gray-500">
              Found <strong className="text-primary">{count?.toLocaleString()}</strong> hotspots in{" "}
              <Link href={`/region/${region.code}`} className="text-primary font-bold">
                {region.name}
              </Link>
            </p>
            {view === "grid" && <p className="text-xs text-gray-500">Sorted by species count</p>}
            {view === "grid" && <HotspotFilters />}
          </div>
        )}
        <Link
          className="sm:mt-0 mt-2 border py-1 sm:py-2 ml-auto sm:ml-0 px-4 rounded-full text-gray-600 flex items-center gap-2 hover:bg-gray-50/75 transition-all"
          href={
            view === "grid" ? `/region/${region.code}/hotspots?view=map` : `/region/${region.code}/hotspots?view=grid`
          }
        >
          {view === "grid" ? (
            <>
              <MapIcon className="w-5 h-5" /> Map
            </>
          ) : (
            <>
              <Bars3Icon className="w-5 h-5" /> Grid
            </>
          )}
        </Link>
      </div>
      {view === "grid" && (
        <>
          <div className="grid xs:grid-cols-2 md:grid-cols-3 gap-6 min-h-[300px] mt-4">
            <HotspotGrid hotspots={results} loading={loading} />
          </div>
        </>
      )}
      {view === "map" && <ExploreMap mode="region" region={region.code} />}
      {view === "grid" && results.length > 0 && hasMore && (
        <button
          type="button"
          onClick={loadMore}
          className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-full w-[220px] mx-auto block mt-8"
        >
          {loadingMore ? "loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const regionCode = query.region as string;
  const region = getRegion(regionCode);
  if (!region) return { notFound: true };

  return {
    props: {
      region,
    },
  };
};
