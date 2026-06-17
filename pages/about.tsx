import React from "react";
import Link from "next/link";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import EbirdDescription from "components/EbirdDescription";
import { getRegion } from "lib/localData";
import SyncRegions from "data/sync-regions.json";
import RegionalEditors from "data/regional-editors.json";

type EditorRecord = {
  name: string;
  regions: string[];
};

const editors = RegionalEditors as EditorRecord[];

const regions = SyncRegions.map((code) => ({
  name: getRegion(code)?.detailedName || code,
  editors: editors
    .filter((editor) => editor.regions.includes(code))
    .map((editor) => editor.name),
}))
  .filter((region) => region.editors.length > 0)
  .sort((a, b) => a.name.localeCompare(b.name));

export default function About() {
  const [search, setSearch] = React.useState<string>("");

  const filteredRegions = regions.filter(({ name }) => name.toLowerCase().includes(search.toLowerCase()));

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
          <input
            className="form-input mb-4"
            type="search"
            placeholder="Search by region name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="columns-2">
            {filteredRegions?.map(({ name, editors }) => (
              <div key={name} className="mb-4 break-inside-avoid-column">
                <h4 className="text-sm font-bold">{name}</h4>
                <ul className="text-xs">
                  {editors.map((editorName) => (
                    <li key={editorName}>{editorName}</li>
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
