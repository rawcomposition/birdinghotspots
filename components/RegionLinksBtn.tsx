import { Menu } from "@headlessui/react";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { Region } from "lib/types";
import Link from "next/link";

type Props = {
  region: Region;
};

export default function RegionLinksBtn({ region }: Props) {
  const { code, features } = region;
  const isState = code.split("-").length === 2;
  return (
    <div className="relative inline-block">
      <Menu>
        <Menu.Button className="text-[13px] rounded-md text-gray-600 bg-gray-100 px-2 inline-flex items-center gap-1 font-medium">
          <MapPinIcon className="w-4 h-4 text-[#c2410d]" />
          Find Hotspots
        </Menu.Button>
        <Menu.Items className="absolute left-0 top-8 rounded bg-white shadow-lg px-4 py-2 w-[170px] ring-1 ring-black ring-opacity-5 flex flex-col gap-1 z-10">
          <Menu.Item>
            <Link href={`/region/${code}/hotspots?view=map`}>Hotspot Map</Link>
          </Menu.Item>
          <Menu.Item>
            <Menu.Item>
              <Link href={`/region/${code}/hotspots`}>Top Hotspots</Link>
            </Menu.Item>
          </Menu.Item>
          {region.code !== "US" && (
            <Menu.Item>
              <Link href={`/region/${code}/hotspot-index`}>List of All Hotspots</Link>
            </Menu.Item>
          )}
          {features?.includes("drives") && isState && (
            <Menu.Item>
              <Link href={`/region/${code}/drives`}>Birding Drives</Link>
            </Menu.Item>
          )}
          <Menu.Item>
            <Link href={`/region/${code}/hotspots?features=Roadside`}>Roadside Birding</Link>
          </Menu.Item>
          <Menu.Item>
            <Link href={`/region/${code}/hotspots?features=Accessible`}>Accessible Facilities</Link>
          </Menu.Item>
          {features?.includes("iba") && (
            <Menu.Item>
              <Link href={`/region/${code}/important-bird-areas`}>Important Bird Areas</Link>
            </Menu.Item>
          )}
          <Menu.Item>
            <Link href={`/region/${code}/group-index`}>Group Locations</Link>
          </Menu.Item>
          {isState && (
            <Menu.Item>
              <Link href={`/region/${code}/cities`}>Cities/Towns</Link>
            </Menu.Item>
          )}
        </Menu.Items>
      </Menu>
    </div>
  );
}
