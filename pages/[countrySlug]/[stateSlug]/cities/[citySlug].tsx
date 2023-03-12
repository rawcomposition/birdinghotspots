import React from "react";
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
      <Title>{`${name}, ${state.label}, ${state.country}`}</Title>
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
      <section className="md:flex justify-between items-start mb-4 -mt-8">
        <div>
          <h3 className="text-lg mb-1 font-bold">Where to Go Birding in {name}</h3>
          <p className="mb-2 text-base">
            Plan to go birding in {name}? Below are some of the best eBird hotspots in the area.
          </p>
        </div>
      </section>
      <section className="mb-16">
        {markers.length > 0 && <MapBox key={slug} markers={markers as Marker[]} zoom={8} landscape disableScroll />}
      </section>
      <section className="mb-16">
        <h3 className="text-lg mb-2 font-bold" id="tophotspots">
          Top eBird Hotspots <span className="text-gray-500 font-normal">({hotspots.length})</span>
        </h3>
        <div className="grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <HotspotGrid hotspots={visibleHotspots} loading={false} />
        </div>
        {!expand && (
          <button
            type="button"
            className="bg-[#4a84b2] hover:bg-[#325a79] text-white font-bold py-1.5 text-sm px-4 rounded-full w-[140px] mx-auto block mt-4 text-center"
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

  const city = getCityBySlug(citySlug);
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
