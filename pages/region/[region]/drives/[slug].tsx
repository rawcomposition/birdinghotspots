import * as React from "react";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import { getDriveBySlug } from "lib/mongo";
import { getRegion } from "lib/localData";
import { Drive as DriveType, Region } from "lib/types";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import EditorActions from "components/EditorActions";
import DeleteBtn from "components/DeleteBtn";
import MapList from "components/MapList";

interface Props extends DriveType {
  region: Region;
}

export default function Drive({ region, name, description, mapId, entries, images, _id }: Props) {
  const [rendered, isRendered] = React.useState(false);
  React.useEffect(() => {
    isRendered(true);
  }, []);
  return (
    <div className="container pb-16">
      <Title>{`${name} - ${region.detailedName}`}</Title>
      <PageHeading region={region} extraCrumb={{ label: "Birding Drives", href: `/region/${region.code}/drives` }}>
        {name}
      </PageHeading>
      <EditorActions className="-mt-12" requireRegion={region.code}>
        <Link href={`/region/${region.code}/drives/edit/${_id}`}>Edit Drive</Link>
        <DeleteBtn url={`/api/drive/delete?id=${_id}`} entity="drive" className="ml-auto">
          Delete Drive
        </DeleteBtn>
      </EditorActions>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <p className="mb-4">
            <strong>Birding Drives</strong> are routes for birding trips which can be accomplished in one day, stopping
            to walk and bird at various eBird hotspots. For each birding drive, a Google map is provided with the route
            and suggested stops at eBird hotspots. You may save the link to the Google map on your smartphone or tablet,
            or print a copy on paper to take with you. Links are provided with information about each eBird hotspot.
            Follow those links for more information about birding each location.
          </p>
          <p className="mb-4">
            <strong>{name}</strong>
            <br />
            Click on the hotspot names below to view the page about that hotspot.
          </p>
          <div dangerouslySetInnerHTML={{ __html: description }} className="formatted" />
          {entries.map(({ description, hotspot }: any) => (
            <div key={hotspot._id} className="mb-4">
              <strong>
                <Link href={hotspot.url}>{hotspot.name}</Link>
              </strong>
              <br />
              {hotspot.address && (
                <p className="whitespace-pre-line mb-4" dangerouslySetInnerHTML={{ __html: hotspot.address }} />
              )}
              <div dangerouslySetInnerHTML={{ __html: description }} className="formatted" />
            </div>
          ))}
        </div>
        <div>
          {rendered && (
            <iframe
              src={`https://www.google.com/maps/d/embed?mid=${mapId}`}
              width="510"
              height="480"
              className="w-full"
            />
          )}
          {!!images?.length && <MapList images={images} />}
        </div>
      </div>
    </div>
  );
}

interface Params extends ParsedUrlQuery {
  countrySlug: string;
  stateSlug: string;
  slug: string;
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const regionCode = query.region as string;
  const slug = query.slug as string;
  const region = getRegion(regionCode);
  const isState = regionCode.split("-").length === 2;
  if (!region || !isState) return { notFound: true };

  const data = await getDriveBySlug(region.code, slug);
  if (!data) return { notFound: true };

  const filteredEntries = data.entries.filter((entry: any) => entry.hotspot);

  return {
    props: {
      region,
      ...data,
      entries: filteredEntries,
    },
  };
};
