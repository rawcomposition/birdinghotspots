import { State } from "lib/types";
import { Menu } from "@headlessui/react";
import BarChart from "icons/BarChart";

type Props = {
  portal?: string;
  locationId: string;
  locationIds?: string[];
};

export default function BarChartBtn({ portal, locationId, locationIds }: Props) {
  const region = locationIds?.length ? locationIds.join(",") : locationId;
  const base = portal ? `https://ebird.org/${portal}` : "https://ebird.org";
  return (
    <div className="relative inline-block">
      <Menu>
        <Menu.Button className="text-[13px] rounded-md text-gray-600 bg-gray-100 px-2 inline-block font-medium whitespace-nowrap">
          <BarChart className="mr-2 -mt-[3px] text-amber-700" />
          Bar Charts
        </Menu.Button>
        <Menu.Items className="absolute left-0 top-8 rounded bg-white shadow-lg px-4 py-2 w-[170px] ring-1 ring-black ring-opacity-5 flex flex-col gap-1">
          <Menu.Item>
            <a
              href={`${base}/barchart?yr=all&bmo=1&emo=12&r=${region}`}
              target="_blank"
              rel="noreferrer"
              className="font-bold"
            >
              Entire Year
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={`${base}/barchart?yr=all&bmo=3&emo=5&r=${region}`} target="_blank" rel="noreferrer">
              Spring
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={`${base}/barchart?yr=all&bmo=6&emo=7&r=${region}`} target="_blank" rel="noreferrer">
              Summer
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={`${base}/barchart?yr=all&bmo=8&emo=11&r=${region}`} target="_blank" rel="noreferrer">
              Fall
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={`${base}/barchart?yr=all&bmo=12&emo=2&r=${region}`} target="_blank" rel="noreferrer">
              Winter
            </a>
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </div>
  );
}
