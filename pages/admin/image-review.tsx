import React from "react";
import Link from "next/link";
import Title from "components/Title";
import DashboardPage from "components/DashboardPage";
import useSecureFetch from "hooks/useSecureFetch";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import Input from "components/Input";
import Select from "components/Select";
import toast from "react-hot-toast";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import { PhotoBatchT } from "lib/types";
import { useForm } from "react-hook-form";
import Form from "components/Form";
import { debounce } from "lib/helpers";
import { useRouter } from "next/router";
import { UserIcon, MapPinIcon } from "@heroicons/react/24/solid";
import XMark from "icons/XMark";
import CheckMark from "icons/CheckMark";
import Tooltip from "components/Tooltip";
import clsx from "clsx";

type Inputs = {
  search: string;
  status: string;
};

export default function ImageReview() {
  const [items, setItems] = React.useState<PhotoBatchT[]>([]);
  const [total, setTotal] = React.useState(0);
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
    search?: string;
    status?: string;
  };

  const get = async ({ skip, loader, search, status }: GetProps) => {
    let toastId: string | undefined;
    if (loader) {
      toastId = toast.loading("loading...");
    }

    const data = await send({
      url: "/api/admin/photo-batches",
      method: "POST",
      data: { skip: skip || 0, search: search || "", status: status || "", region },
    });

    if (data?.results) {
      if (skip) {
        setItems((items) => [...items, ...data.results]);
      } else {
        setItems(data.results);
      }
      setTotal(data.total);
    }

    if (loader) {
      toast.dismiss(toastId);
    }
  };

  const loadMore = () => {
    const data = form.getValues();
    get({ skip: items.length, status: data.status || "", search: data.search || "" });
  };

  React.useEffect(() => {
    get({ loader: true, status: "pending" });
  }, []);

  const handleSearchUpdate = () => {
    const data = form.getValues();
    get({ search: data.search || "", status: data.status || "" });
  };

  const handleStatusUpdate = (value: string) => {
    const search = form.getValues("search") || "";
    get({ search, status: value || "" });
  };

  const handleSearch = debounce(handleSearchUpdate, 500);

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Reviewed", value: "reviewed" },
  ];

  const handleReject = async (id: string, imageId: string) => {
    if (!confirm("Are you sure you want to reject this photo?")) return;
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        images: item.images.map((image) =>
          image._id?.toString() === imageId ? { ...image, status: "rejected" } : image
        ),
      }))
    );
    await send({
      url: `/api/upload/reject?id=${id}`,
      method: "POST",
      data: { imageId },
    });
  };

  const handleApprove = async (id: string, imageId: string, status: string) => {
    if (status === "rejected" && !confirm("Are you sure you want to approve this image? It was previously rejected."))
      return;
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        images: item.images.map((image) =>
          image._id?.toString() === imageId ? { ...image, status: "approved" } : image
        ),
      }))
    );
    await send({
      url: `/api/upload/approve?id=${id}`,
      method: "POST",
      data: { imageId },
    });
  };

  const showLoadMore = status !== "pending" && items.length < total;

  return (
    <DashboardPage title="Suggested Edit Review">
      <div className="container pb-16">
        <Title>Suggested Edit Review</Title>

        <Form form={form} onSubmit={() => null} className="mb-4 grid gap-8 sm:grid-cols-3">
          <Input type="search" name="search" placeholder="Search..." onChange={handleSearch} style={{ marginTop: 0 }} />
          <Select
            onChange={handleStatusUpdate}
            options={statusOptions}
            name="status"
            inline
            instanceId="status"
            className="max-w-[150px]"
          />
        </Form>

        {items.map((item) => (
          <section className="p-4 shadow md:rounded-lg bg-white mb-4" key={item.locationId}>
            <h3 className="text-lg font-bold leading-4 mb-2">
              {item.name}{" "}
              <Link href={`/hotspot/${item.locationId}`} className="font-bold text-sm" target="_blank">
                (View Hotspot)
              </Link>
            </h3>
            <div className="flex flex-col gap-2">
              <p className="text-[13px] text-gray-600 flex items-center gap-2 leading-3">
                <MapPinIcon className="w-3.5 text-gray-400" /> {item.locationName}
              </p>
              <p className="text-[13px] text-gray-600 flex items-center gap-2 leading-3">
                <UserIcon className="w-3.5 text-gray-400" /> {item.by} ({item.email})
              </p>
            </div>
            <div
              className={`grid ${item.images.length > 0 ? "xs:grid-cols-2 md:grid-cols-3" : ""} gap-x-4 gap-y-8 mt-6`}
            >
              <Gallery withCaption>
                {item.images.map(({ width, height, _id, xsUrl, smUrl, lgUrl, caption, status }) => {
                  const isVertical = width && height && height > width;
                  return (
                    <article className="relative flex flex-col gap-2" key={_id}>
                      <Item caption={caption} original={lgUrl || smUrl} width={width} height={height}>
                        {({ ref, open }) => {
                          const imgRef = ref as any;
                          return (
                            <img
                              ref={imgRef}
                              onClick={open}
                              src={xsUrl || smUrl}
                              loading="lazy"
                              className={`cursor-pointer w-full h-[180px] bg-zinc-700 ${
                                isVertical ? "object-contain" : "object-cover"
                              } rounded`}
                            />
                          );
                        }}
                      </Item>
                      {["rejected", "approved"].includes(status) && (
                        <div className="block absolute top-0 left-0 bg-white bg-opacity-90 p-2 text-sm font-bold rounded-br-sm text-gray-700">
                          <Tooltip text={status === "rejected" ? "Rejected" : "Approved"} xSmall>
                            {status === "rejected" ? (
                              <XMark className="text-lg text-red-500" />
                            ) : (
                              <CheckMark className="text-lg text-green-500" />
                            )}
                          </Tooltip>
                        </div>
                      )}
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => handleApprove(item._id as string, _id as string, status)}
                          className={clsx(
                            status === "approved" ? "opacity-30" : "opacity-70 hover:opacity-100",
                            "text-green-700 text-sm font-bold py-0.5 px-4 w-full transition-opacity border border-gray-300 rounded-sm"
                          )}
                          disabled={status === "approved"}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(item._id as string, _id as string)}
                          className={clsx(
                            status !== "pending" ? "opacity-30" : "opacity-70 hover:opacity-100",
                            "text-red-700 text-sm border border-gray-300 font-bold py-0.5 px-4 w-full transition-opacity rounded-sm"
                          )}
                          disabled={status !== "pending"}
                        >
                          Reject
                        </button>
                      </div>
                    </article>
                  );
                })}
              </Gallery>
              {item.images.length === 0 && (
                <p>
                  Consider sorting the images for this hotspot based on quality/relevance.{" "}
                  <Link href={`/hotspot/${item.locationId}`} className="font-bold" target="_blank">
                    View Hotspot
                  </Link>
                </p>
              )}
            </div>
          </section>
        ))}
        {items.length === 0 ? <p className="text-lg text-gray-500">No photos to review</p> : null}
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
    </DashboardPage>
  );
}
export const getServerSideProps = getSecureServerSideProps(async () => ({ props: {} }));
