import React from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Head from "next/head";
import { getRegion } from "lib/localData";
import RareBirds from "components/RareBirds";
import { Region, RegionInfo, Article, Hotspot, Marker, HotspotDrive } from "lib/types";
import Heading from "components/Heading";
import PageHeading from "components/PageHeading";
import EditorActions from "components/EditorActions";
import Title from "components/Title";
import RegionMap from "components/RegionMap";
import { MapIcon, Bars3Icon, PencilSquareIcon, DocumentPlusIcon } from "@heroicons/react/24/outline";
import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import TopHotspots from "components/TopHotspots";
import EbirdRegionBtn from "components/EbirdRegionBtn";
import RegionStats from "components/RegionStats";
import MapIconAlt from "icons/Map";
import { useModal } from "providers/modals";
import { StateLinkSection } from "components/StateLinkSection";
import ExternalLinkButton from "components/ExternalLinkButton";
import ImageIcon from "icons/Image";
import { getArticlesByRegion, getRegionInfo, getHotspotsByCounty } from "lib/mongo";
import MapBox from "components/MapBox";
import HotspotList from "components/HotspotList";
import RegionLinksBtn from "components/RegionLinksBtn";
import useLogPageview from "hooks/useLogPageview";

type Props = {
  region: Region;
  info: RegionInfo;
  articles: Article[];
  hotspots: Hotspot[];
  hasSubregions: boolean;
};

export default function RegionPage({ region, info, articles, hotspots, hasSubregions }: Props) {
  const [view, setView] = React.useState<string>("map");
  const { open } = useModal();
  const { code, name, longName, portal, subregions, subheading } = region;
  const base = portal ? `https://ebird.org/${portal}` : "https://ebird.org";

  const regionPieces = code.split("-");
  const countryCode = regionPieces.length >= 1 ? regionPieces[0] : undefined;
  const stateCode = regionPieces.length >= 2 ? regionPieces.slice(0, 2).join("-") : undefined;
  const countyCode = regionPieces.length === 3 ? code : undefined;

  useLogPageview({ stateCode, countyCode, countryCode, entity: "hotspot" });

  const markers = hotspots?.map(({ lat, lng, name, url, species }) => ({ lat, lng, url, name, species })) || [];

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

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Birding in ${longName}`}</Title>
      <Head>
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_DOMAIN}/social-banner.jpg`} />
      </Head>
      <PageHeading region={region} hideCurrent>
        {hasSubregions ? `${longName} Birding Hotspots` : longName}
        {subheading && (
          <>
            <br />
            <span className="text-sm">{subheading}</span>
          </>
        )}
      </PageHeading>
      {hasSubregions ? (
        <div className="grid lg:grid-cols-[2fr_3fr] gap-8 lg:gap-2">
          <section>
            <h3 className="text-lg mb-1.5 font-bold">Where to Go Birding in {longName}</h3>
            <div className="flex gap-2 mt-2 mb-4">
              <RegionLinksBtn region={region} />
              <div className="inline-flex gap-2">
                {/*Grouped to prevent the last button from wrapping on its own*/}
                <ExternalLinkButton href={`${base}/region/${code}/media?yr=all&m=`}>
                  <ImageIcon className="mr-1 -mt-[3px] text-primary" /> Illustrated Checklist
                </ExternalLinkButton>
                <EbirdRegionBtn code={code} portal={portal} />
              </div>
            </div>
            <p className="text-gray-600 mb-8 text-[15px]">
              Discover where to go birding in {name} by browsing our tips, descriptions, maps, and images for many eBird
              hotspots.
            </p>
            <RegionStats regionCode={code} />
            <div className="mt-8">
              <Link
                href={`/region/${code}/hotspots?view=map`}
                className="bg-primary hover:bg-secondary text-white font-bold py-1.5 text-sm px-4 rounded-full inline-flex items-center"
              >
                <MapIconAlt className="inline-block text-xl mr-3" />
                Explore Hotspot Map
                <ArrowLongRightIcon className="inline-block w-4 h-4 ml-2" />
              </Link>
              <p className="ml-1 mt-0.5">
                Or, <Link href={`/region/${code}/hotspots`}>view top hotspots</Link> in {name}
              </p>
            </div>
          </section>
          <div className="mb-8">
            <div className="flex">
              <button
                type="button"
                className="border py-1 px-2.5 text-xs rounded-full text-gray-600 flex items-center gap-2 hover:bg-gray-50/75 transition-all ml-auto mb-2"
                onClick={() => setView((prev) => (prev === "map" ? "list" : "map"))}
              >
                {view === "list" ? (
                  <>
                    <MapIcon className="w-4 h-4" /> View Map
                  </>
                ) : (
                  <>
                    <Bars3Icon className="w-4 h-4" /> View Region List
                  </>
                )}
              </button>
            </div>
            {view === "map" ? (
              <div className="flex justify-center items-start">
                <RegionMap regionCode={code} />
              </div>
            ) : (
              <div className="columns-2 sm:columns-4 flex-grow bg-gradient-to-t from-slate-600 to-slate-600/95 px-4 py-2 rounded lg:ml-24">
                {subregions?.map((it) => (
                  <p key={it.code}>
                    <Link href={`/region/${it.code}`} className="font-bold text-slate-300" title={it.name}>
                      {it.name.length > 12 ? `${it.name.slice(0, 12)}...` : it.name}
                    </Link>
                  </p>
                ))}
              </div>
            )}
            <div className="grid gap-8 grid-cols-2">
              <div className="flex gap-4 items-center">
                <div className="w-6 h-3" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <section className="md:flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg mb-2 font-bold">Where to Go Birding in {name}</h3>
              <div className="flex gap-2 mt-2 mb-4">
                <div className="inline-flex gap-2">
                  {/*Grouped to prevent the last button from wrapping on its own*/}
                  <ExternalLinkButton href={`${base}/region/${code}/media?yr=all&m=`}>
                    <ImageIcon className="mr-1 -mt-[3px] text-primary" /> Illustrated Checklist
                  </ExternalLinkButton>
                  <EbirdRegionBtn code={code} portal={portal} />
                </div>
              </div>
            </div>
            <RegionStats regionCode={code} />
          </section>
          <section className="mb-16">
            {markers.length > 0 && <MapBox key={code} markers={markers as Marker[]} zoom={8} landscape disableScroll />}
          </section>
        </>
      )}

      <section>
        <Heading id="hotspots" color="green" className="mt-12 mb-8">
          Top eBird Hotspots
        </Heading>
        <TopHotspots region={code} className="mt-12" />
      </section>

      {!hasSubregions && (
        <>
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
                      <Link href={`/region/${region.code}/important-bird-areas/${value}`}>{label}</Link>
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
                      <Link href={`/region/${region.code}/drives/${slug}`}>{name}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </>
      )}

      {hasSubregions && (
        <>
          <Heading id="hotspots" color="yellow" className="mt-12 mb-8 flex items-center gap-2">
            More Information{" "}
            <button
              type="button"
              className="font-bold text-sm text-gray-100 hover:bg-neutral-800/40 rounded-full inline-flex items-center justify-center bg-neutral-800/30 w-5 h-5"
              onClick={() => open("stateInfo")}
            >
              ?
            </button>
          </Heading>
          <EditorActions className="-mt-2">
            <Link href={`/region/${code}/edit-info`} className="flex gap-1">
              <PencilSquareIcon className="h-4 w-4" />
              Edit Links
            </Link>
            <Link href={`/region/${region.code}/articles/edit/new`} className="flex gap-1">
              <DocumentPlusIcon className="h-4 w-4" />
              Add Article
            </Link>
          </EditorActions>

          <div className="md:columns-2 gap-16">
            <StateLinkSection
              links={articles.map(({ stateCode, countryCode, name, slug: articleSlug }) => ({
                label: name,
                url: `/region/${stateCode || countryCode}/articles/${articleSlug}`,
              }))}
              heading="Articles"
            />
            <StateLinkSection links={info?.websiteLinks || []} heading={info?.websitesHeading} external />
            <StateLinkSection links={info?.socialLinks || []} heading={info?.socialHeading} external />
            <StateLinkSection links={info?.clubLinks || []} heading={info?.clubsHeading} external />

            {!info && articles.length === 0 && (
              <p className="text-gray-500 text-base -mt-2">No additional information available.</p>
            )}
          </div>
          <hr className="my-8 opacity-70" />
        </>
      )}
      {code !== "US" && <RareBirds region={code} className="mt-12" />}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const regionCode = context.params?.region as string;
  const region = getRegion(regionCode);
  if (!region) return { notFound: true };
  const hasSubregions = !!region.subregions?.length;

  const info = hasSubregions ? await getRegionInfo(regionCode) : null;
  const articles = hasSubregions ? (await getArticlesByRegion(regionCode)) || [] : [];

  const hotspots = !hasSubregions ? (await getHotspotsByCounty(regionCode)) || [] : [];

  const formattedHotspots = hotspots.map((it: any) => ({
    ...it,
    noContent: (it.noContent && !it.groupIds?.length) || false,
  }));

  return {
    props: { key: region.code, region, info, articles, hasSubregions, hotspots: formattedHotspots },
  };
};
