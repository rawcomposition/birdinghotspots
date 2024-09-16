/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { SpeciesT } from "lib/types";
import Species from "models/Species";
import AdminPage from "components/AdminPage";
import { getSourceUrl } from "lib/species";

type Props = {
  species: SpeciesT[];
  currentPage: number;
  totalPages: number;
  percent: string;
};

export default function SpeciesList({ species, currentPage, totalPages, percent }: Props) {
  return (
    <AdminPage title="Species List">
      <div className="container py-8 mx-auto max-w-3xl">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-4">Species List</h1>
          <Link href="/species/import" className="mx-2 px-4 py-1.5 bg-primary hover:bg-secondary text-white rounded">
            Import
          </Link>
        </div>
        <p className="mb-8 font-medium text-[17px]">
          Coverage: <span className="font-bold">{percent}%</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {species.map((species) => (
            <Link
              key={species._id}
              className="border p-4 rounded-md flex items-center justify-center text-gray-600"
              href={`/species/${species._id}/import`}
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
  const limit = 100;
  const skip = (page - 1) * limit;

  const totalCount = await Species.countDocuments();
  const withImgCount = await Species.countDocuments({ hasImg: true });
  const totalPages = Math.ceil(totalCount / limit);
  const percent = ((withImgCount / totalCount) * 100).toFixed(1);

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
      percent,
    },
  };
};
