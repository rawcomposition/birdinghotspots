import DashboardPage from "components/DashboardPage";
import Link from "next/link";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import { getImgStats, getContentStats } from "lib/mongo";
import States from "data/states.json";

type Props = {
  data: {
    code: string;
    label: string;
    country: string;
    url: string;
    total: number;
    withImg: number;
    withContent: number;
  }[];
};

export default function Dashboard({ data }: Props) {
  return (
    <DashboardPage title="Dashboard">
      <div className="overflow-hidden shadow md:rounded-lg mb-12">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Region
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[8rem]">
                Hotspots
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[8rem]">
                With Content
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[8rem]">
                With Photos
              </th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map(({ code, label, url, total, withImg, withContent }) => (
              <tr key={code}>
                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  <Link href={url}>{label}</Link>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{total.toLocaleString()}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    {withContent.toLocaleString()}
                    <span className="text-xs">({total > 0 ? Math.round((withContent / total) * 100) : 0}%)</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    {withImg.toLocaleString()}
                    <span className="text-xs">({total > 0 ? Math.round((withImg / total) * 100) : 0}%)</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                  <Link href={`${url}/alphabetical-index`}>
                    <a className="font-medium text-orange-700 hover:text-orange-900">View List</a>
                  </Link>
                  <Link href={`/explore?mode=region&region=${code}&label=${label}`}>
                    <a className="font-medium text-orange-700 hover:text-orange-900 ml-4 mr-2">Explore</a>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardPage>
  );
}

export const getServerSideProps = getSecureServerSideProps(async (context, token) => {
  const imgResult = await getImgStats();
  const contentResult = await getContentStats();
  const { role, regions } = token;

  const imgCount = imgResult.map(({ _id, count }) => ({
    stateCode: _id.stateCode,
    featuredImg: _id.featuredImg,
    count,
  }));

  const contentCount = contentResult.map(({ _id, count }) => ({
    stateCode: _id.stateCode,
    noContent: _id.noContent,
    count,
  }));

  const filteredStates = States.filter(({ active, code, country }) => {
    return active && (role === "admin" || regions.includes(code));
  });

  const data = filteredStates.map(({ code, label, country, slug }) => {
    const url = `/${country.toLowerCase()}/${slug}`;
    const withImg = imgCount.find((it) => it.stateCode === code && it.featuredImg)?.count || 0;
    const withoutImg = imgCount.find((it) => it.stateCode === code && !it.featuredImg)?.count || 0;
    const withoutContent = contentCount.find((it) => it.stateCode === code && it.noContent)?.count || 0;
    const total = withImg + withoutImg;
    const withContent = total - withoutContent;
    return { code, label, country, url, withImg, withContent, total };
  });

  const sorted = data.sort((a, b) => b.total - a.total);

  return { props: { data: sorted } };
});
