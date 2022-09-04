import * as React from "react";
import DashboardPage from "components/DashboardPage";
import Link from "next/link";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import { getStats } from "lib/mongo";
import States from "data/states.json";
import Stats from "components/Stats";

type Props = {
  data: {
    code: string;
    label: string;
    country: string;
    url: string;
    total: number;
    withImg: number;
  }[];
};

export default function Dashboard({ data }: Props) {
  return (
    <DashboardPage title="Dashboard">
      {data.map(({ code, label, country, url, total, withImg }) => {
        const percent = total > 0 ? Math.round((withImg / total) * 100) : 0;
        const url1 = `${url}/alphabetical-index`;
        const url2 = `/explore?mode=region&region=${country}-${code}&label=${label}`;
        return (
          <div key={code} className="mb-8 group">
            <h3 className="text-lg font-medium leading-6 flex items-center border-b pb-2">
              <Link href={url}>
                <a className="text-gray-900">
                  {label}, {country}
                </a>
              </Link>
              <Link href={`/add?state=${code}&country=${country}`}>
                <a className="text-sm ml-4 font-medium">Add Hotspot</a>
              </Link>
            </h3>
            <Stats
              items={[
                { label: "Hotspots", value: total.toLocaleString(), url: url1 },
                { label: "With photos", value: withImg.toLocaleString(), percent, url: url2 },
              ]}
            />
          </div>
        );
      })}
    </DashboardPage>
  );
}

export const getServerSideProps = getSecureServerSideProps(async (context, token) => {
  const result = await getStats();
  const { role, regions } = token;

  const restructured = result.map(({ _id, count }) => ({
    stateCode: _id.stateCode,
    featuredImg: _id.featuredImg,
    count,
  }));

  const filteredStates = States.filter(({ active, code, country }) => {
    return active && (role === "admin" || regions.includes(code));
  });

  const data = filteredStates.map(({ code, label, country, slug }) => {
    const url = `/${country.toLowerCase()}/${slug}`;
    const withImg = restructured.find((it) => it.stateCode === code && it.featuredImg)?.count || 0;
    const withoutImg = restructured.find((it) => it.stateCode === code && !it.featuredImg)?.count || 0;
    const total = withImg + withoutImg;
    return { code, label, country, url, withImg, total };
  });

  const sorted = data.sort((a, b) => b.total - a.total);

  return { props: { data: sorted } };
});
