import * as React from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { Species as SpeciesT } from "lib/types";
import Species from "models/Species";

type Props = {
  species: SpeciesT[];
};

export default function SpeciesList({ species }: Props) {
  return (
    <div className="container pb-16 mt-12">
      <Title>Species List</Title>
      <PageHeading breadcrumbs={false}>Species List</PageHeading>
      <ul>
        {species.map(({ _id, name }) => (
          <li key={_id}>
            <Link href={`/species/${_id}`}>{name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const speciesRes = await Species.find({}, ["_id", "name"]).sort({ order: 1 });
  const species = JSON.parse(JSON.stringify(speciesRes));
  return {
    props: { species },
  };
};
