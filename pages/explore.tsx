import * as React from "react";
import { GetServerSideProps } from "next";
import Title from "components/Title";
import { Hotspot, LocationSearchValue } from "lib/types";
import LocationSearch from "components/LocationSearch";
import { useRouter } from "next/router";
import HotspotGrid from "components/HotspotGrid";
import { MapIcon, Bars3Icon } from "@heroicons/react/24/outline";
import ExploreMap from "components/ExploreMap";
import toast from "react-hot-toast";
import HotspotFilters from "components/HotspotFilters";
import Link from "next/link";

type Props = {
  params: any;
};

export default function Explore({ params }: Props) {
  const router = useRouter();
  const [results, setResults] = React.useState<Hotspot[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<boolean>(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [location, setLocation] = React.useState<LocationSearchValue | null>(() => {
    if (typeof window === "undefined") return null;
    const lat = params.lat as string;
    const lng = params.lng as string;
    const label = params.label as string;
    if (lat && lng) {
      return { lat, lng, label };
    }
    const json = localStorage.getItem("location") || "";
    const location = json ? JSON.parse(json) : null;
    if (location?.lat && location?.lng) {
      return location;
    }
    return null;
  });

  const view = router.query.view || "grid";
  const { images, content, features } = router.query;

  const { lat, lng, label } = location || {};

  const loadMore = async () => {
    if (loading) return;
    setLoadingMore(true);
    try {
      const response = await fetch(
        `/api/hotspot/nearby?lat=${lat}&lng=${lng}&offset=${
          results.length || 0
        }&images=${images}&content=${content}&features=${features}`
      );
      const json = await response.json();
      setResults((prev) => [...prev, ...(json?.results || [])]);
    } catch (error) {
      toast.error("Error fetching hotspots");
    }
    setLoadingMore(false);
  };

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/hotspot/nearby?lat=${lat}&lng=${lng}&images=${images}&content=${content}&features=${features}`
        );
        const json = await response.json();
        setResults(json?.results || []);
      } catch (error) {
        setError(true);
      }
      setLoading(false);
    };
    if (lat && lng) fetchData();
  }, [lat, lng, images, content, features]);

  React.useEffect(() => {
    if (!lat || !lng || !label) return;
    localStorage.setItem("location", JSON.stringify({ lat, lng, label }));
    router.replace({ query: { ...router.query, lat, lng, label } });
  }, [lat, lng, label]);

  return (
    <div className={view === "grid" ? "container pb-16 mt-8 max-w-[975px]" : "flex flex-col h-full"}>
      <Title>Explore</Title>
      <div
        className={`sm:flex justify-between items-center ${view === "map" ? "container my-2 max-w-[975px]" : "mb-6"}`}
      >
        <div className="relative w-full sm:w-[500px] flex">
          <span className="bg-lime-600/90 py-2 pl-5 pr-4 text-sm rounded-l-full text-white font-bold shadow border-gray-200 border border-r-0 flex gap-1 items-center">
            Location
          </span>
          <LocationSearch
            value={location}
            onChange={setLocation}
            className="w-full border-gray-200 focus:border-gray-200 block text-base outline-none rounded-r-full px-6 py-2 shadow focus:ring-0"
          />
        </div>
        <Link
          className="sm:mt-0 mt-2 border py-1 sm:py-2 ml-auto sm:ml-0 px-4 rounded-full text-gray-600 flex items-center gap-2 hover:bg-gray-50/75 transition-all"
          href={{ query: { lat, lng, label, view: view === "grid" ? "map" : "grid" } }}
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
      {view === "grid" && <HotspotFilters />}
      {view === "grid" && (
        <div className="grid xs:grid-cols-2 md:grid-cols-3 gap-6 min-h-[300px] mt-4">
          <HotspotGrid hotspots={results} loading={loading} lat={lat} lng={lng} />
        </div>
      )}
      {view === "map" && (
        <ExploreMap
          key={`${location?.lat || "x"}_${location?.lng || "x"}`}
          mode="nearby"
          lat={location?.lat}
          lng={location?.lng}
        />
      )}
      {error && <p className="text-center text-lg text-red-700 my-4">Error loading hotspots</p>}
      {view === "grid" && results.length > 0 && (
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
  return { props: { params: query } };
};
