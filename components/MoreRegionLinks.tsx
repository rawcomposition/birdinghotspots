import { Menu } from "@headlessui/react";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { Region } from "lib/types";
import Link from "next/link";

type Props = {
  region: Region;
};

export default function MoreRegionLinks({ region }: Props) {
  const { code, features } = region;
  const isState = code.split("-").length === 2;
  const isCountry = code.split("-").length === 1;
  const hasCities = ["US", "CA"].includes(code.split("-")[0]) && (isState || isCountry);
  return (
    <div className="mt-8 md:mt-16">
      <h3 className="text-lg mb-2 font-bold">More ways to explore</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 text-[16px] gap-y-2 max-w-2xl gap-x-16">
        {features?.includes("drives") && isState && <Link href={`/region/${code}/drives`}>Birding Drives</Link>}
        <Link href={`/region/${code}/hotspots?features=Roadside`}>Roadside Birding</Link>
        <Link href={`/region/${code}/hotspots?features=Accessible`}>Accessible Facilities</Link>
        {features?.includes("iba") && <Link href={`/region/${code}/important-bird-areas`}>Important Bird Areas</Link>}
        <Link href={`/region/${code}/group-index`}>Group Locations</Link>
        {hasCities && <Link href={`/region/${code}/cities`}>Cities/Towns</Link>}
      </div>
    </div>
  );
}
