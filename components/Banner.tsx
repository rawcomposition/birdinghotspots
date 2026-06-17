import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Banner() {
  return (
    <div className="bg-puffin w-full min-h-[250px] md:min-h-[350px]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl mb-6 mt-8 font-medium text-gray-600">
          Discover tips, descriptions, maps, and images
          <br />
          for thousands of eBird hotspots
        </h1>
        <div className="md:max-w-lg">
          <div className="relative">
            <input
              type="text"
              disabled
              placeholder="Find a region or hotspot..."
              aria-label="Search (disabled)"
              className="w-full rounded-full border border-[#efefef] bg-white py-3 pl-4 pr-12 text-[18px] text-[#555] shadow-[0_4px_6px_-1px_rgba(0,0,0,.1),0_2px_4px_-2px_rgba(0,0,0,.1)] placeholder:text-gray-400 cursor-not-allowed"
            />
            <MagnifyingGlassIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
}
