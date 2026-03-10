import React from "react";
import Link from "next/link";
import { Editor } from "@tinymce/tinymce-react";
import { config as tinymceConfig } from "lib/tinymce";
import { hasFieldConflict } from "lib/conflict";
import { ModalFooter } from "providers/modals";
import BtnSmall from "components/BtnSmall";
import useSecureFetch from "hooks/useSecureFetch";
import toast from "react-hot-toast";

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

const restroomOptions = ["Yes", "No", "Unknown"];

function RestroomRadio({ value, onChange, name }: { value: string; onChange: (v: string) => void; name: string }) {
  return (
    <div className="flex gap-4 items-center py-1">
      {restroomOptions.map((opt) => (
        <label key={opt} className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

export default function ContentConflict({ locationId }: Props) {
  const { send, loading: saving } = useSecureFetch();
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
  const [groupEdits, setGroupEdits] = React.useState<ContentFields | null>(null);
  const [hotspotEdits, setHotspotEdits] = React.useState<ContentFields | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/group/conflict-content?locationId=${locationId}`);
      const json = await res.json();
      if (!json.success) {
        setError("Failed to load content");
        return;
      }
      const groupContent = json.group as ContentFields;
      const hotspotContent = json.hotspot as ContentFields;
      setData({
        groupName: json.groupName,
        primaryHotspotName: json.primaryHotspotName,
        primaryHotspotUrl: json.primaryHotspotUrl,
        primaryHotspotLocationId: json.primaryHotspotLocationId,
        group: groupContent,
        hotspot: hotspotContent,
      });
      setGroupEdits(groupContent);
      setHotspotEdits(hotspotContent);
    } catch {
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!data || !groupEdits || !hotspotEdits) return;
    const result = await send({
      url: "/api/group/save-content",
      method: "POST",
      data: {
        groupLocationId: locationId,
        hotspotLocationId: data.primaryHotspotLocationId,
        group: groupEdits,
        hotspot: hotspotEdits,
      },
    });
    if (result?.success) {
      toast.success("Saved");
      setData((prev) => prev ? { ...prev, group: { ...groupEdits }, hotspot: { ...hotspotEdits } } : prev);
    }
  };

  const handleGroupChange = (key: keyof ContentFields, value: string) => {
    setGroupEdits((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const handleHotspotChange = (key: keyof ContentFields, value: string) => {
    setHotspotEdits((prev) => prev ? { ...prev, [key]: value } : prev);
  };

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
        </h4>
        <h4 className="font-bold text-sm text-gray-700">
          Primary Hotspot
          {data.primaryHotspotUrl && (
            <>
              <span className="ml-3 font-normal text-gray-400">–</span>
              <Link href={data.primaryHotspotUrl} target="_blank" className="ml-2 font-normal text-sm text-[#4a84b2]">View</Link>
            </>
          )}
        </h4>
      </div>
      {fieldLabels.map(({ key, label }) => {
        const groupVal = groupEdits?.[key] || "";
        const hotspotVal = hotspotEdits?.[key] || "";
        const conflict = hasFieldConflict(groupEdits || data.group, hotspotEdits || data.hotspot!, key);
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
              {key === "restrooms" ? (
                <>
                  <RestroomRadio value={groupEdits?.restrooms || "Unknown"} onChange={(v) => handleGroupChange("restrooms", v)} name="group-restrooms" />
                  <RestroomRadio value={hotspotEdits?.restrooms || "Unknown"} onChange={(v) => handleHotspotChange("restrooms", v)} name="hotspot-restrooms" />
                </>
              ) : (
                <>
                  <div className={conflict ? "editor-conflict" : ""}>
                    <Editor
                      tinymceScriptSrc={process.env.NEXT_PUBLIC_DOMAIN + "/tinymce/tinymce.min.js"}
                      id={`group-${key}-${locationId}`}
                      initialValue={groupEdits?.[key] || ""}
                      init={tinymceConfig}
                      onEditorChange={(value) => handleGroupChange(key, value)}
                    />
                  </div>
                  <div className={conflict ? "editor-conflict" : ""}>
                    <Editor
                      tinymceScriptSrc={process.env.NEXT_PUBLIC_DOMAIN + "/tinymce/tinymce.min.js"}
                      id={`hotspot-${key}-${locationId}`}
                      initialValue={hotspotEdits?.[key] || ""}
                      init={tinymceConfig}
                      onEditorChange={(value) => handleHotspotChange(key, value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
      <ModalFooter>
        <BtnSmall type="button" color="green" onClick={handleSave} disabled={saving} className="px-4">
          {saving ? "Saving..." : "Save"}
        </BtnSmall>
      </ModalFooter>
    </div>
  );
}
