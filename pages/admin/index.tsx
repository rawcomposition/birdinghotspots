import DashboardPage from "components/DashboardPage";
import Link from "next/link";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import { getDeletedHotspots } from "lib/mongo";
import { Hotspot } from "lib/types";

type Props = {
  deletedHotspots: Hotspot[];
};

export default function Dashboard({ deletedHotspots }: Props) {
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
    </DashboardPage>
  );
}

export const getServerSideProps = getSecureServerSideProps(async (context, token) => {
  const { role } = token;

  const deletedHotspots = await getDeletedHotspots(role === "admin" ? null : token.regions);

  return { props: { deletedHotspots } };
});
