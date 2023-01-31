import * as React from "react";
import Link from "next/link";
import { getRevisions, getAllRevisions, getHotspotByLocationId, getSubscriptions } from "lib/mongo";
import { getStateByCode, getCountyByCode } from "lib/localData";
import Title from "components/Title";
import DashboardPage from "components/DashboardPage";
import { Revision } from "lib/types";
import useSecureFetch from "hooks/useSecureFetch";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import diff from "node-htmldiff";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import Button from "components/Button";
import { FormattedSuggestion } from "lib/types";
import { useModal } from "providers/modals";

type Props = {
  items: FormattedSuggestion[];
};

export default function RevisionReview({ items: allItems }: Props) {
  const [items, setItems] = React.useState<FormattedSuggestion[]>(allItems);
  const { open } = useModal();

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

  return (
    <DashboardPage title="Suggested Edit Review">
      <div className="container pb-16">
        <Title>Suggested Edit Review</Title>

        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Hotspot
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  User
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
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
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div>
                      <div className="font-bold">
                        <Link href={`/hotspot/${item.locationId}`}>
                          <a target="_blank">{item.name}</a>
                        </Link>
                      </div>
                      <div className="text-gray-500">
                        {item.countyLabel}, {item.stateLabel}, {item.countryCode}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="text-gray-900">{item.by}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {dayjs(item.createdAt).format("MMM D, YYYY")}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
                        open("revision", { data: item, onApprove: handleApproved, onReject: handleRejected })
                      }
                    >
                      {item.status === "pending" ? "Review" : "View"}
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500 text-base">
                    No suggestions to review
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardPage>
  );
}
export const getServerSideProps = getSecureServerSideProps(async (context, token) => {
  const subscriptions = await getSubscriptions(token.uid);
  let revisions: Revision[] = [];

  if (token.role === "admin" && subscriptions.length === 0) {
    revisions = await getAllRevisions();
  } else {
    let states = subscriptions.filter((it) => it.split("-").length === 2);
    const counties = subscriptions.filter((it) => it.split("-").length === 3);
    if (subscriptions.length === 0) {
      states = token.regions;
    }
    revisions = await getRevisions(states, counties);
  }

  const formatDiff = (oldValue?: string, newValue?: string) => {
    if (!newValue) return null; //No edit made for this field
    if (!oldValue) return newValue; //Legacy revision with no old value saved
    return {
      old: oldValue,
      new: newValue,
      diff: diff(oldValue, newValue),
    };
  };

  const formattedRevisions = revisions.map((it: Revision) => {
    const state = getStateByCode(it?.stateCode);
    const county = getCountyByCode(it.countyCode);
    const formatted = {
      ...it,
      stateLabel: state?.label || "",
      countyLabel: county?.name || "",
      countryCode: it.countryCode,
      about: formatDiff(it.about?.old, it.about?.new),
      tips: formatDiff(it.tips?.old, it.tips?.new),
      birds: formatDiff(it.birds?.old, it.birds?.new),
      hikes: formatDiff(it.hikes?.old, it.hikes?.new),
      roadside: formatDiff(it.roadside?.old, it.roadside?.new),
      accessible: formatDiff(it.accessible?.old, it.accessible?.new),
      restrooms: formatDiff(it.restrooms?.old, it.restrooms?.new),
      fee: formatDiff(it.fee?.old, it.fee?.new),
    };
    return formatted;
  });
  console.log(formattedRevisions);

  return {
    props: { items: formattedRevisions },
  };
});
