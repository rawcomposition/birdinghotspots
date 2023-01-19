import * as React from "react";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import { getState, getCounties } from "lib/localData";
import RareBirds from "components/RareBirds";
import { State as StateType, Article, County as CountyType } from "lib/types";
import Heading from "components/Heading";
import PageHeading from "components/PageHeading";
import EditorActions from "components/EditorActions";
import Title from "components/Title";
import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import { getArticlesByState } from "lib/mongo";
import StateMap from "components/StateMap";
import { MapIcon, Bars3Icon } from "@heroicons/react/24/outline";
import TopHotspots from "components/TopHotspots";
import EbirdRegionBtn from "components/EbirdRegionBtn";
import StateLinksBtn from "components/StateLinksBtn";
import RegionStats from "components/RegionStats";
import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import MapIconAlt from "icons/Map";
import { useModal } from "providers/modals";

interface Params extends ParsedUrlQuery {
  countrySlug: string;
  stateSlug: string;
}

type Props = {
  countrySlug: string;
  state: StateType;
  counties: CountyType[];
  info: string;
  articles: Article[];
};

export default function State({ countrySlug, state, counties, info, articles }: Props) {
  const [view, setView] = React.useState<string>(state.noMap ? "list" : "map");
  const { label, code, slug } = state || ({} as StateType);
  const { open } = useModal();

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Birding in ${label}`}</Title>
      <PageHeading countrySlug={countrySlug} state={state} hideState>
        {label} Birding Hotspots
        {state.subheading && (
          <>
            <br />
            <span className="text-sm">{state.subheading}</span>
          </>
        )}
      </PageHeading>
      <EditorActions className="-mt-10" requireRegion={state.code}>
        <Link href={`/edit/group/new?country=${countrySlug}`}>Add Group</Link>
        <Link href={`/${countrySlug}/${slug}/article/edit/new`}>Add Article</Link>
      </EditorActions>
      <div className="grid lg:grid-cols-[2fr_3fr] gap-8 lg:gap-2">
        <div>
          <h3 className="text-lg mb-1.5 font-bold">Where to Go Birding in {label}</h3>
          <div className="flex gap-2 mt-2 mb-4">
            <EbirdRegionBtn code={code} portal={state.portal} />
            <StateLinksBtn state={state} />
          </div>
          <p className="text-gray-600 mb-8 text-[15px]">
            Discover where to go birding in {label} by browsing our tips, descriptions, maps, and images for many eBird
            hotspots.
          </p>
          <RegionStats regionCode={code} />
          <div className="mt-8">
            <Link href={`/region/${code}?view=map`}>
              <a className="bg-[#4a84b2] hover:bg-[#325a79] text-white font-bold py-1.5 text-sm px-4 rounded-full inline-flex items-center">
                <MapIconAlt className="inline-block text-xl mr-3" />
                Explore Hotspot Map <ArrowLongRightIcon className="inline-block w-4 h-4 ml-2" />
              </a>
            </Link>
            <p className="ml-1 mt-0.5">
              Or, <Link href={`/region/${code}`}>view top hotspots</Link> in {label}
            </p>
          </div>
        </div>
        <div className="mb-8">
          {!state.noMap && (
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
                    <Bars3Icon className="w-4 h-4" /> View County List
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
            <div className="columns-2 sm:columns-4 flex-grow bg-gradient-to-t from-slate-600 to-slate-600/95 px-4 py-2 rounded">
              {counties?.map(({ name, slug: countySlug }) => (
                <p key={name}>
                  <Link href={`/${countrySlug}/${slug}/${countySlug}-county`}>
                    <a className="font-bold text-slate-300" title={name}>
                      {name.length > 12 ? `${name.slice(0, 12)}...` : name}
                    </a>
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
        <TopHotspots region={code} label={`${label}, ${countrySlug.toUpperCase()}`} className="mt-12" />
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

      <div className="md:columns-2 gap-16 formatted">
        {articles.length > 0 && (
          <>
            <h3 className="text-lg mb-1.5 font-bold">Birding in {label} Articles</h3>
            <p className="mb-4">
              {articles.map(({ name, slug: articleSlug }) => (
                <React.Fragment key={articleSlug}>
                  <Link href={`/${countrySlug}/${slug}/article/${articleSlug}`}>
                    <a style={{ fontWeight: "normal" }}>{name}</a>
                  </Link>
                  <br />
                </React.Fragment>
              ))}
            </p>
          </>
        )}
        <ReactMarkdown linkTarget="_blank">{info}</ReactMarkdown>
        {!info && articles.length === 0 && (
          <p className="text-gray-500 text-base -mt-2">No additional information available.</p>
        )}
      </div>
      {(info || articles.length > 0) && <hr className="my-8 opacity-70" />}
      <RareBirds region={code} className="mt-12" />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { countrySlug, stateSlug } = params as Params;
  const state = getState(stateSlug);
  if (!countrySlug || !state) return { notFound: true };
  const counties = getCounties(state.code);

  const infoFile = path.join(process.cwd(), "data", "state-info", `${state.code}.md`);
  let info = "";
  if (fs.existsSync(infoFile)) {
    info = fs.readFileSync(infoFile.toString(), "utf8");
  }

  const articles = (await getArticlesByState(state.code)) || [];

  return { props: { countrySlug, counties, state, info, articles } };
};
