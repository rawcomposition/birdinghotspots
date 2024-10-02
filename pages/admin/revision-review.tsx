import React from "react";
import Link from "next/link";
import Title from "components/Title";
import DashboardPage from "components/DashboardPage";
import useSecureFetch from "hooks/useSecureFetch";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import Input from "components/Input";
import Select from "components/Select";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import Button from "components/Button";
import { FormattedSuggestion } from "lib/types";
import { useModal } from "providers/modals";
import { useForm } from "react-hook-form";
import Form from "components/Form";
import { debounce } from "lib/helpers";
import Badge from "components/Badge";
import { useRouter } from "next/router";

type Inputs = {
  search: string;
  status: string;
};

export default function RevisionReview() {
  const [items, setItems] = React.useState<FormattedSuggestion[]>([]);
  const [total, setTotal] = React.useState(0);
  const { open } = useModal();
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
      url: "/api/admin/revisions",
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

  const statusColors = {
    pending: "bg-amber-100/80 text-amber-800/80",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  const handleApproved = async (id: string) => {
    setItems((items) => items.map((item) => (item._id === id ? { ...item, status: "approved" } : item)));
  };

  const handleRejected = async (id: string) => {
    setItems((items) => items.map((item) => (item._id === id ? { ...item, status: "rejected" } : item)));
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
            instanceId="status"
            className="max-w-[150px]"
          />
        </Form>

        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Hotspot
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell"
                >
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Review</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div>
                      <div className="font-bold">
                        <Link href={`/hotspot/${item.locationId}`} target="_blank">
                          {item.name}
                        </Link>
                        {item.hasMultiple && (
                          <Badge color="amber" tooltip="Multiple suggestions for this hotspot.">
                            Multiple
                          </Badge>
                        )}
                      </div>
                      <div className="text-gray-500">{item.locationName}</div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 hidden sm:table-cell">
                    <div className="text-gray-900">{item.by}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden sm:table-cell">
                    {dayjs(item.createdAt).format("MMM D, YYYY")}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden sm:table-cell">
                    <span
                      className={`inline-flex rounded-full ${
                        statusColors[item.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
                      } px-2 text-xs font-semibold leading-5 capitalize`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Button
                      color="gray"
                      onClick={() =>
                        open("revision", {
                          data: item,
                          onApprove: () => handleApproved(item._id || ""),
                          onReject: () => handleRejected(item._id || ""),
                        })
                      }
                    >
                      {item.status === "pending" ? "Review" : "View"}
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500 text-base">
                    No suggestions to review
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
