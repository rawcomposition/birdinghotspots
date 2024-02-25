import React from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Head from "next/head";
import { getRegion } from "lib/localData";
import RareBirds from "components/RareBirds";
import { Region, RegionInfo, Article, Hotspot, Marker, HotspotDrive, RegionStatsT, Group } from "lib/types";
import Heading from "components/Heading";
import PageHeading from "components/PageHeading";
import EditorActions from "components/EditorActions";
import Title from "components/Title";
import RegionMap from "components/RegionMap";
import { MapIcon, Bars3Icon, PencilSquareIcon, DocumentPlusIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import TopHotspots from "components/TopHotspots";
import EbirdRegionBtn from "components/EbirdRegionBtn";
import RegionStats from "components/RegionStats";
import MapIconAlt from "icons/Map";
import { useModal } from "providers/modals";
import { StateLinkSection } from "components/StateLinkSection";
import ExternalLinkButton from "components/ExternalLinkButton";
import ImageIcon from "icons/Image";
import { getArticlesByRegion, getRegionInfo, getHotspotsByRegion, getTopGroupsByRegion } from "lib/mongo";
import MapBox from "components/MapBox";
import HotspotList from "components/HotspotList";
import RegionLinksBtn from "components/RegionLinksBtn";
import useLogPageview from "hooks/useLogPageview";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import MoreRegionLinks from "components/MoreRegionLinks";
import ArticleGrid from "components/ArticleGrid";
import RegionBranding from "components/RegionBranding";
import SubregionList from "components/SubregionList";
import isbot from "isbot";
import GroupGrid from "components/GroupGrid";
import clsx from "clsx";

type Props = {
  region: Region;
  info: RegionInfo;
  articles: Article[];
  groups: Group[];
  hotspots: Hotspot[];
  hasSubregions: boolean;
  isBot: boolean;
};

export default function RegionPage({ region, info, articles, groups, hotspots, hasSubregions, isBot }: Props) {
  const [view, setView] = React.useState<string>("map");
  const [stats, setStats] = React.useState<RegionStatsT>();
  const [showAllHotspots, setShowAllHotspots] = React.useState<boolean>(false);
  const { open } = useModal();
  const { code, name, longName, portal, subregions, subheading } = region;
  const base = portal ? `https://ebird.org/${portal}` : "https://ebird.org";

  const regionPieces = code.split("-");
  const countryCode = regionPieces.length >= 1 ? regionPieces[0] : undefined;
  const stateCode = regionPieces.length >= 2 ? regionPieces.slice(0, 2).join("-") : undefined;
  const countyCode = regionPieces.length === 3 ? code : undefined;

  useLogPageview({ stateCode, countyCode, countryCode, entity: "region", isBot });

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
        return t?.locationId === elem?.locationId && t?.name === elem?.name;
      }) === index
  );

  //@ts-ignore
  const sortedIba = iba.sort((a, b) => a.label.localeCompare(b.label));

  //@ts-ignore
  const sortedDrives = uniqueDrives.sort((a, b) => a.name.localeCompare(b.name));

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/region-stats/${code}`);
        const json = await response.json();
        setStats(json);
      } catch (error) {}
    };
    if (code) fetchData();
  }, [code]);

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
      <EditorActions className="-mt-10" requireRegion={code}>
        <Link href={`/edit/group/new?country=${countryCode}`} className="flex gap-1">
          <PlusCircleIcon className="h-4 w-4" />
          Add Group
        </Link>
      </EditorActions>
      {hasSubregions ? (
        <div className="grid lg:grid-cols-[2fr_3fr] gap-8 lg:gap-2">
          <section>
            <h3 className="text-lg mb-1.5 font-bold">Where to Go Birding in {longName}</h3>
            <div className="flex gap-2 mt-2 mb-4">
              <RegionLinksBtn region={region} />
              <EbirdRegionBtn code={code} portal={portal} />
            </div>
            <p className="text-gray-600 mb-8 text-[15px]">
              Discover where to go birding in {name} by browsing our tips, descriptions, maps, and images for many eBird
              hotspots.
            </p>
            <RegionBranding regionCode={code} className="mb-8" />
            <RegionStats regionCode={code} data={stats} />
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
              <SubregionList regionCode={code} subregions={subregions} />
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
                <RegionLinksBtn region={region} />
                <EbirdRegionBtn code={code} portal={portal} />
              </div>
            </div>
            <RegionStats regionCode={code} data={stats} />
          </section>
          <section className="mb-16">
            {markers.length > 0 && !isBot && (
              <MapBox key={code} markers={markers as Marker[]} zoom={8} landscape disableScroll />
            )}
          </section>
        </>
      )}

      <section>
        <Heading id="hotspots" color="green" className="mt-12 mb-8">
          Hotspots
        </Heading>
        <h3 className="text-lg font-bold" id="hotspots">
          Top Hotspots
        </h3>
        <TopHotspots region={code} className="mt-3" />
      </section>

      {!hasSubregions && (
        <>
          <section className="mb-12 relative mt-4">
            <h3 className="text-lg mb-2 font-bold" id="hotspots">
              All Hotspots
              <span className="text-base text-gray-500"> ({hotspots.length})</span>
            </h3>
            {!hotspots.length && <p className="text-base text-gray-500 -mt-2">None</p>}
            <div className={clsx("mb-12", !showAllHotspots && "overflow-hidden max-h-[400px]")}>
              <HotspotList hotspots={hotspots} className="md:columns-3" />
            </div>
            {showAllHotspots ? (
              <button
                className="bg-gray-100 border hover:bg-gray-200 text-gray-600 font-bold py-1.5 text-sm px-4 rounded-full w-[140px] mx-auto block mt-10 text-center"
                onClick={() => setShowAllHotspots(false)}
              >
                Collapse
              </button>
            ) : (
              <div
                className={clsx(
                  "bg-gradient-to-t from-white to-transparent z-10 absolute bottom-0 left-0 right-0 h-12",
                  hotspots.length > 15 && typeof window !== "undefined" && window.innerWidth < 768
                    ? "block"
                    : hotspots.length > 45
                    ? "block"
                    : "hidden"
                )}
              >
                <button
                  className="bg-gray-100 border hover:bg-gray-200 text-gray-600 font-bold py-1.5 text-sm px-4 rounded-full w-[140px] mx-auto block mt-10 text-center"
                  onClick={() => setShowAllHotspots(true)}
                >
                  Expand
                </button>
              </div>
            )}

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
                  {sortedDrives?.map(({ name, locationId }: any) => (
                    <li key={locationId}>
                      <Link href={`/drive/${locationId}`}>{name}</Link>
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
          <EditorActions className="-mt-2" requireRegion={code}>
            <Link href={`/region/${code}/edit-info`} className="flex gap-1">
              <PencilSquareIcon className="h-4 w-4" />
              Edit Links
            </Link>
            <Link href={`/article/new/edit?region=${region.code}`} className="flex gap-1">
              <DocumentPlusIcon className="h-4 w-4" />
              Add Article
            </Link>
          </EditorActions>

          {articles.length > 0 && <ArticleGrid articles={articles} className="mb-10" />}
          <div className="md:columns-2 gap-16">
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
      {groups.length > 0 && (
        <>
          <Heading id="groups" color="darkGray" className="mt-12 mb-8">
            Groups
          </Heading>
          <div className="grid xs:grid-cols-2 md:grid-cols-3 gap-6 min-h-[300px] mt-4">
            <GroupGrid groups={groups} />
          </div>
          <Link
            href={`/region/${region.code}/groups`}
            className="bg-primary hover:bg-secondary text-white font-bold py-1.5 text-sm px-4 rounded-full w-[140px] mx-auto block mt-4 text-center"
          >
            View More
            <ArrowLongRightIcon className="inline-block w-4 h-4 ml-2" />
          </Link>
        </>
      )}
      <Heading id="contribute" color="darkGray" className="mt-12 mb-8">
        Contribute
      </Heading>
      <p className="text-gray-600 mb-8 text-[15px]">
        <strong>Are you familiar with some of the hotspots in {name}?</strong>
        <br />
        Contribute tips, descriptions, and images to help birders in your area.
      </p>
      <div className="flex gap-8 flex-wrap flex-col sm:flex-row mb-16">
        <Link
          href={`/region/${code}/hotspots?images=No`}
          className="border-2 rounded-lg py-3 px-6 text-gray-600 flex flex-col gap-4 min-w-[230px] hover:border-gray-300"
        >
          <h3 className="font-bold inline-flex gap-2 items-center">
            <PhotoIcon className="inline-block w-5 h-5" />
            Without Images
          </h3>
          <span className="text-4xl">{stats?.withoutImg?.toLocaleString() || "--"}</span>
          <span className="text-primary font-bold">
            View Hotspots
            <ArrowLongRightIcon className="inline-block w-4 h-4 ml-2" />
          </span>
        </Link>
        <Link
          href={`/region/${code}/hotspots?content=No`}
          className="border-2 rounded-lg py-3 px-6 text-gray-600 flex flex-col gap-4 min-w-[230px] hover:border-gray-300"
        >
          <h3 className="font-bold inline-flex gap-2 items-center">
            <PencilSquareIcon className="inline-block w-5 h-5" />
            Without Content
          </h3>
          <span className="text-4xl">{stats?.withoutContent?.toLocaleString() || "--"}</span>
          <span className="text-primary font-bold">
            View Hotspots
            <ArrowLongRightIcon className="inline-block w-4 h-4 ml-2" />
          </span>
        </Link>
      </div>
      {code !== "US" && <RareBirds region={code} className="mt-12" />}
      <MoreRegionLinks region={region} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const regionCode = context.params?.region as string;
  const region = getRegion(regionCode);
  if (!region) return { notFound: true };
  const hasSubregions = !!region.subregions?.length;

  const [info, articles, hotspots, groups] = await Promise.all([
    hasSubregions ? getRegionInfo(regionCode) : null,
    hasSubregions ? getArticlesByRegion(regionCode) : [],
    !hasSubregions ? getHotspotsByRegion(regionCode) : [],
    getTopGroupsByRegion(regionCode, 6),
  ]);

  const formattedHotspots = hotspots.map((it: any) => ({
    ...it,
    noContent: (it.noContent && !it.groupIds?.length) || false,
  }));

  const isBot = isbot(context.req.headers["user-agent"] || "");

  return {
    props: { key: region.code, region, info, articles, groups, hasSubregions, hotspots: formattedHotspots, isBot },
  };
};
