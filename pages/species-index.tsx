import React from "react";
import Link from "next/link";
import { getAllSpecies } from "lib/mongo";
import { GetServerSideProps } from "next";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { useDebounce } from "hooks/useDebounce";

type Props = {
  species: {
    name: string;
    sciName: string;
    code: string;
    hasImg: boolean;
    active: boolean;
  }[];
};

const filters = ["All", "Needs Image", "Has Image", "Inactive"];

export default function SpeciesIndex({ species }: Props) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<number>(0);
  const debouncedQuery = useDebounce(query, 250);
  const debouncedFilter = useDebounce(filter, 10);

  let filtered = debouncedQuery
    ? species.filter(
        (it) =>
          it.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          it.sciName.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : species;

  if (debouncedFilter === 1) {
    filtered = filtered.filter((it) => !it.hasImg);
  } else if (debouncedFilter === 2) {
    filtered = filtered.filter((it) => it.hasImg);
  } else if (debouncedFilter === 3) {
    filtered = filtered.filter((it) => !it.active);
  }
  return (
    <div className="container pb-16 mt-12">
      <Title>Species Index</Title>
      <PageHeading className="mb-8">Species Index</PageHeading>

      <div className="mb-6 space-y-3">
        <input
          type="search"
          className="form-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
        />
        {filters.map((it, i) => (
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

      <div className="mb-4">
        <strong className="text-gray-600">With images: </strong> {species.filter((it) => it.hasImg).length}{" "}
        <span className="text-gray-500">
          ({((species.filter((it) => it.hasImg).length / species.length) * 100).toFixed(1)}%)
        </span>
      </div>

      {filtered.map(({ code, name, sciName, active, hasImg }) => {
        return (
          <React.Fragment key={code}>
            <Link href={`https://ebird.org/species/${code}`} className={hasImg ? "font-bold" : ""} target="_blank">
              {name}
            </Link>
            <span className="text-gray-400 ml-4 italic">{sciName}</span>
            {!active && (
              <span className={`bg-amber-600 rounded-full text-xs px-2 text-white font-bold ml-2`}>Inactive</span>
            )}
            <br />
          </React.Fragment>
        );
      })}
      <p className="mt-4">
        {filtered.length !== species.length ? (
          <span>
            Showing <strong>{filtered?.length?.toLocaleString()}</strong> of{" "}
            <strong>{species?.length?.toLocaleString()}</strong>
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
  const species = await getAllSpecies();

  const formatted = species.map(({ _id, images, ...it }) => ({
    ...it,
    code: _id,
    hasImg: !!images?.length,
  }));

  return {
    props: { species: formatted },
  };
};
