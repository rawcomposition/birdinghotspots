import * as React from "react";
import Link from "next/link";
import { getState } from "lib/localData";
import { GetServerSideProps } from "next";
import { City, State } from "lib/types";
import { ParsedUrlQuery } from "querystring";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import AllCities from "data/cities/us.json";

type Props = {
  countrySlug: string;
  state: State;
  cities: City[];
};

//City data sourced from https://simplemaps.com/data/us-cities
//All cities with a population of 10,000 or more

export default function Cities({ state, countrySlug, cities }: Props) {
  const [query, setQuery] = React.useState("");

  const filtered = query ? cities.filter((it) => it.name.toLowerCase().includes(query.toLowerCase())) : cities;

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Cities - ${state.label}, ${state.country}`}</Title>
      <PageHeading countrySlug={countrySlug} state={state}>
        Cities/Towns in {state.label}
      </PageHeading>
      <h3 className="text-lg font-bold mb-1 -mt-8">Cities/Towns in {state.label} Sorted Alphabetically</h3>
      <p className="mb-4">
        We found <strong>{filtered.length}</strong> cities/towns in {state.label} with a population of 10,000 or more.
      </p>

      <div className="mb-6 space-y-3">
        <input
          type="search"
          className="form-input max-w-md"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
        />
      </div>

      <div className="columns-2 sm:columns-5 mb-12">
        <ul>
          {filtered.map(({ name, slug }) => (
            <li key={name}>
              <Link href={`/${countrySlug}/${state.slug}/cities/${slug}`}>{name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface Params extends ParsedUrlQuery {
  countrySlug: string;
  stateSlug: string;
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { countrySlug, stateSlug } = query as Params;
  const state = getState(stateSlug);
  if (!state) return { notFound: true };

  const filteredCities = AllCities.filter((city) => city.state === state.code).map(({ name, slug }) => ({
    name,
    slug,
  }));

  return {
    props: { countrySlug, state, cities: filteredCities },
  };
};
