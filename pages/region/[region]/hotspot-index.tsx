import React from "react";
import Link from "next/link";
import { getHotspotsByRegion } from "lib/mongo";
import { getRegion } from "lib/localData";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { Region } from "lib/types";
import { useUser } from "providers/user";
import { useDebounce } from "hooks/useDebounce";

type Props = {
  region: Region;
  hotspots: {
    name: string;
    url: string;
    noContent?: boolean;
    needsDeleting?: boolean;
  }[];
};

const filters = ["All", "Needs Content", "Needs Deleting"];

export default function AlphabeticalIndex({ region, hotspots }: Props) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<number>(0);
  const debouncedQuery = useDebounce(query, 250);
  const debouncedFilter = useDebounce(filter, 10);

  let filtered = debouncedQuery
    ? hotspots.filter((it) => it.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
    : hotspots;

  if (debouncedFilter === 1) {
    filtered = filtered.filter((it) => it.noContent);
  } else if (debouncedFilter === 2) {
    filtered = filtered.filter((it) => it.needsDeleting);
  }

  let activeLetters = filtered.map((hotspot) => hotspot.name.charAt(0).toUpperCase());
  activeLetters = [...new Set(activeLetters)];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const { user } = useUser();
  return (
    <div className="container pb-16 mt-12">
      <Title>{`Alphabetical Hotspot Index - ${region.detailedName}`}</Title>
      <PageHeading region={region}>Alphabetical Hotspot Index</PageHeading>

      <div className="mb-6 space-y-3">
        <input
          type="search"
          className="form-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
        />
        {user &&
          filters.map((it, i) => (
            <button
              key={it}
              type="button"
              className={`border rounded-full px-3 font-medium leading-5 text-[12px] mr-2 ${
                filter === i ? "bg-gray-500 border-gray-500 text-white" : ""
              }`}
              onClick={() => setFilter(i)}
            >
              {it}
            </button>
          ))}
      </div>

      <p>
        {alphabet.map((letter) => {
          if (activeLetters.includes(letter)) {
            return (
              <Link key={letter} href={`#${letter}`} className="inline-block mr-3 text-lg">
                {letter.toUpperCase()}
              </Link>
            );
          }
          return (
            <span className="inline-block mr-3 text-gray-300 text-lg" key={letter}>
              {letter}
            </span>
          );
        })}
      </p>
      {filtered.map(({ name, url, noContent, needsDeleting }, i, array) => {
        const prev = i === 0 ? null : array[i - 1];
        const isNumber = !isNaN(parseInt(name.charAt(0)));
        const showLetter = prev ? name.charAt(0) !== prev.name.charAt(0) && !isNumber : true;
        return (
          <React.Fragment key={url}>
            {showLetter && (
              <h2 id={name[0]} className="font-bold mt-4 mb-2">
                {isNumber ? "" : name[0].toUpperCase()}
              </h2>
            )}
            <Link href={url} className={noContent ? "" : "font-bold"}>
              {name}
            </Link>
            {needsDeleting && user && (
              <span className={`bg-red-600 rounded-full text-xs px-2 text-white font-bold ml-2`}>
                Removed from eBird
              </span>
            )}
            <br />
          </React.Fragment>
        );
      })}
      <p className="mt-4">
        {filtered.length !== hotspots.length ? (
          <span>
            Showing <strong>{filtered?.length?.toLocaleString()}</strong> of{" "}
            <strong>{hotspots?.length?.toLocaleString()}</strong>
          </span>
        ) : (
          <span>
            Total: <strong>{filtered?.length?.toLocaleString()}</strong>
          </span>
        )}
      </p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const regionCode = query.region as string;
  const region = getRegion(regionCode);
  if (!region) return { notFound: true };

  const hotspots = (await getHotspotsByRegion(regionCode)) || [];

  const formatted = hotspots.map((it: any) => ({
    ...it,
    noContent: (it.noContent && !it.groupIds?.length) || false,
  }));

  return {
    props: { region, hotspots: formatted },
  };
};
