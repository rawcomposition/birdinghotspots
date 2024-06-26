import React from "react";
import Link from "next/link";
import { getRegion } from "lib/localData";
import { GetServerSideProps } from "next";
import OhioIBA from "data/oh-iba.json";
import PageHeading from "components/PageHeading";
import { Region } from "lib/types";
import Title from "components/Title";

type Props = {
  region: Region;
  areas: { name: string; slug: string }[];
};

export default function ImportantBirdAreas({ areas, region }: Props) {
  return (
    <div className="container pb-16 mt-12">
      <Title>{`Important Bird Areas - ${region.detailedName}`}</Title>
      <PageHeading region={region}>Important Bird Areas</PageHeading>
      <div className="md:flex gap-8 items-start mb-8">
        <div>
          <p className="mb-4">
            The{" "}
            <a href="https://www.audubon.org/important-bird-areas/state/ohio" target="_blank" rel="noreferrer">
              Ohio Important Bird Areas Program
            </a>{" "}
            began in 1999, with a gathering of bird conservation stakeholders critiquing the IBA concept and
            establishing the first cut of potential IBAs in the state. In 2000, Audubon Ohio hired an IBA coordinator
            and then the Ohio IBA Technical Committee was formed, to develop the state level criteria, procedures, and
            nomination forms. Over 200 nomination packets were distributed, with more than 160 nominations returned.
            Since then, the technical committee has reviewed these nominations to determine those that meet requirements
            for at least one of the four criteria for IBAs. This process has resulted in the documentation and research
            of over 100 sites, of which 66 are recognized as Important Bird Areas for Ohio. The Ohio IBA Program has
            served as a catalyst for community-based action to ensure the long-term stewardship and conservation of the
            state’s diverse natural resources. A state-wide IBA Technical Committee continues to prioritize monitoring
            and conservation planning on different sites. Workshops to recruit and train volunteers for surveying birds
            on IBAs have been conducted across the state. Community partners are receptive and actively engaged in the
            program. Advocacy for IBAs at risk has been effective. The IBA name is being increasingly used as
            justification for conservation in the state.
          </p>
          <p className="mb-4">
            Important Bird Areas (IBAs) for the United States, Canada, Mexico, Nicaragua, Peru, and the Caribbean are
            visible for eBird output. The links below provide information about the eBird hotspots in each IBA in Ohio,
            bar charts which collect data from both hotspots and personal locations within the IBA, maps of the IBA, and
            more.
          </p>
        </div>
        <figure className="border p-2 bg-gray-200 text-center text-xs mb-4">
          <img src="/ohio-iba.jpg" className="md:min-w-[300px] mx-auto" />
          <figcaption className="my-3">Map of Ohio Important Bird Areas</figcaption>
        </figure>
      </div>
      <div className="columns-1 sm:columns-3 mb-12">
        {areas.map(({ name, slug }) => (
          <React.Fragment key={slug}>
            <Link href={`/iba/${slug}`} className="font-bold">
              {name}
            </Link>
            <br />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const regionCode = query.region as string;
  const region = getRegion(regionCode);
  if (!region) return { notFound: true };

  const areas = OhioIBA.filter(({ name, slug }) => ({ name, slug })) || [];

  return {
    props: { region, areas },
  };
};
