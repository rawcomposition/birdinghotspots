import React from "react";
import Link from "next/link";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { getHotspotsInRadius, getCityByLocationId } from "lib/mongo";
import { getRegion } from "lib/localData";
import PageHeading from "components/PageHeading";
import { Region, Hotspot, City as CityType, Marker } from "lib/types";
import Title from "components/Title";
import MapBox from "components/MapBox";
import HotspotGrid from "components/HotspotGrid";
import MapIconAlt from "icons/Map";
import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import useLogPageview from "hooks/useLogPageview";
import { isbot } from "isbot";

type Props = {
  region: Region;
  city: CityType;
  stateCode?: string;
  countryCode?: string;
  hotspots: Hotspot[];
  isBot: boolean;
};

export default function City({ region, city, hotspots, stateCode, countryCode, isBot }: Props) {
  const [expand, setExpand] = React.useState<boolean>(false);
  const { name, locationId } = city;
  useLogPageview({ locationId, stateCode, countryCode, entity: "city", isBot });

  const markers = hotspots?.map(({ lat, lng, name, url, species }) => ({ lat, lng, url, name, species })) || [];
  const visibleHotspots = expand ? hotspots : hotspots.slice(0, 12);

  return (
    <div className="container pb-16">
      <Title>{`Where to Go Birding in ${name}, ${region.name}`}</Title>
      <Head>
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_DOMAIN}/social-banner.jpg`} />
      </Head>
      <PageHeading region={region} extraCrumb={{ label: "Cities/Towns", href: `/region/${region.code}/cities` }}>
        {name}
      </PageHeading>
      <section className="lg:flex justify-between items-start mb-4 -mt-8">
        <div>
          <h3 className="text-lg mb-1 font-bold">Where to Go Birding in {name}</h3>
          <p className="mb-2 text-base">
            Plan to go birding in {name}? Below are some of the best eBird hotspots in the area.
          </p>
        </div>
        <div className="my-4 lg:my-0">
          <Link
            href={`/explore?lat=${city.lat}&lng=${city.lng}&view=map&label=${city.name}`}
            className="bg-primary hover:bg-secondary text-white font-bold py-1.5 text-sm px-4 rounded-full inline-flex items-center"
          >
            <MapIconAlt className="inline-block text-xl mr-3" />
            Explore Hotspot Map
            <ArrowLongRightIcon className="inline-block w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>
      <section>
        {markers.length > 0 && !isBot && (
          <MapBox key={locationId} markers={markers as Marker[]} zoom={8} landscape disableScroll />
        )}
      </section>
      <p className="mb-16 text-[13px] mt-2 text-gray-600">
        Showing <strong>{hotspots.length}</strong> hotspots within a 5 mile radius of city center.
      </p>
      <section className="mb-16">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold" id="tophotspots">
            Top eBird Hotspots
          </h3>
          <Link
            href={`/explore?lat=${city.lat}&lng=${city.lng}&view=grid&label=${city.name}`}
            className="font-bold text-sm"
          >
            View All
          </Link>
        </div>
        <div className="grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <HotspotGrid hotspots={visibleHotspots} loading={false} />
          {hotspots.length === 0 && <p className="text-gray-500 text-lg">No hotspots found.</p>}
        </div>
        {!expand && hotspots.length > 12 && (
          <button
            type="button"
            className="bg-primary hover:bg-secondary text-white font-bold py-1.5 text-sm px-4 rounded-full w-[140px] mx-auto block mt-4 text-center"
            onClick={() => setExpand(true)}
          >
            View More
          </button>
        )}
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const locationId = context.params?.locationId as string;

  const city = await getCityByLocationId(locationId);
  if (!city) return { notFound: true };

  const region = getRegion(city.stateCode || city.countryCode);

  if (!region) return { notFound: true };

  const hotspots = (await getHotspotsInRadius(city.lat, city.lng, 5)) || [];

  const formatted = hotspots.map((it: any) => ({
    ...it,
    noContent: (it.noContent && !it.groupIds?.length) || false,
  }));

  const isBot = isbot(context.req.headers["user-agent"] || "");

  return {
    props: { region, city, stateCode: city.stateCode, countryCode: city.countryCode, hotspots: formatted, isBot },
  };
};
