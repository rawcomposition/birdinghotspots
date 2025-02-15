import { Menu } from "@headlessui/react";
import EbirdLogo from "components/EbirdLogo";

type Props = {
  isGroup?: boolean;
  locationId: string;
  locationIds?: string[];
};

export default function EbirdHotspotBtn({ locationId, locationIds, isGroup }: Props) {
  const region = locationIds?.length ? locationIds.join(",") : locationId;
  return (
    <div className="relative inline-block">
      <Menu>
        <Menu.Button className="text-[13px] rounded text-gray-600 bg-gray-100 px-2 inline-flex items-center gap-1 font-medium whitespace-nowrap">
          <EbirdLogo className="w-8" />
          <span className="w-0 overflow-hidden sm:w-auto"> Links</span>
        </Menu.Button>
        <Menu.Items className="absolute sm:left-0 right-0 sm:right-[unset] top-8 rounded bg-white shadow-lg px-4 py-2 w-[170px] ring-1 ring-black ring-opacity-5 flex flex-col gap-1">
          <Menu.Item>
            <h4 className="font-bold">Explore in eBird</h4>
          </Menu.Item>
          {!isGroup && (
            <Menu.Item>
              <a
                href={`https://ebird.org/hotspot/${locationId}/illustrated-checklist`}
                target="_blank"
                rel="noreferrer"
              >
                Illustrated Checklist
              </a>
            </Menu.Item>
          )}
          {!isGroup && (
            <Menu.Item>
              <a
                href={`https://media.ebird.org/catalog?regionCode=${locationId}&mediaType=photo&sort=rating_rank_desc`}
                target="_blank"
                rel="noreferrer"
              >
                Photos
              </a>
            </Menu.Item>
          )}
          {!isGroup && (
            <Menu.Item>
              <a href={`https://ebird.org/hotspot/${locationId}/recent-checklists`} target="_blank" rel="noreferrer">
                Recent Visits
              </a>
            </Menu.Item>
          )}
          {!isGroup && (
            <Menu.Item>
              <a href={`https://ebird.org/hotspots?hs=${locationId}&yr=all&m=`} target="_blank" rel="noreferrer">
                Hotspot Map
              </a>
            </Menu.Item>
          )}
          <Menu.Item>
            <h4 className="font-bold">Bar Charts</h4>
          </Menu.Item>
          <Menu.Item>
            <a href={`https://ebird.org/barchart?yr=all&bmo=1&emo=12&r=${region}`} target="_blank" rel="noreferrer">
              Entire Year
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={`https://ebird.org/barchart?yr=all&bmo=3&emo=5&r=${region}`} target="_blank" rel="noreferrer">
              Spring
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={`https://ebird.org/barchart?yr=all&bmo=6&emo=7&r=${region}`} target="_blank" rel="noreferrer">
              Summer
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={`https://ebird.org/barchart?yr=all&bmo=8&emo=11&r=${region}`} target="_blank" rel="noreferrer">
              Fall
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={`https://ebird.org/barchart?yr=all&bmo=12&emo=2&r=${region}`} target="_blank" rel="noreferrer">
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
              <a
                href={`https://ebird.org/MyEBird?cmd=list&rtype=loc&r=${locationId}&time=life`}
                target="_blank"
                rel="noreferrer"
              >
                Location Life List
              </a>
            </Menu.Item>
          )}
          {!isGroup && (
            <Menu.Item>
              <a href={`https://ebird.org/submit/effort?locID=${locationId}&clr=1`} target="_blank" rel="noreferrer">
                Submit Data
              </a>
            </Menu.Item>
          )}
        </Menu.Items>
      </Menu>
    </div>
  );
}
