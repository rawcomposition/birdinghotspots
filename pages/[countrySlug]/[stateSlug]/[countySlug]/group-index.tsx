import * as React from "react";
import Link from "next/link";
import { getGroupsByCounty } from "lib/mongo";
import { getState, getCountyBySlug } from "lib/localData";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { State, County } from "lib/types";

type Props = {
  countrySlug: string;
  county: County;
  state: State;
  groups: {
    name: string;
    url: string;
    noContent?: boolean;
    needsDeleting?: boolean;
  }[];
};

export default function AlphabeticalIndex({ countrySlug, state, county, groups }: Props) {
  let activeLetters = groups.map((group) => group.name.charAt(0).toUpperCase());
  activeLetters = [...new Set(activeLetters)];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Group Index - ${county.name}, ${state.label}, ${state.country}`}</Title>
      <PageHeading countrySlug={countrySlug} state={state} county={county}>
        Group Index
      </PageHeading>

      <p>
        {alphabet.map((letter) => {
          if (activeLetters.includes(letter)) {
            return (
              <Link key={letter} href={`#${letter}`}>
                <a className="inline-block mr-3 text-lg">{letter.toUpperCase()}</a>
              </Link>
            );
          }
          return (
            <span className="inline-block mr-3 text-gray-300 text-lg" key={letter}>
              {letter}
            </span>
          );
        })}
      </p>
      {groups.map(({ name, url }, i, array) => {
        const prev = i === 0 ? null : array[i - 1];
        const isNumber = !isNaN(parseInt(name.charAt(0)));
        const showLetter = prev ? name.charAt(0) !== prev.name.charAt(0) && !isNumber : true;
        return (
          <React.Fragment key={url}>
            {showLetter && (
              <h2 id={name[0]} className="font-bold mt-4 mb-2">
                {isNumber ? "" : name[0].toUpperCase()}
              </h2>
            )}
            <Link href={url}>{name}</Link>
            <br />
          </React.Fragment>
        );
      })}
      <p className="mt-4">
        Total: <strong>{groups?.length?.toLocaleString()}</strong>
      </p>
    </div>
  );
}

interface Params extends ParsedUrlQuery {
  stateSlug: string;
  countrySlug: string;
  countySlug: string;
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { countrySlug, stateSlug, countySlug } = query as Params;
  const state = getState(stateSlug);
  if (!state) return { notFound: true };
  const county = getCountyBySlug(state.code, countySlug);
  if (!county) return { notFound: true };

  const groups = (await getGroupsByCounty(county.code)) || [];

  return {
    props: { countrySlug, state, county, groups },
  };
};