import { State } from "lib/types";
import { Menu } from "@headlessui/react";
import VerticalDots from "icons/VerticalDots";

type Props = {
  portal?: string;
  isGroup?: boolean;
  locationId: string;
  locationIds?: string[];
};

export default function EbirdHotspotBtn({ portal, locationId, locationIds, isGroup }: Props) {
  const region = locationIds?.length ? locationIds.join(",") : locationId;
  const base = portal ? `https://ebird.org/${portal}` : "https://ebird.org";
  return (
    <div className="relative inline-block">
      <Menu>
        <Menu.Button className="text-[13px] rounded-md text-gray-600 bg-gray-100 px-1.5 py-[6px] inline-flex items-center">
          <VerticalDots />
        </Menu.Button>
        <Menu.Items className="absolute right-0 top-8 rounded bg-white shadow-lg px-4 py-2 w-[170px] ring-1 ring-black ring-opacity-5 flex flex-col gap-1">
          <Menu.Item>
            <h4 className="font-bold">Explore in eBird</h4>
          </Menu.Item>
          {!isGroup && (
            <Menu.Item>
              <a href={`${base}/hotspot/${locationId}/activity?yr=all&m=`} target="_blank" rel="noreferrer">
                Recent Visits
              </a>
            </Menu.Item>
          )}
          {!isGroup && (
            <Menu.Item>
              <a href={`${base}/hotspots?hs=${locationId}&yr=all&m=`} target="_blank" rel="noreferrer">
                Hotspot Map
              </a>
            </Menu.Item>
          )}
          <Menu.Item>
            <h4 className="font-bold">Bar Charts</h4>
          </Menu.Item>
          <Menu.Item>
            <a href={`${base}/barchart?yr=all&bmo=1&emo=12&r=${region}`} target="_blank" rel="noreferrer">
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
          {!isGroup && (
            <Menu.Item>
              <h4 className="font-bold">My eBird</h4>
            </Menu.Item>
          )}
          {!isGroup && (
            <Menu.Item>
              <a href={`${base}/MyEBird?cmd=list&rtype=loc&r=${locationId}&time=life`} target="_blank" rel="noreferrer">
                Location Life List
              </a>
            </Menu.Item>
          )}
          {!isGroup && (
            <Menu.Item>
              <a href={`${base}/submit/effort?locID=${locationId}&clr=1`} target="_blank" rel="noreferrer">
                Submit Data
              </a>
            </Menu.Item>
          )}
        </Menu.Items>
      </Menu>
    </div>
  );
}
