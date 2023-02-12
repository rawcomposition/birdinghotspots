import * as React from "react";
import Link from "next/link";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import States from "data/states.json";
import { cities } from "data/uscities";

export default function Cities() {
  const activeStates = States.filter((state) => state.active && state.country === "US");
  const minPopulation = 20000;
  return (
    <div className="container pb-16 mt-12">
      <Title>US Cities</Title>
      <PageHeading breadcrumbs={false}>US Cities</PageHeading>
      <p className="mb-8 -mt-8 text-lg text-gray-600 font-medium">
        Find the best hotspots in various cities around the US.
      </p>
      <div className="md:columns-4">
        {activeStates.map(({ code, label }) => (
          <div key={code} className="mb-8">
            <h2 className="text-xl font-bold mb-2">{label}</h2>
            <ul>
              {cities
                .filter((city) => city.state === code.replace("US-", "") && city.pop >= minPopulation)
                .map(({ name }) => (
                  <li key={name}>
                    <Link href={`/cities/${name.toLowerCase().replace(/ /g, "-")}`}>{name}</Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
