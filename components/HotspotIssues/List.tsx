import React from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import MapKit from "components/HotspotIssues/MapKit";
import { useLocalStorage } from "hooks/useLocalStorage";
import { Hotspot } from "pages/hotspot-issues/[region]";
import RegionBadge from "components/HotspotIssues/RegionBadge";

type Props = {
  hotspotClusters: {
    name: string;
    hotspots: Hotspot[];
    hasOverlappingMarkers: boolean;
  }[];
};

export default function HotspotIssuesList({ hotspotClusters }: Props) {
  const [isClientReady, setIsClientReady] = React.useState<boolean>(false);
  const [reviewedArray, setReviewedArray] = useLocalStorage<string[]>("reviewed", []);
  const reviewed = React.useMemo(() => new Set(reviewedArray), [reviewedArray]);
  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    const initial = new Set<string>();
    hotspotClusters.forEach((item) => {
      if (!reviewed.has(item.name)) {
        initial.add(item.name);
      }
    });
    return initial;
  });

  React.useEffect(() => {
    setIsClientReady(true);

    const handleError = (event: ErrorEvent) => {
      const message = event.message || event.error?.message || "";
      if (
        message.includes("message channel closed") ||
        message.includes("asynchronous response") ||
        message.includes("Extension context invalidated")
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason || "");
      if (
        message.includes("message channel closed") ||
        message.includes("asynchronous response") ||
        message.includes("Extension context invalidated")
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection, true);

    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, true);
    };
  }, []);

  const toggleExpanded = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleReviewedChange = (name: string, checked: boolean) => {
    setReviewedArray((prev) => {
      const next = new Set(prev);
      if (checked) next.add(name);
      else next.delete(name);
      return Array.from(next);
    });

    setExpanded((prev) => {
      const next = new Set(prev);
      if (checked) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="space-y-6 mt-8">
      {hotspotClusters.map((cluster) => {
        const isExpanded = expanded.has(cluster.name);
        const isReviewed = reviewed.has(cluster.name);
        const subregions = cluster.hotspots
          .map((it) => it.subnational2Code || it.subnational1Code || it.countryCode)
          .filter(Boolean);
        const uniqueSubregions = [...new Set(subregions)];
        const hasMultipleSubregions = uniqueSubregions.length > 1;

        return (
          <div key={cluster.name} className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-t-lg border-b border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleExpanded(cluster.name)}
                  className="hover:bg-gray-200 rounded-md p-1 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500 -rotate-90" />
                  )}
                </button>
                <h2 className="font-bold text-gray-700">{cluster.name}</h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={isReviewed}
                  onChange={(e) => handleReviewedChange(cluster.name, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Reviewed</span>
              </label>
            </div>
            {isExpanded && (
              <div className="px-6 pt-3 pb-4">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-3">
                    {cluster.hotspots.map((hotspot) => (
                      <div
                        key={hotspot.locationId}
                        className="sm:flex items-center justify-between pt-2 pb-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                            {hotspot.name}
                            {hasMultipleSubregions && (
                              <RegionBadge
                                region={hotspot.subnational2Code || hotspot.subnational1Code || hotspot.countryCode}
                              />
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-mono">{hotspot.locationId}</span>
                            <span className="mx-2">•</span>
                            {hotspot.checklists > 0 && (
                              <span>
                                {hotspot.checklists} complete {hotspot.checklists === 1 ? "checklist" : "checklists"}
                              </span>
                            )}
                            <span className="mx-2">•</span>
                            {hotspot.total > 0 && <span>{hotspot.total} species</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 sm:ml-4 mt-2 sm:mt-0 text-sm">
                          <a
                            href={`https://ebird.org/hotspot/${hotspot.locationId}`}
                            className="font-semibold"
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Hotspot
                          </a>
                          <span className="text-gray-300">|</span>
                          <a
                            href={`https://ebird.org/mylocations/edit/${hotspot.locationId}`}
                            className="font-semibold"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Manage
                          </a>
                        </div>
                      </div>
                    ))}
                    {cluster.hasOverlappingMarkers && (
                      <div className="mt-4 p-3 border border-yellow-800/50 rounded-md">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> Some hotspots are plotted directly on top of each other due to
                          extremely close proximity. To fix this, slightly move the hotspot with fewer checklists, then
                          merge it into the one with more checklists in a second step.
                        </p>
                      </div>
                    )}
                    {hasMultipleSubregions && (
                      <div className="mt-4 p-3 border border-purple-800/50 rounded-md">
                        <p className="text-sm text-purple-800">
                          <strong>Note:</strong> Hotspots in this cluster span multiple subregions.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="w-full lg:w-96 flex-shrink-0">
                    {isClientReady && (
                      <MapKit
                        key={cluster.name}
                        markers={cluster.hotspots.map((hotspot) => ({
                          name: hotspot.name,
                          lat: hotspot.lat,
                          lng: hotspot.lng,
                          type: "hotspot",
                          url: `https://ebird.org/hotspot/${hotspot.locationId}`,
                          customLink: {
                            label: "Manage",
                            url: `https://ebird.org/mylocations/edit/${hotspot.locationId}`,
                          },
                          species: hotspot.total,
                        }))}
                        zoom={12}
                        useTargetBlank
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
