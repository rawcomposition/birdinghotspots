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

interface Item extends Revision {
  name: string;
  stateLabel?: string;
  countyLabel?: string;
  approved?: boolean;
  restroomsBefore?: string;
  accessibleBefore?: string;
  feeBefore?: string;
  roadsideBefore?: string;
}

type Props = {
  items: Item[];
};

export default function RevisionReview({ items: allItems }: Props) {
  const [items, setItems] = React.useState(allItems);
  const secureFetch = useSecureFetch();

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this suggestion?")) return;
    setItems((prev) => prev.filter((item) => item._id !== id));
    toast.success("Suggestion rejected");
    await secureFetch(`/api/revision/reject?id=${id}`, "GET");
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure? Existing text will be replaced with the suggested text.")) return;
    setItems((prev) => prev.map((item) => (item._id === id ? { ...item, approved: true } : item)));
    toast.success("Suggestion approved");
    await secureFetch(`/api/revision/approve?id=${id}`, "GET");
  };

  return (
    <DashboardPage title="Suggested Edit Review">
      <div className="container pb-16">
        <Title>Suggested Edit Review</Title>
        {items.map((item) => (
          <section
            className={`p-4 overflow-hidden shadow md:rounded-lg bg-white mb-4 ${
              item.approved ? "border-2 border-lime-600" : ""
            }`}
            key={item.locationId}
          >
            <p className="text-sm text-gray-500">
              {item.countyLabel}, {item.stateLabel}, {item.countryCode}
            </p>
            <h3 className="text-lg font-bold">
              {item.name}{" "}
              <Link href={`/hotspot/${item.locationId}`}>
                <a className="font-bold text-sm" target="_blank">
                  (View Hotspot)
                </a>
              </Link>
            </h3>

            <div className="mt-4 space-y-4">
              {!item.approved && (
                <>
                  <div>
                    <h4 className="font-bold">Tips for Birding</h4>
                    <div dangerouslySetInnerHTML={{ __html: item.tips || "(no content)" }} className="formatted" />
                  </div>

                  <div>
                    <h4 className="font-bold">Birds of Interest</h4>
                    <div dangerouslySetInnerHTML={{ __html: item.birds || "(no content)" }} className="formatted" />
                  </div>
                  <div>
                    <h4 className="font-bold">About this location</h4>
                    <div dangerouslySetInnerHTML={{ __html: item.about || "(no content)" }} className="formatted" />
                  </div>
                  <div>
                    <h4 className="font-bold">Notable trails</h4>
                    <div dangerouslySetInnerHTML={{ __html: item.hikes || "(no content)" }} className="formatted" />
                  </div>
                </>
              )}
              {!item.approved && item.restroomsBefore !== item.restrooms && (
                <div>
                  <strong>Restrooms on site</strong>: <del>{item.restroomsBefore}</del>&nbsp;→&nbsp;
                  <ins>{item.restrooms}</ins>
                </div>
              )}
              {!item.approved && item.accessibleBefore !== item.accessible && (
                <div>
                  <strong>Accessible parking and trails</strong>: <del>{item.accessibleBefore}</del>&nbsp;→&nbsp;
                  <ins>{item.accessible}</ins>
                </div>
              )}
              {!item.approved && item.feeBefore !== item.fee && (
                <div>
                  <strong>Entrance fee</strong>: <del>{item.feeBefore}</del>&nbsp;→&nbsp;<ins>{item.fee}</ins>
                </div>
              )}
              {!item.approved && item.roadsideBefore !== item.roadside && (
                <div>
                  <strong>Can you bird from the roadside?</strong>: <del>{item.roadsideBefore}</del>&nbsp;→&nbsp;
                  <ins>{item.roadside}</ins>
                </div>
              )}
              {item.notes && (
                <div>
                  <h4 className="font-bold text-lime-600">Notes to the editor</h4>
                  {item.notes}
                </div>
              )}
              <p className="text-xs font-medium">
                By <strong>{item.by}</strong> ({item.email}) on {dayjs(item.createdAt).format("MMM D, YYYY")}
              </p>
            </div>
            {!item.approved && (
              <div className="flex gap-4 mt-4 max-w-xs">
                <button
                  type="button"
                  onClick={() => handleApprove(item._id as string)}
                  className="text-green-700 text-sm opacity-60 hover:opacity-100 font-bold py-0.5 px-4 w-full transition-opacity border border-gray-300 rounded-sm"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(item._id as string)}
                  className="text-red-700 text-sm opacity-60 hover:opacity-100 border border-gray-300 font-bold py-0.5 px-4 w-full transition-opacity rounded-sm"
                >
                  Reject
                </button>
              </div>
            )}
          </section>
        ))}
        {items.length === 0 ? <p className="text-lg text-gray-500">No suggestions to review</p> : null}
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
    if (states?.length === 0) {
      states = token.regions;
    }
    revisions = await getRevisions(states, counties);
  }

  const formattedRevisions = await Promise.all(
    revisions.map(async (revision: Revision) => {
      const hotspot = await getHotspotByLocationId(revision.locationId);
      const state = getStateByCode(hotspot?.stateCode);
      const county = getCountyByCode(hotspot.countyCode);
      return {
        ...revision,
        stateLabel: state?.label || "",
        countyLabel: county?.name || "",
        countryCode: hotspot.countryCode,
        name: hotspot.name,
        about: diff(hotspot.about || "", revision.about || ""),
        tips: diff(hotspot.tips || "", revision.tips || ""),
        birds: diff(hotspot.birds || "", revision.birds || ""),
        hikes: diff(hotspot.hikes || "", revision.hikes || ""),
        restroomsBefore: hotspot.restrooms || "",
        accessibleBefore: hotspot.accessible || "",
        roadsideBefore: hotspot.roadside || "",
        feeBefore: hotspot.fee || "",
        restrooms: revision.restrooms || "",
        accessible: revision.accessible || "",
        roadside: revision.roadside || "",
        fee: revision.fee || "",
      };
    })
  );

  return {
    props: { items: formattedRevisions },
  };
});
