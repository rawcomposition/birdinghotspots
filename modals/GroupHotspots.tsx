import React from "react";
import Link from "next/link";
import { ModalFooter } from "providers/modals";
import useSecureFetch from "hooks/useSecureFetch";

type Hotspot = {
  name: string;
  url: string;
  locationId: string;
};

type NearbyHotspot = {
  name: string;
  url: string;
  _id: string;
};

type Props = {
  locationId: string;
};

export default function GroupHotspots({ locationId }: Props) {
  const { send } = useSecureFetch();
  const [hotspots, setHotspots] = React.useState<Hotspot[]>([]);
  const [nearby, setNearby] = React.useState<NearbyHotspot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [addingId, setAddingId] = React.useState<string | null>(null);
  const [primaryLocationId, setPrimaryLocationId] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/group/hotspots?locationId=${locationId}`);
      const data = await res.json();
      if (!data.success) {
        setError("Failed to load hotspots");
        return;
      }
      setHotspots(data.hotspots);
      setNearby(data.nearby || []);
      setPrimaryLocationId(data.primaryLocationId || null);
    } catch {
      setError("Failed to load hotspots");
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddToGroup = async (hotspot: NearbyHotspot) => {
    setAddingId(hotspot._id);
    try {
      const data = await send({
        url: "/api/group/add-hotspot",
        method: "POST",
        data: { groupLocationId: locationId, hotspotId: hotspot._id },
      });
      if (data?.success) {
        await fetchData();
      }
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (hotspots.length === 0) {
    return <p className="text-gray-500">No hotspots found.</p>;
  }

  return (
    <>
      <h4 className="font-bold text-sm text-gray-700 mb-2">
        Child Hotspots
        {!primaryLocationId && (
          <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-normal">No Primary</span>
        )}
      </h4>
      <ul className="space-y-1">
        {hotspots.map((hotspot) => (
          <li key={hotspot.locationId}>
            <Link href={hotspot.url} target="_blank">
              {hotspot.name}
            </Link>
            {hotspot.locationId === primaryLocationId && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Primary</span>
            )}
          </li>
        ))}
      </ul>
      {nearby.length > 0 && (
        <div className="mt-6">
          <h4 className="font-bold text-sm text-gray-700 mb-2 border-t pt-4">Nearby Hotspots</h4>
          <p className="text-xs text-gray-600 mb-2">The following hotspots are roughly within the group&apos;s footprint.</p>
          <table className="w-full text-sm border border-gray-200 rounded">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500">
                <th className="py-1.5 px-3 font-medium">Hotspot</th>
                <th className="py-1.5 px-3 font-medium text-right">Add to Group</th>
              </tr>
            </thead>
            <tbody>
              {nearby.map((hotspot) => (
                <tr key={hotspot._id} className="border-t border-gray-200">
                  <td className="py-1.5 px-3">
                    <Link href={hotspot.url} target="_blank">
                      {hotspot.name}
                    </Link>
                  </td>
                  <td className="py-1.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleAddToGroup(hotspot)}
                      disabled={addingId === hotspot._id}
                      className="text-xs text-[#4a84b2] hover:text-[#3a6a8f] disabled:opacity-50"
                    >
                      {addingId === hotspot._id ? "Adding..." : "Add"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ModalFooter>
        <div className="flex gap-4 text-sm">
          <Link href={`/group/${locationId}`} target="_blank">
            View Group
          </Link>
          <Link href={`/edit/group/${locationId}`} target="_blank">
            Edit Group
          </Link>
        </div>
      </ModalFooter>
    </>
  );
}
