/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { SpeciesT } from "lib/types";
import Species from "models/Species";
import AdminPage from "components/AdminPage";
import connect from "lib/mongo";

const PER_PAGE = 500;

type Props = {
  species: SpeciesT[];
  currentPage: number;
  totalPages: number;
};

export default function SpeciesList({ species, currentPage, totalPages }: Props) {
  return (
    <AdminPage title="Species List">
      <div className="container py-8 mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Species Thumbnail Preview</h1>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {species.map((species) => (
            <img
              key={species._id}
              src={`/species-images/${species._id}-240.jpg`}
              alt={species.name}
              className="aspect-[4/3] object-cover w-[120px] rounded-md"
            />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          {currentPage > 1 && (
            <Link
              href={`/species?page=${currentPage - 1}`}
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
              href={`/species?page=${currentPage + 1}`}
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
  const limit = PER_PAGE;
  const skip = (page - 1) * limit;

  const query = { downloadedAt: { $exists: true } };
  await connect();
  const filteredCount = await Species.countDocuments(query);
  const totalPages = Math.ceil(filteredCount / limit);

  const speciesRes = await Species.find(query, ["_id"]).sort({ order: 1 }).skip(skip).limit(limit);

  const species = JSON.parse(JSON.stringify(speciesRes));

  return {
    props: {
      species,
      currentPage: page,
      totalPages,
    },
  };
};
