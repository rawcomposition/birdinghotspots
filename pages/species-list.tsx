/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import Title from "components/Title";
import { SpeciesT } from "lib/types";
import Species from "models/Species";
import AdminPage from "components/AdminPage";
import { getSourceUrl } from "lib/species";

type Props = {
  species: SpeciesT[];
  currentPage: number;
  totalPages: number;
};

export default function SpeciesList({ species, currentPage, totalPages }: Props) {
  return (
    <AdminPage title="Species List">
      <div className="container py-8 mx-auto max-w-3xl">
        <Title>Species List</Title>
        <h1 className="text-2xl font-bold mb-8">Species List</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {species.map((species) => (
            <Link
              key={species._id}
              className="border p-4 rounded-md flex items-center justify-center text-gray-600"
              href={`https://ebird.org/species/${species._id}`}
              target="_blank"
            >
              {species.hasImg ? (
                <img
                  src={getSourceUrl(species, 320)}
                  alt={species.name}
                  className="aspect-square object-cover w-full"
                />
              ) : (
                "No Image"
              )}
            </Link>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          {currentPage > 1 && (
            <Link
              href={`/species-list?page=${currentPage - 1}`}
              className="mx-2 px-4 py-2 bg-primary hover:bg-secondary text-white rounded"
            >
              Previous
            </Link>
          )}
          <span className="mx-2 px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/species-list?page=${currentPage + 1}`}
              className="mx-2 px-4 py-2 bg-primary hover:bg-secondary text-white rounded"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </AdminPage>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const page = Number(context.query.page) || 1;
  const limit = 100;
  const skip = (page - 1) * limit;

  const totalCount = await Species.countDocuments();
  const totalPages = Math.ceil(totalCount / limit);

  const speciesRes = await Species.find({}, ["_id", "name", "source", "sourceId", "hasImg"])
    .sort({ order: 1 })
    .skip(skip)
    .limit(limit);

  const species = JSON.parse(JSON.stringify(speciesRes));

  return {
    props: {
      species,
      currentPage: page,
      totalPages,
    },
  };
};
