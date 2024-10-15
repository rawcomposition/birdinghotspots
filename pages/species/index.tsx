/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { ImgSourceLabel, LicenseLabel, SpeciesT } from "lib/types";
import Species from "models/Species";
import AdminPage from "components/AdminPage";
import { getSourceUrl } from "lib/species";
import clsx from "clsx";
import connect from "lib/mongo";

const PER_PAGE = 200;

type Props = {
  species: SpeciesT[];
  currentPage: number;
  totalPages: number;
  percent: string;
  totalCount: number;
  withoutImgCount: number;
  filter: string;
};

export default function SpeciesList({
  species,
  currentPage,
  totalPages,
  percent,
  totalCount,
  withoutImgCount,
  filter,
}: Props) {
  return (
    <AdminPage title="Species List">
      <div className="container py-8 mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Species List</h1>
        <p className="mb-8 font-medium text-[17px]">
          Coverage: <span className="font-bold">{percent}%</span>
        </p>
        <div className="flex gap-4 mb-4">
          <Link
            href={`/species?page=1&filter=all`}
            className={clsx(
              "px-5 py-1 rounded-full font-medium",
              !filter || filter === "all" ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
            )}
          >
            All ({totalCount.toLocaleString()})
          </Link>
          <Link
            href={`/species?page=1&filter=withoutImg`}
            className={clsx(
              "px-5 py-1 rounded-full font-medium",
              filter === "withoutImg" ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
            )}
          >
            Without Image ({withoutImgCount.toLocaleString()})
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          {species.map((species) => (
            <div key={species._id} className="flex items-center gap-4 bg-gray-100/80 p-4 rounded-md">
              <Link href={`/species/${species._id}/edit`} target="_blank">
                {species.hasImg && (species.downloadedAt || species.source === "wikipedia") ? (
                  <img
                    src={
                      getSourceUrl({
                        source: species.source,
                        sourceId: species.sourceId,
                        size: species.source === "ebird" ? 320 : 240,
                        ext: species.iNatFileExt,
                      }) || ""
                    }
                    alt={species.name}
                    className="aspect-[4/3] object-cover w-[120px] rounded-md"
                  />
                ) : (
                  <div className="aspect-[4/3] flex items-center text-gray-500 text-sm justify-center w-[120px] rounded-md bg-gray-200">
                    {!species.hasImg ? "No Image" : "Pending"}
                  </div>
                )}
              </Link>
              <div>
                <h2 className="text-lg font-bold mb-2">{species.name}</h2>
                <div className="flex gap-4 text-[13px] text-gray-500">
                  <span>
                    Source: <strong>{ImgSourceLabel[species.source] || "Unknown"}</strong>
                  </span>
                  <span>
                    Author: <strong>{species.author || "None"}</strong>
                  </span>
                  <span>
                    License: <strong>{LicenseLabel[species.license] || "Unknown"}</strong>
                  </span>
                </div>
                <div className="flex gap-4">
                  <Link
                    className="text-sky-600 hover:text-sky-700 font-semibold"
                    href={`/species/${species._id}/edit`}
                    target="_blank"
                  >
                    {species.hasImg ? "Replace Image" : "Add Image"}
                  </Link>
                  <Link
                    className="text-sky-600 hover:text-sky-700 font-semibold"
                    href={`https://www.google.com/search?q=${species.name}`}
                    target="_blank"
                  >
                    Google
                  </Link>
                  <button
                    type="button"
                    className="text-sky-600 hover:text-sky-700 font-semibold"
                    onClick={() => {
                      open(`/species/${species._id}/edit`, "_blank");
                      open(
                        `https://www.inaturalist.org/observations?q=${species.sciName}&photo_license=cc-by-nc,cc-by`,
                        "_blank"
                      );
                      open(`https://www.inaturalist.org/observations?q=${species.sciName}&photo_license=cc0`, "_blank");
                    }}
                  >
                    iNat CC
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          {currentPage > 1 && (
            <Link
              href={`/species?page=${currentPage - 1}&filter=${filter}`}
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
              href={`/species?page=${currentPage + 1}&filter=${filter}`}
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
  const filter = context.query.filter || "all";

  const query = filter === "withoutImg" ? { hasImg: { $ne: true } } : {};

  await connect();
  const totalCount = await Species.countDocuments({});
  const filteredCount = await Species.countDocuments(query);
  const withImgCount = await Species.countDocuments({ ...query, hasImg: true });
  const totalPages = Math.ceil(filteredCount / limit);
  const percent = ((withImgCount / totalCount) * 100).toFixed(1);

  const speciesRes = await Species.find(query, [
    "_id",
    "name",
    "source",
    "sourceId",
    "hasImg",
    "sciName",
    "iNatFileExt",
  ])
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
      totalCount,
      withoutImgCount: totalCount - withImgCount,
      filter,
    },
  };
};
