import Link from "next/link";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { getHotspotsByCounty } from "lib/mongo";
import { getState, getCountyBySlug } from "lib/localData";
import PageHeading from "components/PageHeading";
import { State, HotspotDrive, Hotspot, County as CountyType, Marker } from "lib/types";
import HotspotList from "components/HotspotList";
import RareBirds from "components/RareBirds";
import Title from "components/Title";
import TopHotspots from "components/TopHotspots";
import EbirdRegionBtn from "components/EbirdRegionBtn";
import CountyLinksBtn from "components/CountyLinksBtn";
import MapBox from "components/MapBox";
import RegionStats from "components/RegionStats";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import EditorActions from "components/EditorActions";
import ExternalLinkButton from "components/ExternalLinkButton";
import ImageIcon from "icons/Image";
import useLogPageview from "hooks/useLogPageview";

type Props = {
  countrySlug: string;
  county: CountyType;
  state: State;
  hotspots: Hotspot[];
};

export default function County({ countrySlug, state, county, hotspots }: Props) {
  useLogPageview({
    stateCode: state.code,
    countyCode: county.code,
    countryCode: state.country.toUpperCase(),
    entity: "county",
  });
  const { name, longName, code } = county;
  const hotspotIBA = hotspots.filter(({ iba }) => iba?.value).map(({ iba }) => iba);
  const drives: HotspotDrive[] = [];
  hotspots.forEach((hotspot) => {
    hotspot.drives?.forEach((drive) => {
      drives.push(drive);
    });
  });

  //Removes duplicate objects from IBA array
  const iba = hotspotIBA.filter(
    (elem, index, self) =>
      self.findIndex((t) => {
        return t?.value === elem?.value && t?.label === elem?.label;
      }) === index
  );

  //Removes duplicate objects from drive array
  const uniqueDrives = drives.filter(
    (elem, index, self) =>
      self.findIndex((t) => {
        return t?.slug === elem?.slug && t?.name === elem?.name;
      }) === index
  );

  //@ts-ignore
  const sortedIba = iba.sort((a, b) => a.label.localeCompare(b.label));

  //@ts-ignore
  const sortedDrives = uniqueDrives.sort((a, b) => a.name.localeCompare(b.name));

  const markers = hotspots?.map(({ lat, lng, name, url, species }) => ({ lat, lng, url, name, species })) || [];

  const base = state?.portal ? `https://ebird.org/${state.portal}` : "https://ebird.org";

  return (
    <div className="container pb-16">
      <Title>{`${longName}, ${state.label}, ${state.country}`}</Title>
      <Head>
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_DOMAIN}/social-banner.jpg`} />
      </Head>
      <PageHeading countrySlug={countrySlug} state={state}>
        {longName}
      </PageHeading>
      <EditorActions className="-mt-10" requireRegion={state.code}>
        <Link href={`/edit/group/new?country=${countrySlug}`} className="flex gap-1">
          <PlusCircleIcon className="h-4 w-4" />
          Add Group
        </Link>
      </EditorActions>
      <section className="md:flex justify-between items-start mb-8">
        <div>
          <h3 className="text-lg mb-2 font-bold">Where to Go Birding in {longName}</h3>
          <div className="flex gap-2 mt-2 mb-4">
            <CountyLinksBtn
              showIba={iba.length > 0}
              countrySlug={countrySlug}
              stateSlug={state.slug}
              county={county}
              label={name}
            />

            <div className="inline-flex gap-2">
              {/*Grouped to prevent the last button from wrapping on its own*/}
              <ExternalLinkButton href={`${base}/hotspots/${code}/media?yr=all&m=`}>
                <ImageIcon className="mr-1 -mt-[3px] text-primary" /> Illustrated Checklist
              </ExternalLinkButton>
              <EbirdRegionBtn code={code} portal={state.portal} />
            </div>
          </div>
        </div>
        <RegionStats regionCode={code} />
      </section>
      <section className="mb-16">
        {markers.length > 0 && (
          <MapBox key={county.code} markers={markers as Marker[]} zoom={8} landscape disableScroll />
        )}
      </section>
      <section className="mb-16">
        <h3 className="text-lg mb-2 font-bold" id="tophotspots">
          Top eBird Hotspots
        </h3>
        <TopHotspots region={code} label={`${name}, ${state.label}, ${countrySlug.toUpperCase()}`} className="mt-4" />
      </section>
      <section className="mb-12">
        <h3 className="text-lg mb-2 font-bold" id="hotspots">
          All Hotspots
          <span className="text-base text-gray-500"> ({hotspots.length})</span>
        </h3>
        <HotspotList hotspots={hotspots} className="md:columns-3" />
        {hotspots.length === 0 && (
          <p className="text-base text-gray-500">No data has been entered for this region yet</p>
        )}
      </section>
      <div className="md:columns-3">
        {sortedIba.length > 0 && (
          <section className="break-inside-avoid-column mb-4">
            <h3 className="text-lg mb-2 font-bold" id="iba">
              Important Bird Areas
            </h3>
            <ul>
              {sortedIba?.map(({ label, value }: any) => (
                <li key={value}>
                  <Link href={`/${countrySlug}/${state.slug}/important-bird-areas/${value}`}>{label}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {sortedDrives.length > 0 && (
          <section className="break-inside-avoid-column mb-4">
            <h3 className="text-lg mb-2 font-bold" id="iba">
              Birding Drives
            </h3>
            <ul>
              {sortedDrives?.map(({ name, slug }: any) => (
                <li key={slug}>
                  <Link href={`/${countrySlug}/${state.slug}/drive/${slug}`}>{name}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <RareBirds region={code} className="mt-16" />
    </div>
  );
}

interface Params extends ParsedUrlQuery {
  countrySlug: string;
  stateSlug: string;
  countySlug: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { countrySlug, stateSlug, countySlug } = context.query as Params;
  const state = getState(stateSlug);
  if (!state) return { notFound: true };

  const county = getCountyBySlug(state.code, countySlug);
  if (!county?.name) return { notFound: true };

  const hotspots = (await getHotspotsByCounty(county.code)) || [];

  const formatted = hotspots.map((it: any) => ({
    ...it,
    noContent: (it.noContent && !it.groupIds?.length) || false,
  }));

  return {
    props: { countrySlug, state, county, hotspots: formatted },
  };
};
