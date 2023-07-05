import React from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Head from "next/head";
import { getRegion } from "lib/data";
import RareBirds from "components/RareBirds";
import { Region } from "lib/types";
import Heading from "components/Heading";
import PageHeading from "components/PageHeading";
import EditorActions from "components/EditorActions";
import Title from "components/Title";
import StateMap from "components/StateMap";
import { MapIcon, Bars3Icon, PencilSquareIcon, DocumentPlusIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import TopHotspots from "components/TopHotspots";
import EbirdRegionBtn from "components/EbirdRegionBtn";
import StateLinksBtn from "components/StateLinksBtn";
import RegionStats from "components/RegionStats";
import MapIconAlt from "icons/Map";
import { useModal } from "providers/modals";
import { StateLinkSection } from "components/StateLinkSection";
import ExternalLinkButton from "components/ExternalLinkButton";
import ImageIcon from "icons/Image";

type Props = {
  region: Region;
};

export default function RegionPage({ region }: Props) {
  const [view, setView] = React.useState<string>("map");
  const { open } = useModal();
  const { code, name, portal, subregions, subheading } = region;
  const base = portal ? `https://ebird.org/${portal}` : "https://ebird.org";

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Birding in ${name}`}</Title>
      <PageHeading>
        {!!subregions?.length ? `${name} Birding Hotspots` : name}
        {subheading && (
          <>
            <br />
            <span className="text-sm">{subheading}</span>
          </>
        )}
      </PageHeading>
      <div className="grid lg:grid-cols-[2fr_3fr] gap-8 lg:gap-2">
        <div>
          <h3 className="text-lg mb-1.5 font-bold">Where to Go Birding in {name}</h3>
          <div className="flex gap-2 mt-2 mb-4">
            {/*<StateLinksBtn state={state} />*/}
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
              href={`/hotspots/${code}?view=map`}
              className="bg-primary hover:bg-secondary text-white font-bold py-1.5 text-sm px-4 rounded-full inline-flex items-center"
            >
              <MapIconAlt className="inline-block text-xl mr-3" />
              Explore Hotspot Map
              <ArrowLongRightIcon className="inline-block w-4 h-4 ml-2" />
            </Link>
            <p className="ml-1 mt-0.5">
              Or, <Link href={`/hotspots/${code}`}>view top hotspots</Link> in {name}
            </p>
          </div>
        </div>
        <div className="mb-8">
          {!!subregions?.length && (
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
          )}
          {view === "map" ? (
            <div className="flex justify-center items-start">
              <StateMap regionCode={code} />
            </div>
          ) : (
            <div className="columns-2 sm:columns-4 flex-grow bg-gradient-to-t from-slate-600 to-slate-600/95 px-4 py-2 rounded lg:ml-24">
              {subregions?.map((it) => (
                <p key={name}>
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

      <section>
        <Heading id="hotspots" color="green" className="mt-12 mb-8">
          Top eBird Hotspots
        </Heading>
        <TopHotspots region={code} className="mt-12" />
      </section>

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
      <hr className="my-8 opacity-70" />
      {/*<RareBirds region={code} className="mt-12" />*/}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const regionCode = context.params?.region as string;
  const region = await getRegion(regionCode);
  if (!region) return { notFound: true };

  return {
    props: { region },
  };
};
