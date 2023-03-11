import * as React from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import Title from "components/Title";
import { Hotspot } from "lib/types";
import HotspotGrid from "components/HotspotGrid";
import { MapIcon, Bars3Icon } from "@heroicons/react/24/outline";
import ExploreMap from "components/ExploreMap";
import toast from "react-hot-toast";
import { getStateByCode, getCountyByCode } from "lib/localData";

type Props = {
  region: string;
  name: string;
  url: string;
  view: "grid" | "map";
  filter: string;
};

const filters = [
  { name: "All", value: "all" },
  { name: "With Images", value: "with-images" },
  { name: "Without Images", value: "without-images" },
  { name: "With Content", value: "with-content" },
  { name: "Without Content", value: "without-content" },
];

export default function Explore({ region, name, url, view, filter }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<Hotspot[]>([]);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [count, setCount] = React.useState<number | null>(null);

  const fetchHotspots = async (reset?: boolean) => {
    const offset = reset ? 0 : results.length;
    try {
      const response = await fetch(`/api/hotspot/by-region?region=${region}&offset=${offset}&filter=${filter}`);
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
  }, [filter]);

  const hasMore = count !== null && results.length < count;

  return (
    <div className={view === "grid" ? "container pb-16 mt-4 max-w-[975px]" : "flex flex-col h-full"}>
      <Title>{`Hotspots in ${name}`}</Title>
      <div
        className={`mt-8 mb-4 sm:flex justify-between items-center ${
          view === "map" ? "container my-2 max-w-[975px]" : ""
        }`}
      >
        {!loading && (
          <div>
            <p className="text-lg text-gray-500">
              Found <strong className="text-[#4a84b2]">{count}</strong> hotspots in{" "}
              <Link href={url} className="text-[#4a84b2] font-bold">
                {name}
              </Link>
              {filter && filter !== "all" && <> {filters.find((it) => it.value === filter)?.name.toLowerCase()}</>}
            </p>
            {view === "grid" && <p className="text-xs text-gray-500">Sorted by species count</p>}
            {view === "grid" && (
              <div className="flex gap-2 mt-6 flex-wrap">
                {filters.map(({ name, value }) => (
                  <Link
                    href={`/region/${region}?view=${view}&filter=${value}`}
                    key={value}
                    className={`border rounded-full px-3 font-medium leading-5 text-[12px] whitespace-nowrap ${
                      filter === value ? "bg-gray-500 border-gray-500 text-white" : "text-gray-800"
                    }`}
                  >
                    {name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        <Link
          className="sm:mt-0 mt-2 border py-1 sm:py-2 ml-auto sm:ml-0 px-4 rounded-full text-gray-600 flex items-center gap-2 hover:bg-gray-50/75 transition-all"
          href={view === "grid" ? `/region/${region}?view=map` : `/region/${region}?view=grid`}
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
      {view === "map" && <ExploreMap mode="region" region={region} />}
      {view === "grid" && results.length > 0 && hasMore && (
        <button
          type="button"
          onClick={loadMore}
          className="bg-[#4a84b2] hover:bg-[#325a79] text-white font-bold py-2 px-4 rounded-full w-[220px] mx-auto block mt-8"
        >
          {loadingMore ? "loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const regionCode = query.region as string;
  const filter = (query.filter as string) || "all";
  const view = (query.view as string) || "grid";
  const isCounty = regionCode.split("-").length === 3;

  const state = getStateByCode(regionCode.slice(0, 5));
  const county = isCounty ? getCountyByCode(regionCode) : null;

  if (!state && !county) return { notFound: true };

  const country = regionCode.split("-")[0];
  const countrySlug = country.toLowerCase();

  const url = isCounty ? `/${countrySlug}/${state?.slug}/${county?.slug}-county` : `/${countrySlug}/${state?.slug}`;
  const name = isCounty ? `${county?.longName}, ${country}` : `${state?.label}, ${country}`;

  return {
    props: {
      region: regionCode,
      name,
      isCounty,
      view,
      url,
      filter,
    },
  };
};
