import React from "react";
import { GetServerSideProps } from "next";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import { getHotspotsForRegion } from "lib/helpers";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import MapKit from "components/MapKit";
import { Marker } from "lib/types";

type Hotspot = {
  locationId: string;
  name: string;
  lat: number;
  lng: number;
  total: number;
  subnational1Code: string;
  subnational2Code: string;
};

type Props = {
  regionCode: string;
  duplicateHotspots: {
    name: string;
    hotspots: Hotspot[];
  }[];
};

export default function DuplicateHotspots({ regionCode, duplicateHotspots }: Props) {
  const [isClientReady, setIsClientReady] = React.useState<boolean>(false);
  const [reviewed, setReviewed] = React.useState<Set<string>>(new Set());
  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    const initial = new Set<string>();
    duplicateHotspots.forEach((item) => {
      initial.add(item.name);
    });
    return initial;
  });

  React.useEffect(() => {
    setIsClientReady(true);
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
    setReviewed((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(name);
        setExpanded((exp) => {
          const nextExp = new Set(exp);
          nextExp.delete(name);
          return nextExp;
        });
      } else {
        next.delete(name);
        setExpanded((exp) => {
          const nextExp = new Set(exp);
          nextExp.add(name);
          return nextExp;
        });
      }
      return next;
    });
  };

  return (
    <div className="container pb-16 mt-12">
      <Title>{`Hotspot Issues - ${regionCode}`}</Title>
      <PageHeading>Hotspot Issues - {regionCode}</PageHeading>

      <h3 className="text-lg mb-1 font-bold">Duplicate Hotspots</h3>
      <p className="text-sm text-gray-600 mb-4">The following hotspots share the same exact GPS coordinates.</p>
      <div className="space-y-6 mt-8">
        {duplicateHotspots.map((duplicateHotspot) => {
          const isExpanded = expanded.has(duplicateHotspot.name);
          const isReviewed = reviewed.has(duplicateHotspot.name);

          return (
            <div key={duplicateHotspot.name} className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-t-lg border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(duplicateHotspot.name)}
                    className="hover:bg-gray-200 rounded-md p-1 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-500 -rotate-90" />
                    )}
                  </button>
                  <h2 className="font-bold text-gray-700">{duplicateHotspot.name}</h2>
                </div>
                <label className="flex items-center gap-2 cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={isReviewed}
                    onChange={(e) => handleReviewedChange(duplicateHotspot.name, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Reviewed</span>
                </label>
              </div>
              {isExpanded && (
                <div className="px-6 pt-3 pb-4">
                  <div className="flex gap-6">
                    <div className="flex-1 space-y-3">
                      {duplicateHotspot.hotspots.map((hotspot) => (
                        <div
                          key={hotspot.locationId}
                          className="flex items-center justify-between pt-2 pb-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{hotspot.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-mono">{hotspot.locationId}</span>
                              <span className="mx-2">•</span>
                              {hotspot.total > 0 && <span>{hotspot.total} species</span>}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4 text-sm">
                            <a
                              href={`https://ebird.org/hotspot/${hotspot.locationId}`}
                              className="font-semibold"
                              target="_blank"
                              rel="noreferrer"
                            >
                              View Details
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
                    </div>
                    <div className="w-96 flex-shrink-0">
                      {isClientReady && (
                        <MapKit
                          key={duplicateHotspot.name}
                          markers={duplicateHotspot.hotspots.map((hotspot) => ({
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
                          disableScroll
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
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const regionCode = query.region as string;
  if (!regionCode) return { notFound: true };
  if (regionCode === "US") return { notFound: true };

  const coordinateMap = new Map<string, Hotspot[]>();

  let hotspots: Hotspot[];
  try {
    hotspots = await getHotspotsForRegion(regionCode);
  } catch {
    return { notFound: true };
  }

  hotspots.forEach((hotspot) => {
    const coordKey = `${hotspot.lat},${hotspot.lng}`;
    if (!coordinateMap.has(coordKey)) {
      coordinateMap.set(coordKey, []);
    }
    coordinateMap.get(coordKey)!.push(hotspot);
  });

  const duplicateHotspots = Array.from(coordinateMap.entries())
    .filter(([_, hotspots]) => hotspots.length > 1)
    .map(([coords, hotspots]) => ({
      name: `${hotspots.map((hotspot) => hotspot.locationId).join(", ")}`,
      hotspots,
    }));

  return {
    props: { regionCode, duplicateHotspots },
  };
};
