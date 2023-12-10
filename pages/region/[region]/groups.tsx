import React from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import Title from "components/Title";
import { Group, Region } from "lib/types";
import GroupGrid from "components/GroupGrid";
import toast from "react-hot-toast";
import { getRegion } from "lib/localData";

type Props = {
  region: Region;
};

export default function Explore({ region }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<Group[]>([]);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [count, setCount] = React.useState<number | null>(null);

  const fetchGroups = async (reset?: boolean) => {
    const offset = reset ? 0 : results.length;
    try {
      const response = await fetch(`/api/group/by-region?region=${region.code}&offset=${offset}`);
      const json = await response.json();
      if (reset) {
        setResults(json?.results || []);
      } else {
        setResults((prev) => [...prev, ...(json?.results || [])]);
      }
      if (json?.count !== undefined) setCount(json?.count || 0);
    } catch (error) {
      toast.error("Error fetching groups");
    }
  };

  const loadMore = async () => {
    if (loading) return;
    setLoadingMore(true);
    await fetchGroups();
    setLoadingMore(false);
  };

  React.useEffect(() => {
    setLoading(true);
    fetchGroups(true);
    setLoading(false);
  }, []);

  const hasMore = count !== null && results.length < count;

  return (
    <div className="container pb-16 mt-4 max-w-[975px]">
      <Title>{`Groups in ${region.name}`}</Title>
      <div className="mt-8 mb-4 sm:flex justify-between items-center">
        {!loading && (
          <div>
            <p className="text-lg text-gray-500">
              Found <strong className="text-primary">{count?.toLocaleString()}</strong> groups in{" "}
              <Link href={`/region/${region.code}`} className="text-primary font-bold">
                {region.name}
              </Link>
            </p>
            <p className="text-xs text-gray-500">Sorted alphabetically</p>
          </div>
        )}
      </div>

      <div className="grid xs:grid-cols-2 md:grid-cols-3 gap-6 min-h-[300px] mt-4">
        <GroupGrid groups={results} />
      </div>

      {results.length > 0 && hasMore && (
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
