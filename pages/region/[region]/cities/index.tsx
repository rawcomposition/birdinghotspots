import * as React from "react";
import Link from "next/link";
import { getRegion, getCities } from "lib/localData";
import { GetServerSideProps } from "next";
import { City, Region } from "lib/types";
import PageHeading from "components/PageHeading";
import Title from "components/Title";

type Props = {
  region: Region;
  cities: City[];
};

//City data sourced from https://simplemaps.com/data/us-cities
//All cities with a population of 10,000 or more

export default function Cities({ region, cities }: Props) {
  const [query, setQuery] = React.useState("");

  const filtered = query ? cities.filter((it) => it.name.toLowerCase().includes(query.toLowerCase())) : cities;

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Cities - ${region.detailedName}`}</Title>
      <PageHeading region={region}>Cities/Towns in {region.name}</PageHeading>
      <h3 className="text-lg font-bold mb-1 -mt-8">Cities/Towns in {region.name} Sorted Alphabetically</h3>
      <p className="mb-4">
        We found <strong>{filtered.length}</strong> cities/towns in {region.name} with a population of 10,000 or more.
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
              <Link href={`/region/${region.code}/cities/${slug}`}>{name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const regionCode = query.region as string;
  const region = getRegion(regionCode);
  const isState = regionCode.split("-").length === 2;
  if (!region || !isState) return { notFound: true };

  const cities = getCities(region.code).sort((a, b) => a.name.localeCompare(b.name));

  return {
    props: { region, cities },
  };
};
