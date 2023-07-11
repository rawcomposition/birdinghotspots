import DashboardPage from "components/DashboardPage";
import Link from "next/link";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import { getImgStats, getDeletedHotspots } from "lib/mongo";
import SyncRegions from "data/sync-regions.json";
import { Hotspot, Region } from "lib/types";
import { getRegion } from "lib/localData";

type Props = {
  deletedHotspots: Hotspot[];
  data: {
    code: string;
    name: string;
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
      <section className="p-6 pt-5 overflow-hidden shadow md:rounded-lg bg-white mb-4">
        <h3 className="text-lg font-bold mb-1">Review Content</h3>
        <div className="flex gap-4">
          <Link href="/admin/revision-review" className="font-bold text-sm">
            Review Suggestions
          </Link>
          <Link href="/admin/image-review" className="font-bold text-sm">
            Review Images
          </Link>
        </div>
      </section>
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
            {data.map(({ code, name, total, withImg }) => (
              <tr key={code}>
                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  <Link href={`/region/${code}`}>{name}</Link>
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
  const filteredRegionCodes = SyncRegions.filter((code) => {
    return token.role === "admin" || token.regions.includes(code);
  });

  const imgResult = await getImgStats(filteredRegionCodes);

  const imgCount = imgResult.map(({ _id, count }) => ({
    regionCode: _id.stateCode || _id.countryCode,
    featuredImg: _id.featuredImg,
    count,
  }));

  const regions = filteredRegionCodes.map((code) => getRegion(code)).filter(Boolean) as Region[];

  const data = regions.map(({ name, code }) => {
    const withImg = imgCount.find((it) => it.regionCode === code && it.featuredImg)?.count || 0;
    const withoutImg = imgCount.find((it) => it.regionCode === code && !it.featuredImg)?.count || 0;
    const total = withImg + withoutImg;
    return { code, name, withImg, total };
  });

  const sorted = data.sort((a, b) => b.total - a.total);

  const deletedHotspots = await getDeletedHotspots(token.role === "admin" ? null : token.regions);

  return { props: { data: sorted, deletedHotspots } };
});
