import Link from "next/link";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { getHotspotsByCounty, getGroupHotspotIdsByCounty } from "lib/mongo";
import { getState, getCountyBySlug } from "lib/localData";
import PageHeading from "components/PageHeading";
import { State, HotspotDrive, Hotspot, County as CountyType, Marker } from "lib/types";
import HotspotList from "components/HotspotList";
import RareBirds from "components/RareBirds";
import Title from "components/Title";
import TopHotspots from "components/TopHotspots";
import EbirdCountyBtn from "components/EbirdCountyBtn";
import CountyLinksBtn from "components/CountyLinksBtn";
import MapBox from "components/MapBox";
import nookies from "nookies";

type Props = {
  countrySlug: string;
  county: CountyType;
  state: State;
  hotspots: Hotspot[];
};

export default function County({ countrySlug, state, county, hotspots }: Props) {
  const { name, ebirdCode } = county;
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

  const markers = hotspots?.map(({ lat, lng, name, url }) => ({ lat, lng, url, name, type: "child" })) || [];

  return (
    <div className="container pb-16">
      <Title>{`${name} County, ${state.label}, ${state.country}`}</Title>
      <PageHeading countrySlug={countrySlug} state={state}>
        {name} County
      </PageHeading>
      <section>
        <h3 className="text-lg mb-2 font-bold -mt-8">Where to Go Birding in {name} County</h3>
        <div className="flex gap-2 mt-2 mb-4">
          <EbirdCountyBtn state={state} county={county} />
          <CountyLinksBtn showIba={iba.length > 0} />
        </div>
      </section>
      <section className="mb-16">
        {markers.length > 0 && (
          <MapBox
            key={county.ebirdCode}
            markers={markers as Marker[]}
            lat={markers[0].lat}
            lng={markers[0].lng}
            zoom={8}
            landscape
            disableScroll
          />
        )}
      </section>
      <section className="mb-16">
        <h3 className="text-lg mb-2 font-bold" id="tophotspots">
          Top eBird Hotspots
        </h3>
        <TopHotspots
          region={ebirdCode}
          label={`${name}, ${state.label}, ${countrySlug.toUpperCase()}`}
          className="mt-4"
        />
      </section>
      <section className="mb-12">
        <h3 className="text-lg mb-2 font-bold" id="hotspots">
          All Hotspots in {name} County
        </h3>
        <HotspotList hotspots={hotspots} className="md:columns-3" />
        {hotspots.length === 0 && (
          <p className="text-base text-gray-500">No data has been entered for {name} County yet</p>
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
      <RareBirds region={ebirdCode} label={`${name} County`} className="mt-16" />
    </div>
  );
}

interface Params extends ParsedUrlQuery {
  countrySlug: string;
  stateSlug: string;
  countySlug: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = nookies.get(context);
  const { countrySlug, stateSlug, countySlug } = context.query as Params;
  const state = getState(stateSlug);
  if (!state) return { notFound: true };

  const county = getCountyBySlug(state.code, countySlug);
  if (!county?.name) return { notFound: true };

  const hotspots = (await getHotspotsByCounty(county.ebirdCode)) || [];

  let groupHotspotIds: string[] = [];
  if (cookies.session) {
    groupHotspotIds = (await getGroupHotspotIdsByCounty(state.code)) || [];
  }

  const formatted = hotspots.map((it: any) => ({
    ...it,
    noContent:
      (it.noContent && !groupHotspotIds.includes(it._id.toString()) && !it.name.startsWith("stakeout ")) || false,
  }));

  return {
    props: { countrySlug, state, county, hotspots: formatted },
  };
};
