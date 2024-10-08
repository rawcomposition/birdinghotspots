import { truncate } from "lib/helpers";
import { CameraIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { NotableReport } from "lib/types";
import dayjs from "dayjs";

type Props = {
  items: NotableReport[];
};

export default function NotableObservationList({ items }: Props) {
  return (
    <ul className="pl-1 pr-4 pb-4 flex flex-col gap-5 mt-2">
      {items?.map(
        ({ id, location, checklistId, userDisplayName, lat, lng, hasRichMedia, countyName, date, approved }) => (
          <li key={id + userDisplayName} className="rounded-sm bg-white">
            <div className="flex items-start">
              <h4 className="text-slate-900 text-[0.92em] font-medium mr-auto">
                {truncate(location, 64)}, {countyName}
              </h4>
            </div>

            <p className="text-gray-500 text-[0.85em] leading-5 font-medium">
              {dayjs(date).format("MMM D [at] h:mm a ")} by {userDisplayName}
              {hasRichMedia && (
                <span title="Has photo or audio">
                  <CameraIcon className="ml-1.5 w-4 h-4 inline text-lime-600" />
                </span>
              )}
              {approved && (
                <span title="Approved by a reviewer">
                  <CheckCircleIcon className="ml-1.5 w-4 h-4 inline text-lime-600" />
                </span>
              )}
            </p>
            <div className="text-[0.85em] mt-1.5 space-x-3 font-medium">
              <a
                href={`https://ebird.org/checklist/${checklistId}`}
                className="text-sky-800"
                target="_blank"
                rel="noreferrer"
              >
                View Checklist
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                className="text-sky-800"
                target="_blank"
                rel="noreferrer"
              >
                Directions
              </a>
            </div>
          </li>
        )
      )}
    </ul>
  );
}
