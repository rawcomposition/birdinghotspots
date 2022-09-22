import { Menu } from "@headlessui/react";
import { scrollToAnchor } from "lib/helpers";
import { MapPinIcon } from "@heroicons/react/24/solid";

type Props = {
  showIba: boolean;
};

export default function EbirdCountyBtn({ showIba }: Props) {
  return (
    <div className="relative inline-block">
      <Menu>
        <Menu.Button className="text-[13px] rounded-md text-gray-600 bg-gray-100 px-2 inline-flex items-center gap-1 font-medium">
          <MapPinIcon className="w-4 h-4 text-[#c2410d]" />
          Find Hotspots
        </Menu.Button>
        <Menu.Items className="absolute left-0 top-8 rounded bg-white shadow-lg px-4 py-2 w-[170px] ring-1 ring-black ring-opacity-5 flex flex-col gap-1 z-10">
          <Menu.Item>
            <a href="#hotspots" onClick={scrollToAnchor}>
              All eBird Hotspots
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href="#tophotspots" onClick={scrollToAnchor}>
              Top eBird Hotspots
            </a>
          </Menu.Item>
          {showIba && (
            <Menu.Item>
              <a href="#iba" onClick={scrollToAnchor}>
                Important Bird Areas
              </a>
            </Menu.Item>
          )}
          <Menu.Item>
            <a href="#notable" onClick={scrollToAnchor}>
              Notable Sightings
            </a>
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </div>
  );
}
