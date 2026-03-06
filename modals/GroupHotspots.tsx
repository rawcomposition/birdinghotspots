import React from "react";
import Link from "next/link";
import { ModalFooter } from "providers/modals";

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
  const [hotspots, setHotspots] = React.useState<Hotspot[]>([]);
  const [nearby, setNearby] = React.useState<NearbyHotspot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/group/hotspots?locationId=${locationId}`);
        const data = await res.json();
        if (!data.success) {
          setError("Failed to load hotspots");
          setLoading(false);
          return;
        }
        setHotspots(data.hotspots);
        setNearby(data.nearby || []);
      } catch {
        setError("Failed to load hotspots");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [locationId]);

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
      <h4 className="font-bold text-sm text-gray-700 mb-2">Child Hotspots</h4>
      <ul className="space-y-1">
        {hotspots.map((hotspot) => (
          <li key={hotspot.locationId}>
            <Link href={hotspot.url} target="_blank">
              {hotspot.name}
            </Link>
          </li>
        ))}
      </ul>
      {nearby.length > 0 && (
        <div className="mt-6">
          <h4 className="font-bold text-sm text-gray-700 mb-2 border-t pt-4">Nearby Hotspots</h4>
          <p className="text-xs text-gray-600 mb-2">The following hotspots are roughly within the group's footprint.</p>
          <ul className="space-y-1">
            {nearby.map((hotspot) => (
              <li key={hotspot._id}>
                <Link href={hotspot.url} target="_blank">
                  {hotspot.name}
                </Link>
              </li>
            ))}
          </ul>
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
