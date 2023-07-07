import Link from "next/link";
import { getRegion, restructureHotspotsByCounty } from "lib/data";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import PageHeading from "components/PageHeading";
import OhioIBA from "data/oh-iba.json";
import { Region, IBA, HotspotsByCounty } from "lib/types";
import { getIBAHotspots } from "lib/mongo";
import ListHotspotsByCounty from "components/ListHotspotsByCounty";
import EbirdBarcharts from "components/EbirdBarcharts";
import Title from "components/Title";

interface Props extends IBA {
  region: Region;
  locationIds: string[];
  hotspots: HotspotsByCounty;
}

export default function ImportantBirdAreas({ region, name, slug, about, webpage, hotspots, code, locationIds }: Props) {
  return (
    <div className="container pb-16 mt-12">
      <Title>{`${name} Important Bird Area`}</Title>
      <PageHeading
        region={region}
        extraCrumb={{ href: `/region/${region.code}/important-bird-areas`, label: "Important Bird Areas" }}
      >
        {name} Important Bird Area
      </PageHeading>
      <div className="md:grid grid-cols-2 gap-12">
        <div>
          <h3 className="font-bold text-lg">
            {name}
            <br />
            Important Bird Area
          </h3>
          <p className="mb-6">
            <a href={webpage} target="_blank" rel="noreferrer">
              View webpage
            </a>
          </p>
          <EbirdBarcharts portal={region.portal} region={code || locationIds.join(",")} />
          <h3 className="font-bold mb-1.5 text-lg">Locations</h3>
          <ListHotspotsByCounty hotspots={hotspots} />
        </div>
        <div>
          <img src={`/iba/${slug}.jpg`} className="w-full mb-6" />
          <h3 className="font-bold">About {name} Important Bird Area</h3>
          <div className="formatted" dangerouslySetInnerHTML={{ __html: about }} />
          <p className="text-[0.6rem] mt-1">
            From{" "}
            <a href={webpage} target="_blank" rel="noopener noreferrer">
              {name} Important Bird Area webpage
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

interface Params extends ParsedUrlQuery {
  region: string;
  iba: string;
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { region: regionCode, iba } = query as Params;
  const region = getRegion(regionCode);
  if (!region) return { notFound: true };

  const hotspots = (await getIBAHotspots(iba)) || [];
  const hotspotsByCounty = await restructureHotspotsByCounty(hotspots as any, region.code);

  const data = OhioIBA.find((item) => item.slug === iba);
  if (!data) return { notFound: true };

  const locationIds = data?.code ? [] : hotspots.map((item) => item.locationId);

  return {
    props: { region, hotspots: hotspotsByCounty, locationIds, ...data },
  };
};
