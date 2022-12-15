import { Menu } from "@headlessui/react";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { State } from "lib/types";
import Link from "next/link";

type Props = {
  state: State;
};

export default function StateLinksBtn({ state }: Props) {
  const { slug, country, features } = state || ({} as State);
  const countrySlug = country.toLowerCase();
  return (
    <div className="relative inline-block">
      <Menu>
        <Menu.Button className="text-[13px] rounded-md text-gray-600 bg-gray-100 px-2 inline-flex items-center gap-1 font-medium">
          <MapPinIcon className="w-4 h-4 text-[#c2410d]" />
          Find Hotspots
        </Menu.Button>
        <Menu.Items className="absolute left-0 top-8 rounded bg-white shadow-lg px-4 py-2 w-[170px] ring-1 ring-black ring-opacity-5 flex flex-col gap-1 z-10">
          <Menu.Item>
            <Link href={`/explore?mode=region&region=${state.code}&label=${state.label}&view=map`}>Hotspot Map</Link>
          </Menu.Item>
          <Menu.Item>
            <Menu.Item>
              <Link href={`/explore?mode=region&region=${state.code}&label=${state.label}`}>Top Hotspots</Link>
            </Menu.Item>
          </Menu.Item>
          <Menu.Item>
            <Link href={`/${countrySlug}/${slug}/alphabetical-index`}>List of All Hotspots</Link>
          </Menu.Item>
          {features?.includes("drives") && (
            <Menu.Item>
              <Link href={`/${countrySlug}/${slug}/drives`}>Birding Drives</Link>
            </Menu.Item>
          )}
          <Menu.Item>
            <Link href={`/${countrySlug}/${slug}/roadside-birding`}>Roadside Birding</Link>
          </Menu.Item>
          <Menu.Item>
            <Link href={`/${countrySlug}/${slug}/accessible-facilities`}>Accessible Facilities</Link>
          </Menu.Item>
          {features?.includes("iba") && (
            <Menu.Item>
              <Link href={`/${countrySlug}/${slug}/important-bird-areas`}>Important Bird Areas</Link>
            </Menu.Item>
          )}
        </Menu.Items>
      </Menu>
    </div>
  );
}
