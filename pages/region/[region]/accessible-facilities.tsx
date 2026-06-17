import * as React from "react";
import Link from "next/link";
import { getRegionAccessible } from "lib/sqlite";
import { getRegion } from "lib/localData";
import PageHeading from "components/PageHeading";
import { GetServerSideProps } from "next";
import { HotspotsByCounty, Region } from "lib/types";
import ListHotspotsByCounty from "components/ListHotspotsByCounty";
import Title from "components/Title";

type Props = {
  region: Region;
  hotspots: HotspotsByCounty;
};

export default function AccessibleFacilities({ region, hotspots }: Props) {
  return (
    <div className="container pb-16 mt-12">
      <Title>{`Accessible Facilities - ${region.detailedName}`}</Title>
      <PageHeading region={region}>Accessible Facilities</PageHeading>
      <p className="mb-4">
        <strong>
          Below are listed, alphabetically by county, eBird hotspots which have facilities which are ADA accessible.
        </strong>
        <br />
        You can use your browser’s search function to search for the name of a location of interest.
      </p>
      <p className="mb-4">
        Also, see <Link href={`/region/${region.code}/roadside-birding`}>Roadside Birding</Link> for hotspots where you
        may view birds from your vehicle. We also recommend checking out the&nbsp;
        <a href="https://www.birdability.org/" target="_blank" rel="noreferrer">
          Birdability
        </a>
        &nbsp;website for an interactive map listing birding locations that are welcoming, inclusive, safe, and
        accessible for everybody.
      </p>
      <h3 className="text-lg mb-8 font-bold">Accessible Facilities Listed by County</h3>
      <div className="columns-1 sm:columns-3 mb-12">
        <ListHotspotsByCounty hotspots={hotspots} />
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const regionCode = query.region as string;
  const region = getRegion(regionCode);
  const isState = regionCode.split("-").length === 2;
  if (!region || !isState) return { notFound: true };

  const hotspots = (getRegionAccessible(regionCode) || []) as HotspotsByCounty;

  return {
    props: { region, hotspots },
  };
};
