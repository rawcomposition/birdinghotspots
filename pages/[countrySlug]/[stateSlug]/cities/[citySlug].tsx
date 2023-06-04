import React from "react";
import Link from "next/link";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { getHotspotsInRadius } from "lib/mongo";
import { getState, getCityBySlug } from "lib/localData";
import PageHeading from "components/PageHeading";
import { State, Hotspot, City as CityType, Marker } from "lib/types";
import Title from "components/Title";
import MapBox from "components/MapBox";
import HotspotGrid from "components/HotspotGrid";
import MapIconAlt from "icons/Map";
import { ArrowLongRightIcon } from "@heroicons/react/24/solid";

type Props = {
  countrySlug: string;
  state: State;
  city: CityType;
  hotspots: Hotspot[];
};

export default function County({ countrySlug, state, city, hotspots }: Props) {
  const [expand, setExpand] = React.useState<boolean>(false);
  const { name, slug } = city;

  const markers = hotspots?.map(({ lat, lng, name, url, species }) => ({ lat, lng, url, name, species })) || [];
  const visibleHotspots = expand ? hotspots : hotspots.slice(0, 12);

  return (
    <div className="container pb-16">
      <Title>{`Where to Go Birding in ${name}, ${state.label}`}</Title>
      <Head>
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_DOMAIN}/social-banner.jpg`} />
      </Head>
      <PageHeading
        countrySlug={countrySlug}
        state={state}
        extraCrumb={{ label: "Cities/Towns", href: `/${countrySlug}/${state.slug}/cities` }}
      >
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
        {markers.length > 0 && <MapBox key={slug} markers={markers as Marker[]} zoom={8} landscape disableScroll />}
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

interface Params extends ParsedUrlQuery {
  countrySlug: string;
  stateSlug: string;
  citySlug: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { countrySlug, stateSlug, citySlug } = context.query as Params;
  const state = getState(stateSlug);
  if (!state) return { notFound: true };

  const city = getCityBySlug(state.code, citySlug);
  if (!city?.name) return { notFound: true };

  const hotspots = (await getHotspotsInRadius(city.lat, city.lng, 5)) || [];

  const formatted = hotspots.map((it: any) => ({
    ...it,
    noContent: (it.noContent && !it.groupIds?.length) || false,
  }));

  return {
    props: { countrySlug, state, city, hotspots: formatted },
  };
};
