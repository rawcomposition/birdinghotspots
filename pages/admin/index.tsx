import DashboardPage from "components/DashboardPage";
import Link from "next/link";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import { getImgStats, getDeletedHotspots } from "lib/mongo";
import States from "data/states.json";
import { Hotspot } from "lib/types";

type Props = {
  deletedHotspots: Hotspot[];
  data: {
    code: string;
    label: string;
    country: string;
    url: string;
    total: number;
    withImg: number;
  }[];
};

export default function Dashboard({ data, deletedHotspots }: Props) {
  return (
    <DashboardPage title="Dashboard">
      {!!deletedHotspots?.length && (
        <section className="p-6 pt-5 overflow-hidden shadow md:rounded-lg bg-white mb-4">
          <h3 className="text-lg font-bold mb-1">Hotspots Pending Deletion</h3>
          <p className="text-sm text-gray-500 mb-4">
            The following hotspots have been deleted from eBird and should be removed from BirdingHotspots.org.
          </p>
          {deletedHotspots.map((hotspot) => (
            <div key={hotspot._id} className="flex items-center gap-2 mt-2">
              <Link href={hotspot.url} className="font-bold text-sm" target="_blank">
                {hotspot.name}
              </Link>
              <span className="text-xs text-gray-500">({hotspot.stateCode?.replace("-", ", ")})</span>
            </div>
          ))}
        </section>
      )}
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
                With Photos
              </th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map(({ code, label, url, total, withImg }) => (
              <tr key={code}>
                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  <Link href={url}>{label}</Link>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{total.toLocaleString()}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    {withImg.toLocaleString()}
                    <span className="text-xs">({total > 0 ? Math.round((withImg / total) * 100) : 0}%)</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                  <Link
                    href={`/region/${code}/hotspot-index`}
                    className="font-medium text-orange-700 hover:text-orange-900"
                  >
                    View List
                  </Link>
                  <Link
                    href={`/region/${code}/hotspots`}
                    className="font-medium text-orange-700 hover:text-orange-900 ml-4 mr-2"
                  >
                    Explore
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
  const { role, regions } = token;
  const imgResult = await getImgStats();

  const imgCount = imgResult.map(({ _id, count }) => ({
    stateCode: _id.stateCode,
    featuredImg: _id.featuredImg,
    count,
  }));

  const filteredStates = States.filter(({ active, code }) => {
    return active && (role === "admin" || regions.includes(code));
  });

  const data = filteredStates.map(({ code, label }) => {
    const url = `/region/${code}`;
    const withImg = imgCount.find((it) => it.stateCode === code && it.featuredImg)?.count || 0;
    const withoutImg = imgCount.find((it) => it.stateCode === code && !it.featuredImg)?.count || 0;
    const total = withImg + withoutImg;
    return { code, label, url, withImg, total };
  });

  const sorted = data.sort((a, b) => b.total - a.total);

  const deletedHotspots = await getDeletedHotspots(role === "admin" ? null : token.regions);

  return { props: { data: sorted, deletedHotspots } };
});
