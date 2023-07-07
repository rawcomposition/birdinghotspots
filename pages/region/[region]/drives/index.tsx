import * as React from "react";
import Link from "next/link";
import { getDrivesByState } from "lib/mongo";
import { getRegion, restructureDrivesByCounty } from "lib/localData";
import PageHeading from "components/PageHeading";
import { GetServerSideProps } from "next";
import { DrivesByCounty, Region } from "lib/types";
import Title from "components/Title";
import EditorActions from "components/EditorActions";

type Props = {
  region: Region;
  drives: DrivesByCounty;
};

export default function Drives({ region, drives }: Props) {
  return (
    <div className="container pb-16 mt-12">
      <Title>{`Birding Drives - ${region.detailedName}`}</Title>
      <PageHeading region={region}>Birding Drives</PageHeading>
      <EditorActions className="-mt-12" requireRegion={region.code}>
        <Link href={`/region/${region.code}/drives/edit/new`}>Add Drive</Link>
      </EditorActions>
      <div className="md:flex gap-8 items-start mb-8">
        <div>
          <p className="mb-4">
            <strong>Birding Drives</strong> are routes for birding trips that can be accomplished in one day, stopping
            to walk and bird at various eBird hotspots. For each Birding Drive, a Google map is provided with the route
            and suggested stops at eBird hotspots. You may save the link to the Google map on your smartphone or tablet,
            or print a copy on paper to take with you. Links are provided for each eBird hotspot. Follow those links for
            information about birding each location.
          </p>
          <p className="mb-4">
            Feedback is especially welcome with suggestions for improving the driving directions on these birding
            drives. Additional tips for birding locations are also welcome. Please send us any suggestions for
            additional county drives or edits for existing drives using the&nbsp;
            <Link href={`/contact`}>contact form</Link>.
          </p>
        </div>
        <figure className="border p-2 bg-gray-200 text-center text-xs mb-4">
          <img src="/funk-bottoms.jpg" className="md:min-w-[300px] mx-auto" />
          <figcaption className="my-3">Funk Bottoms Wildlife Area, Ohio</figcaption>
        </figure>
      </div>
      <h3 className="text-lg mb-8 font-bold">Birding Drives Listed by County</h3>
      <div className="columns-1 sm:columns-3 mb-12">
        {drives.map(({ countyCode, countyName, drives }) => (
          <p key={countyCode} className="mb-4 break-inside-avoid">
            <Link href={`/region/${countyCode}`} className="font-bold">
              {countyName}
            </Link>
            <br />
            {drives.map(({ name, url }) => (
              <React.Fragment key={url}>
                <Link href={url}>{name}</Link>
                <br />
              </React.Fragment>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const regionCode = query.region as string;
  const region = getRegion(regionCode);
  const isState = regionCode.split("-").length === 2;
  if (!region || !isState) return { notFound: true };

  const drives = (await getDrivesByState(regionCode)) || [];
  const drivesByCounty = await restructureDrivesByCounty(drives as any, regionCode);

  return {
    props: { region, drives: drivesByCounty },
  };
};
