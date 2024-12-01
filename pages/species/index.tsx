/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { ImgSourceLabel, LicenseLabel, SpeciesT } from "lib/types";
import Species from "models/Species";
import AdminPage from "components/AdminPage";
import { getSourceImgUrl } from "lib/species";
import clsx from "clsx";
import connect from "lib/mongo";
import XMark from "icons/XMark";
import Families from "data/taxon-families.json";
import SelectBasic from "components/ReactSelectStyled";
import { useRouter } from "next/router";

const PER_PAGE = 200;

type Props = {
  species: SpeciesT[];
  currentPage: number;
  totalPages: number;
  percentWithImg: string;
  percentCropped: string;
  totalCount: number;
  filteredCount: number;
  withoutImgCount: number;
  filter: string;
  family: string;
  startCount: number;
};

export default function SpeciesList({
  species,
  currentPage,
  totalPages,
  percentWithImg,
  percentCropped,
  totalCount,
  filteredCount,
  withoutImgCount,
  filter,
  family,
  startCount,
}: Props) {
  const router = useRouter();
  const selectedFamily = Families.find((f) => f.code === family);

  return (
    <AdminPage title="Species List">
      <div className="container py-8 mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Species List</h1>
        <div className="flex items-center gap-4 mb-8">
          <p className="font-medium text-sm">
            Images: <span className="font-bold">{percentWithImg}%</span>
          </p>
          <p className="font-medium text-sm">
            Cropped: <span className="font-bold">{percentCropped}%</span>
          </p>
        </div>
        <div className="flex gap-4 mb-6 items-center">
          <Link
            href={`/species?page=1&filter=all&family=${family}`}
            className={clsx(
              "px-5 py-1 rounded-full font-medium",
              !filter || filter === "all" ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
            )}
          >
            All ({totalCount.toLocaleString()})
          </Link>
          <Link
            href={`/species?page=1&filter=withoutImg&family=${family}`}
            className={clsx(
              "px-5 py-1 rounded-full font-medium",
              filter === "withoutImg" ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
            )}
          >
            Without Image ({withoutImgCount.toLocaleString()})
          </Link>
        </div>
        <SelectBasic
          options={Families.map((family) => ({ label: `${family.name} (${family.count})`, value: family.code }))}
          onChange={(selectedOption) => {
            if (selectedOption) {
              router.push(`/species?page=1&filter=${filter}&family=${selectedOption.value}`);
            } else {
              router.push(`/species?page=1&filter=${filter}`);
            }
          }}
          value={
            selectedFamily
              ? { label: `${selectedFamily.name} (${selectedFamily.count})`, value: selectedFamily.code }
              : undefined
          }
          placeholder="Filter by family"
          className="w-[260px]"
          isClearable
        />
        <p className="mb-4 font-medium mt-6">
          Filtered count: <strong>{filteredCount.toLocaleString()}</strong>
        </p>
        <div className="flex flex-col gap-4">
          {species.map((species, index) => (
            <div key={species._id} className="flex items-center gap-4 bg-gray-100/80 p-4 rounded-md">
              <Link href={`/species/${species._id}/edit`} target="_blank" className="flex-shrink-0">
                {species.hasImg && (species.downloadedAt || !species.crop) ? (
                  <div className="relative">
                    <img
                      src={
                        species.hasImg && species.downloadedAt
                          ? `/species-images/${species._id}-240.jpg`
                          : getSourceImgUrl({
                              source: species.source,
                              sourceId: species.sourceId,
                              size: species.source === "ebird" ? 320 : 240,
                              ext: species.iNatFileExt,
                            }) || ""
                      }
                      alt={species.name}
                      loading="lazy"
                      className="aspect-[4/3] object-cover w-[100px] rounded-md"
                    />
                    {!species.crop && (
                      <div className="absolute top-0 left-0 bg-white/50 w-5 h-5 flex justify-center items-center rounded-br">
                        <XMark className="text-red-500" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[4/3] flex items-center text-gray-500 text-sm justify-center w-[100px] rounded-md bg-gray-200">
                    {!species.hasImg ? "No Image" : "Pending"}
                  </div>
                )}
              </Link>
              <div>
                <h2 className="text-lg font-bold mb-2">
                  <span className="font-medium text-gray-500 text-[17px]">{index + 1 + startCount}.</span>{" "}
                  {species.name}
                </h2>
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
                    {species.hasImg ? "Edit Image" : "Add Image"}
                  </Link>
                  {!species.crop && (
                    <>
                      <Link
                        className="text-sky-600 hover:text-sky-700 font-semibold"
                        href={`https://www.google.com/search?q=${species.name}`}
                        target="_blank"
                      >
                        Google
                      </Link>
                      <Link
                        className="text-sky-600 hover:text-sky-700 font-semibold"
                        href={`https://ebird.org/species/${species._id}`}
                        target="_blank"
                      >
                        eBird
                      </Link>
                      <button
                        type="button"
                        className="text-sky-600 hover:text-sky-700 font-semibold"
                        onClick={() => {
                          open(`/species/${species._id}/edit`, "_blank");
                          open(
                            `https://www.inaturalist.org/observations?q=${species.sciName}&photo_license=cc0,cc-by-nc-sa,cc-by-sa,cc-by-nc,cc-by`,
                            "_blank"
                          );
                          open(
                            `https://www.inaturalist.org/observations?q=${species.sciName}&photo_license=cc0,cc-by-nc-sa,cc-by-sa,cc-by-nc,cc-by&order_by=votes`,
                            "_blank"
                          );
                          open(`https://www.inaturalist.org/taxa/${species.sciName}`, "_blank");
                        }}
                      >
                        iNat CC
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          {currentPage > 1 && (
            <Link
              href={`/species?page=${currentPage - 1}&filter=${filter}&family=${family}`}
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
              href={`/species?page=${currentPage + 1}&filter=${filter}&family=${family}`}
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
  const family = context.query.family || "all";

  let query: any = { active: true };
  if (filter === "withoutImg") {
    query = { hasImg: { $ne: true } };
  }
  if (filter === "withoutCrop") {
    query = { crop: { $exists: false } };
  }
  if (family !== "all") {
    query.familyCode = family;
  }

  await connect();
  const totalCount = await Species.countDocuments({});
  const filteredCount = await Species.countDocuments(query);
  const withImgCount = await Species.countDocuments({ hasImg: true });
  const croppedCount = await Species.countDocuments({ crop: { $exists: true } });
  const totalPages = Math.ceil(filteredCount / limit);
  const percentWithImg = ((withImgCount / totalCount) * 100).toFixed(1);
  const percentCropped = ((croppedCount / withImgCount) * 100).toFixed(1);
  const startCount = (page - 1) * limit;

  const speciesRes = await Species.find(query, [
    "_id",
    "name",
    "source",
    "sourceId",
    "hasImg",
    "sciName",
    "iNatFileExt",
    "downloadedAt",
    "crop",
    "license",
    "author",
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
      percentWithImg,
      percentCropped,
      totalCount,
      filteredCount,
      withoutImgCount: totalCount - withImgCount,
      filter,
      family,
      startCount,
    },
  };
};
