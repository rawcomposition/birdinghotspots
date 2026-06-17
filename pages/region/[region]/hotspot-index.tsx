import React from "react";
import Link from "next/link";
import { getRegionHotspotIndex } from "lib/sqlite";
import { getRegion } from "lib/localData";
import { GetServerSideProps } from "next";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { Region } from "lib/types";
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

export default function AlphabeticalIndex({ region, hotspots }: Props) {
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 250);

  const filtered = debouncedQuery
    ? hotspots.filter((it) => it.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
    : hotspots;

  let activeLetters = filtered.map((hotspot) => hotspot.name.charAt(0).toUpperCase());
  activeLetters = [...new Set(activeLetters)];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
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
      {filtered.map(({ name, url, noContent }, i, array) => {
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

  const hotspots = getRegionHotspotIndex(regionCode) || [];

  return {
    props: { region, hotspots },
  };
};
