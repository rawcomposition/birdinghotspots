import * as React from "react";
import Link from "next/link";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import EbirdDescription from "components/EbirdDescription";
import admin from "lib/firebaseAdmin";
import { getRegion } from "lib/localData";

type Props = {
  editors: {
    name: string;
    regions: string[];
  }[];
};

export default function About({ editors }: Props) {
  return (
    <div className="container pb-16 mt-12">
      <Title>About</Title>
      <PageHeading>About BirdingHotspots.org</PageHeading>
      <div className="md:grid grid-cols-2 gap-16">
        <div>
          <p className="mb-4">
            <strong>The Birding Hotspots</strong> website collects tips for birding from birders and descriptions and
            maps of eBird hotspots from eBird and other websites. In eBird, hotspots are shared locations where birders
            may report their bird sightings to eBird. Hotspots provide birders with information about birding locations
            where birds are being seen. BirdingHotspots.org is not affiliated with eBird.
          </p>
          <EbirdDescription />
          <p className="mb-4">
            BirdingHotspots.org is an open source project. You can view or contribute to the code on{" "}
            <a href="https://github.com/rawcomposition/birdinghotspots" target="_blank" rel="noreferrer">
              GitHub
            </a>
            . We also release most of the images and content into the Public Domain.{" "}
            <Link href="/license">Learn More</Link>.
          </p>
          <h3 className="text-lg font-bold mb-4 mt-8">Meet the Team</h3>
          <p className="mb-4">
            <strong>Ken Ostermiller</strong>
            <br />
            Ken created and manages the website. He is a volunteer hotspot reviewer for eBird.
          </p>
          <p className="mb-4">
            <strong>Adam Jackson</strong>
            <br />
            Adam is a software developer that recently joined team.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Regional Editors</h3>
          <div className="columns-2">
            {editors?.map(({ name, regions }) => (
              <div key={name} className="mb-4 break-inside-avoid-column">
                <h4 className="text-sm font-bold">{name}</h4>
                <ul className="text-xs">
                  {regions.map((region) => (
                    <li key={region}>{region}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const request = await admin.listUsers();
  const editors = request.users
    .filter(({ customClaims }) => customClaims?.role === "editor")
    .map(({ displayName, customClaims }) => ({
      displayName,
      regions: customClaims?.regions,
    }));

  const formattedEditors = editors.map(({ displayName, regions }) => ({
    name: displayName,
    regions: regions.map((code: string) => getRegion(code)?.detailedName || "Unknown"),
  }));

  return {
    props: {
      editors: formattedEditors,
    },
  };
}
