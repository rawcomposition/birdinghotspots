import React from "react";
import Link from "next/link";
import { ModalFooter } from "providers/modals";

type Hotspot = {
  name: string;
  url: string;
  locationId: string;
};

type Props = {
  locationId: string;
};

export default function GroupHotspots({ locationId }: Props) {
  const [hotspots, setHotspots] = React.useState<Hotspot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const res = await fetch(`/api/group/hotspots?locationId=${locationId}`);
        const data = await res.json();
        if (data.success) {
          setHotspots(data.hotspots);
        } else {
          setError("Failed to load hotspots");
        }
      } catch {
        setError("Failed to load hotspots");
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
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
      <ul className="space-y-1">
        {hotspots.map((hotspot) => (
          <li key={hotspot.locationId}>
            <Link href={hotspot.url} target="_blank">
              {hotspot.name}
            </Link>
          </li>
        ))}
      </ul>
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
