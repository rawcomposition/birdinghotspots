import React from "react";
import Link from "next/link";
import { hasFieldConflict } from "lib/conflict";

type ContentFields = {
  about: string;
  birding: string;
  plan: string;
  restrooms: string;
};

type Props = {
  locationId: string;
};

const fieldLabels: { key: keyof ContentFields; label: string }[] = [
  { key: "plan", label: "Plan Your Visit" },
  { key: "birding", label: "How to Bird Here" },
  { key: "about", label: "About this Place" },
  { key: "restrooms", label: "Restrooms" },
];

export default function ContentConflict({ locationId }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<{
    groupName: string;
    primaryHotspotName: string;
    primaryHotspotUrl: string;
    primaryHotspotLocationId: string;
    group: ContentFields;
    hotspot: ContentFields;
  } | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/group/conflict-content?locationId=${locationId}`);
        const json = await res.json();
        if (!json.success) {
          setError("Failed to load content");
          return;
        }
        setData({
          groupName: json.groupName,
          primaryHotspotName: json.primaryHotspotName,
          primaryHotspotUrl: json.primaryHotspotUrl,
          primaryHotspotLocationId: json.primaryHotspotLocationId,
          group: json.group,
          hotspot: json.hotspot,
        });
      } catch {
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    })();
  }, [locationId]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data || !data.hotspot) return <p className="text-gray-500">No primary hotspot found.</p>;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <h4 className="font-bold text-sm text-gray-700">
          Group
          <span className="ml-3 font-normal text-gray-400">–</span>
          <Link href={`/group/${locationId}`} target="_blank" className="ml-2 font-normal text-sm text-[#4a84b2]">View</Link>
          <Link href={`/edit/group/${locationId}`} target="_blank" className="ml-3 font-normal text-sm text-[#4a84b2]">Edit</Link>
        </h4>
        <h4 className="font-bold text-sm text-gray-700">
          Primary Hotspot
          {(data.primaryHotspotUrl || data.primaryHotspotLocationId) && (
            <span className="ml-3 font-normal text-gray-400">–</span>
          )}
          {data.primaryHotspotUrl && (
            <Link href={data.primaryHotspotUrl} target="_blank" className="ml-2 font-normal text-sm text-[#4a84b2]">View</Link>
          )}
          {data.primaryHotspotLocationId && (
            <Link href={`/edit/${data.primaryHotspotLocationId}`} target="_blank" className="ml-3 font-normal text-sm text-[#4a84b2]">Edit</Link>
          )}
        </h4>
      </div>
      {fieldLabels.map(({ key, label }) => {
        const groupVal = data.group[key];
        const hotspotVal = data.hotspot![key];
        const conflict = hasFieldConflict(data.group, data.hotspot!, key);
        const identical = !!groupVal && !!hotspotVal && groupVal === hotspotVal && !(key === "restrooms" && groupVal === "Unknown");
        return (
          <div key={key} className="mb-4">
            <div className="mb-1 flex items-center gap-2">
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${conflict ? "text-red-600 bg-red-50" : "text-gray-500 bg-gray-100"}`}>
                {label}
              </span>
              {identical && <span className="text-xs text-green-700">Identical</span>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {groupVal ? (
                <div
                  className={`text-sm rounded p-2 break-words prose prose-sm max-w-none ${conflict ? "bg-red-50/50 border border-red-200" : "bg-gray-50 border border-gray-200"}`}
                  dangerouslySetInnerHTML={{ __html: groupVal }}
                />
              ) : (
                <div className="text-sm bg-gray-50 border border-gray-200 rounded p-2 break-words">
                  <span className="text-gray-400 italic">Empty</span>
                </div>
              )}
              {hotspotVal ? (
                <div
                  className={`text-sm rounded p-2 break-words prose prose-sm max-w-none ${conflict ? "bg-red-50/50 border border-red-200" : "bg-gray-50 border border-gray-200"}`}
                  dangerouslySetInnerHTML={{ __html: hotspotVal }}
                />
              ) : (
                <div className="text-sm bg-gray-50 border border-gray-200 rounded p-2 break-words">
                  <span className="text-gray-400 italic">Empty</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
