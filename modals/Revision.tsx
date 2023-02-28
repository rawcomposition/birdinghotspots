import React from "react";
import { useModal, ModalFooter } from "providers/modals";
import BtnSmall from "components/BtnSmall";
import { FormattedSuggestion } from "lib/types";
import dayjs from "dayjs";
import Link from "next/link";
import toast from "react-hot-toast";
import useSecureFetch from "hooks/useSecureFetch";

type Props = {
  data: FormattedSuggestion;
  onApprove: () => void;
  onReject: () => void;
};

export default function Revision({ data, onApprove, onReject }: Props) {
  const { close } = useModal();
  const { send } = useSecureFetch();

  const hideReject =
    !data.tips &&
    !data.birds &&
    !data.about &&
    !data.hikes &&
    !data.restrooms &&
    !data.accessible &&
    !data.fee &&
    !data.roadside;

  const approveLabel = hideReject ? "Acknowledge" : "Approve";

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject?")) return;
    await send({
      url: `/api/revision/reject?id=${id}`,
      method: "GET",
    });
    onReject();
    toast.success("Suggestion rejected");
    close();
  };

  const handleApprove = async (id: string) => {
    if (!hideReject && !confirm("Are you sure you want to accept?")) return;
    await send({
      url: `/api/revision/approve?id=${id}`,
      method: "GET",
    });
    onApprove();
    toast.success(hideReject ? "Note acknowledged" : "Suggestion approved");
    close();
  };

  return (
    <>
      <div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold">
            {data.name}{" "}
            <Link href={`/hotspot/${data.locationId}`} className="font-bold text-sm" target="_blank">
              (View Hotspot)
            </Link>
          </h3>

          {data.tips && (
            <div>
              <h4 className="font-bold">Tips for Birding</h4>
              <div dangerouslySetInnerHTML={{ __html: data.tips.diff }} className="formatted" />
            </div>
          )}

          {data.birds && (
            <div>
              <h4 className="font-bold">Birds of Interest</h4>
              <div dangerouslySetInnerHTML={{ __html: data.birds.diff }} className="formatted" />
            </div>
          )}

          {data.about && (
            <div>
              <h4 className="font-bold">About this location</h4>
              <div dangerouslySetInnerHTML={{ __html: data.about.diff }} className="formatted" />
            </div>
          )}

          {data.hikes && (
            <div>
              <h4 className="font-bold">Notable trails</h4>
              <div dangerouslySetInnerHTML={{ __html: data.hikes.diff }} className="formatted" />
            </div>
          )}

          {data.restrooms && (
            <div>
              <strong>Restrooms on site</strong>: <del>{data.restrooms.old}</del>&nbsp;→&nbsp;
              <ins>{data.restrooms.new}</ins>
            </div>
          )}

          {data.accessible && (
            <div>
              <strong>Wheelchair accessible trail</strong>: <del>{data.accessible.old}</del>
              &nbsp;→&nbsp;
              <ins>{data.accessible.new}</ins>
            </div>
          )}

          {data.fee && (
            <div>
              <strong>Entrance fee</strong>: <del>{data.fee.old}</del>&nbsp;→&nbsp;<ins>{data.fee.new}</ins>
            </div>
          )}

          {data.roadside && (
            <div>
              <strong>Can you bird from the roadside?</strong>: <del>{data.roadside.old}</del>&nbsp;→&nbsp;
              <ins>{data.roadside.new}</ins>
            </div>
          )}
        </div>
        <div className="bg-gray-100 p-4 -mx-4 sm:-mx-6 -mb-5 mt-5">
          {data?.notes && (
            <div className="mb-4">
              <h4 className="font-bold text-lime-600">Notes to the editor</h4>
              {data?.notes}
            </div>
          )}
          <p className="text-xs font-medium">
            Submitted by <strong>{data?.by}</strong> (<a href={`mailto:${data?.email}`}>{data?.email})</a> on{" "}
            {dayjs(data?.createdAt).format("MMM D, YYYY")}
          </p>
        </div>
      </div>
      <ModalFooter>
        <div className="flex gap-2 max-w-xs mr-auto">
          {data.status !== "rejected" && (
            <BtnSmall
              disabled={data.status !== "pending"}
              type="button"
              color="green"
              onClick={() => handleApprove(data._id as string)}
            >
              {data.status === "pending" ? approveLabel : "Approved"}
            </BtnSmall>
          )}
          {data.status !== "approved" && !hideReject && (
            <BtnSmall
              disabled={data.status !== "pending"}
              type="button"
              color="orange"
              onClick={() => handleReject(data._id as string)}
            >
              {data.status === "pending" ? "Reject" : "Rejected"}
            </BtnSmall>
          )}
        </div>
        <BtnSmall type="button" color="gray" onClick={close} className="px-4">
          Close
        </BtnSmall>
      </ModalFooter>
    </>
  );
}
