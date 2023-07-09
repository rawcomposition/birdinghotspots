import * as React from "react";
import Link from "next/link";
import { HotspotsByCounty } from "lib/types";

type Props = {
  hotspots: HotspotsByCounty;
};

export default function ListHotspotsByCounty({ hotspots }: Props) {
  return (
    <>
      {hotspots.map(({ countyCode, countyName, hotspots }) => (
        <p key={countyCode} className="mb-4 break-inside-avoid">
          <Link href={`/region/${countyCode}`} className="font-bold">
            {countyName}
          </Link>
          <br />
          {hotspots.map(({ name, url }) => (
            <React.Fragment key={url}>
              <Link href={url}>{name}</Link>
              <br />
            </React.Fragment>
          ))}
        </p>
      ))}
    </>
  );
}
