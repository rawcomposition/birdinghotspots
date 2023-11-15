import React from "react";
import Link from "next/link";
import { getGroupsByRegion } from "lib/mongo";
import { getRegion } from "lib/localData";
import { GetServerSideProps } from "next";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { Region } from "lib/types";

type Props = {
  region: Region;
  groups: {
    name: string;
    url: string;
    noContent?: boolean;
    needsDeleting?: boolean;
  }[];
};

export default function AlphabeticalIndex({ region, groups }: Props) {
  let activeLetters = groups.map((group) => group.name.charAt(0).toUpperCase());
  activeLetters = [...new Set(activeLetters)];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Group Index - ${region.detailedName}`}</Title>
      <PageHeading region={region}>Group Locations</PageHeading>

      <p>
        {alphabet.map((letter) => {
          if (activeLetters.includes(letter)) {
            return (
              <Link key={letter} href={`#${letter}`} className="inline-block mr-3 text-lg">
                {letter.toUpperCase()}
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

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const regionCode = query.region as string;
  const region = getRegion(regionCode);
  if (!region) return { notFound: true };

  const groups = (await getGroupsByRegion(regionCode)) || [];

  return {
    props: { region, groups },
  };
};
