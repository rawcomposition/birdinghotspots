import React from "react";
import Link from "next/link";
import Title from "components/Title";
import DashboardPage from "components/DashboardPage";
import useSecureFetch from "hooks/useSecureFetch";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import Select from "components/Select";
import toast from "react-hot-toast";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import { Hotspot, Image } from "lib/types";
import { useForm } from "react-hook-form";
import Form from "components/Form";
import { useRouter } from "next/router";
import { MapPinIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import { getFileUrl } from "lib/s3";
import ImageCaptureDate from "components/ImageCaptureDate";
import PageHeading from "components/PageHeading";
import dynamic from "next/dynamic";
import CopyIcon from "icons/CopyIcon";
import Tooltip from "components/Tooltip";
const MigrationBanner = dynamic(() => import("components/MigrationBanner"), { ssr: false });

type Inputs = {
  search: string;
  status: string;
};

type HotspotResult = Hotspot & {
  locationName: string;
  images: Image[];
};

export default function MigrationAssistant() {
  const [hotspots, setHotspots] = React.useState<HotspotResult[]>([]);
  const [total, setTotal] = React.useState(0);
  const [imageTotal, setImageTotal] = React.useState(0);
  const { send, loading } = useSecureFetch();
  const router = useRouter();
  const region = router.query.region as string;

  const form = useForm<Inputs>({
    defaultValues: {
      status: "pending",
    },
  });

  const status = form.watch("status");

  type GetProps = {
    skip?: number;
    loader?: boolean;
    status?: string;
  };

  const get = async ({ skip, loader, status }: GetProps) => {
    let toastId: string | undefined;
    if (loader) {
      toastId = toast.loading("loading...");
    }

    const data = await send({
      url: "/api/my-pending-images",
      method: "POST",
      data: { skip: skip || 0, status: status || "", region },
    });

    if (data?.results) {
      if (skip) {
        setHotspots((hotspots) => [...hotspots, ...data.results]);
      } else {
        setHotspots(data.results);
      }
      setTotal(data.total);
      setImageTotal(data.imageTotal);
    }

    if (loader) {
      toast.dismiss(toastId);
    }
  };

  const loadMore = () => {
    const data = form.getValues();
    get({ skip: hotspots.length, status: data.status || "" });
  };

  React.useEffect(() => {
    get({ loader: true, status: "pending" });
  }, []);

  const handleStatusUpdate = (value: string) => {
    setHotspots([]);
    setTotal(0);
    setImageTotal(0);
    get({ status: value || "" });
  };

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Uploaded", value: "migrated" },
  ];

  const handleMigrate = async (locationId: string, imageId: string) => {
    setHotspots((prev) =>
      prev.map((hotspot) => ({
        ...hotspot,
        images: hotspot.images.map((image) =>
          image._id?.toString() === imageId ? { ...image, isMigrated: true } : image
        ),
      }))
    );
    await send({
      url: "/api/image/migrate",
      method: "POST",
      data: { imageId, locationId },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Caption copied to clipboard");
  };

  const showLoadMore = hotspots.length < total;

  return (
    <div className="container pb-16 mt-12 max-w-[900px]">
      <Title>Migration Assistant</Title>
      <PageHeading>Migration Assistant</PageHeading>

      <MigrationBanner />

      <div className="flex sm:justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">My Images</h2>
          <p className="text-gray-600 mb-3">
            Found <strong>{imageTotal}</strong> {imageTotal === 1 ? "image" : "images"} across <strong>{total}</strong>{" "}
            {total === 1 ? "hotspot" : "hotspots"} {status === "pending" ? "to migrate" : "already migrated"}
          </p>
        </div>
        <Form form={form} onSubmit={() => null}>
          <Select
            onChange={handleStatusUpdate}
            options={statusOptions}
            name="status"
            inline
            instanceId="status"
            className="max-w-[150px]"
          />
        </Form>
      </div>

      <div className="divide-y space-y-8">
        {hotspots.map((hotspot) => (
          <section className="pt-8" key={hotspot.locationId}>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold leading-4">{hotspot.name}</h3>
              <span className="bg-gray-500 w-[5px] h-[5px] rounded-full" />
              <Link href={`/hotspot/${hotspot.locationId}`} className="font-bold text-sm" target="_blank">
                Details
              </Link>
              <span className="bg-gray-500 w-[5px] h-[5px] rounded-full" />
              <Link
                href={`https://ebird.org/mychecklists/${hotspot.locationId}`}
                className="font-bold text-sm"
                target="_blank"
              >
                My Checklists
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[13px] text-gray-600 flex items-center gap-2 leading-3">
                <MapPinIcon className="w-3.5 text-gray-400" /> {hotspot.locationName}
              </p>
            </div>
            <div
              className={`grid ${
                hotspot.images.length > 0 ? "xs:grid-cols-2 md:grid-cols-3" : ""
              } gap-x-4 gap-y-8 mt-6`}
            >
              <Gallery withCaption>
                {hotspot.images.map(({ _id, width, height, xsUrl, smUrl, lgUrl, caption, isMigrated }) => {
                  const isVertical = width && height && height > width;
                  return (
                    <article className="relative flex flex-col gap-2" key={_id}>
                      <Item caption={caption} original={getFileUrl(lgUrl || smUrl)} width={width} height={height}>
                        {({ ref, open }) => {
                          const imgRef = ref as any;
                          return (
                            <img
                              ref={imgRef}
                              onClick={open}
                              src={getFileUrl(xsUrl || smUrl)}
                              loading="lazy"
                              className={`cursor-pointer w-full aspect-[3/2] bg-zinc-700 ${
                                isVertical ? "object-contain" : "object-cover"
                              } rounded`}
                            />
                          );
                        }}
                      </Item>
                      {caption && (
                        <div className="flex justify-between items-center bg-slate-100 rounded-md pl-2.5">
                          <p className="text-sm text-gray-700 truncate max-w-[87%]">{caption}</p>
                          <Tooltip text="Copy caption" small>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(caption)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-slate-300/80 rounded-lg transition-colors"
                            >
                              <CopyIcon className=" text-gray-500" />
                            </button>
                          </Tooltip>
                        </div>
                      )}
                      <div className="flex gap-4 items-center justify-between">
                        <span className="text-sm text-gray-700 font-medium flex flex-col leading-[18px]">
                          <span className="text-gray-500 text-[11px] uppercase">Captured</span>
                          <ImageCaptureDate imgUrl={smUrl} />
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMigrate(hotspot.locationId, _id as string)}
                          className={clsx(
                            isMigrated ? "opacity-30" : "opacity-70 hover:opacity-100",
                            "text-gray-700 text-sm font-bold py-1 px-2 flex-grow-0 transition-opacity border border-gray-300 rounded flex items-center gap-2"
                          )}
                          disabled={isMigrated}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                            checked={isMigrated}
                          />
                          Uploaded
                        </button>
                      </div>
                    </article>
                  );
                })}
              </Gallery>
            </div>
          </section>
        ))}
      </div>
      {hotspots.length === 0 && !loading ? <p className="text-lg text-gray-500 mt-6">No results found</p> : null}
      {loading ? <p className="text-lg text-gray-500 mt-6">Loading...</p> : null}
      {showLoadMore && (
        <button
          type="button"
          onClick={loadMore}
          className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-full w-[220px] mx-auto block mt-8"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
export const getServerSideProps = getSecureServerSideProps(async () => ({ props: {} }));
