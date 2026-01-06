import React from "react";
import { Marker } from "lib/types";
import { getMarkerShade } from "lib/helpers";

declare global {
  interface Window {
    mapkit: any;
  }
}

type Props = {
  markers: (Marker & { customLink?: { label: string; url: string } })[];
  zoom: number;
  disableScroll?: boolean;
  useTargetBlank?: boolean;
};

let mapkitScriptLoading = false;
let mapkitScriptLoaded = false;
let mapkitInitialized = false;
const mapkitLoadCallbacks: Set<() => void> = new Set();

const loadMapkitScript = (key: string, onLoad: () => void): void => {
  if (mapkitScriptLoaded && window.mapkit && window.mapkit.Map) {
    onLoad();
    return;
  }

  mapkitLoadCallbacks.add(onLoad);

  if (mapkitScriptLoading) {
    return;
  }

  mapkitScriptLoading = true;

  if (document.querySelector('script[src*="mapkit.js"]')) {
    const checkInterval = setInterval(() => {
      if (window.mapkit && window.mapkit.Map) {
        clearInterval(checkInterval);
        mapkitScriptLoaded = true;
        mapkitScriptLoading = false;
        if (!mapkitInitialized && key) {
          try {
            window.mapkit.init({
              authorizationCallback: (done: (token: string) => void) => {
                done(key);
              },
            });
            mapkitInitialized = true;
          } catch (error) {
            console.error("Error initializing MapKit:", error);
          }
        }
        mapkitLoadCallbacks.forEach((callback) => callback());
        mapkitLoadCallbacks.clear();
      }
    }, 50);
    return;
  }

  const script = document.createElement("script");
  script.src = "https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.onload = () => {
    mapkitScriptLoaded = true;
    mapkitScriptLoading = false;
    if (key && window.mapkit && !mapkitInitialized) {
      try {
        window.mapkit.init({
          authorizationCallback: (done: (token: string) => void) => {
            done(key);
          },
        });
        mapkitInitialized = true;
      } catch (error) {
        console.error("Error initializing MapKit:", error);
      }
    }
    mapkitLoadCallbacks.forEach((callback) => callback());
    mapkitLoadCallbacks.clear();
  };
  script.onerror = () => {
    console.error("Failed to load MapKit script");
    mapkitScriptLoading = false;
    mapkitLoadCallbacks.clear();
  };
  document.head.appendChild(script);
};

export default function HotspotIssueMapKit({ markers, zoom, disableScroll, useTargetBlank }: Props) {
  const [mapkitLoaded, setMapkitLoaded] = React.useState<boolean>(false);
  const [isVisible, setIsVisible] = React.useState<boolean>(false);
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<any>(null);
  const annotationsRef = React.useRef<any[]>([]);
  const markerCount = markers.length;

  const keys = process.env.NEXT_PUBLIC_MAPKIT_KEY?.split(",") || [];
  const key = keys[Math.floor(Math.random() * keys.length)] || "";

  React.useEffect(() => {
    if (typeof window === "undefined" || !mapContainer.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { rootMargin: "50px" }
    );

    observer.observe(mapContainer.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined" || !isVisible) return;

    if (window.mapkit && window.mapkit.Map) {
      setMapkitLoaded(true);
      return;
    }

    loadMapkitScript(key, () => {
      if (window.mapkit && window.mapkit.Map) {
        setMapkitLoaded(true);
      }
    });
  }, [key, isVisible]);

  React.useEffect(() => {
    if (!mapContainer.current || !mapkitLoaded || markers.length === 0 || !window.mapkit || !window.mapkit.Map) return;

    if (!isVisible) {
      if (map.current) {
        try {
          if (annotationsRef.current.length > 0) {
            map.current.removeAnnotations(annotationsRef.current);
            annotationsRef.current = [];
          }
          map.current.destroy();
          map.current = null;
        } catch (error) {
          console.error("Error destroying MapKit map:", error);
        }
      }
      return;
    }

    if (!map.current) {
      const firstMarker = markers[0];
      if (!firstMarker || typeof firstMarker.lat !== "number" || typeof firstMarker.lng !== "number") return;

      if (!mapContainer.current.offsetParent && mapContainer.current.offsetWidth === 0) {
        return;
      }

      try {
        if (!window.mapkit.Coordinate || !window.mapkit.CoordinateSpan || !window.mapkit.CoordinateRegion) {
          return;
        }

        const center = new window.mapkit.Coordinate(firstMarker.lat, firstMarker.lng);
        const span = new window.mapkit.CoordinateSpan(0.01, 0.01);
        const region = new window.mapkit.CoordinateRegion(center, span);

        const mkMap = new window.mapkit.Map(mapContainer.current, {
          region,
          showsUserLocation: false,
          showsUserLocationControl: false,
          showsCompass: window.mapkit.FeatureVisibility.Hidden,
          showsZoomControl: false,
          isZoomEnabled: false,
          isScrollEnabled: !disableScroll,
          isRotationEnabled: false,
          mapType: window.mapkit.Map.MapTypes.standard,
        });
        map.current = mkMap;
      } catch (error) {
        console.error("Error initializing MapKit:", error);
        return;
      }
    }

    if (map.current) {
      try {
        map.current.isZoomEnabled = false;
        map.current.isScrollEnabled = !disableScroll;
        map.current.isRotationEnabled = false;
      } catch (error) {
        console.error("Error updating MapKit settings:", error);
      }
    }
  }, [mapkitLoaded, markers, disableScroll, isVisible]);

  React.useEffect(() => {
    if (!map.current || !window.mapkit || !isVisible || markers.length === 0) return;

    try {
      if (annotationsRef.current.length) {
        map.current.removeAnnotations(annotationsRef.current);
        annotationsRef.current = [];
      }

      const annotationDataMap = new Map<any, Marker & { customLink?: { label: string; url: string } }>();

      const calloutDelegate = {
        calloutElementForAnnotation(annotation: any) {
          const data = annotationDataMap.get(annotation);
          if (!data) return null;

          const viewLink = data.url
            ? `<a href="${data.url}" class="marker-link"${
                useTargetBlank ? " target='_blank'" : ""
              }><b>View Hotspot</b></a>&nbsp;&nbsp;`
            : "";
          const customLink = data.customLink
            ? `<a href="${data.customLink.url}" class="marker-link"${useTargetBlank ? " target='_blank'" : ""}><b>${
                data.customLink.label
              }</b></a>&nbsp;&nbsp;`
            : "";

          const directionsLink =
            data.lat && data.lng
              ? `<a href="https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lng}" target="_blank" class="marker-link"><b>Get Directions</b></a>&nbsp;&nbsp;`
              : "";
          const container = document.createElement("div");
          container.className = "mapkit-popup bg-white p-3 rounded shadow-lg text-sm border border-gray-200";
          container.innerHTML = `<span class="font-medium text-sm text-gray-900">${data.name}</span><br>${viewLink}${
            customLink || directionsLink
          }`;
          return container;
        },
      };

      annotationsRef.current = markers
        .filter(
          (data) => typeof data.lat === "number" && typeof data.lng === "number" && !isNaN(data.lat) && !isNaN(data.lng)
        )
        .map((data) => {
          const coordinate = new window.mapkit.Coordinate(data.lat, data.lng);
          const imageUrl = data.species ? `/markers/shade-${getMarkerShade(data.species)}.svg` : `/markers/shade-1.svg`;
          const absoluteUrl =
            typeof window !== "undefined" ? new URL(imageUrl, window.location.origin).toString() : imageUrl;
          const imageByScale = { 1: absoluteUrl, 2: absoluteUrl };
          const size = { width: 15, height: 20 };

          const annotation = new window.mapkit.ImageAnnotation(coordinate, {
            title: data.name,
            url: imageByScale,
            size,
            callout: calloutDelegate,
            enabled: true,
            anchorOffset: typeof DOMPoint !== "undefined" ? new DOMPoint(0, 0) : undefined,
          });

          annotationDataMap.set(annotation, data);
          return annotation;
        });

      if (annotationsRef.current.length === 0) return;

      map.current.addAnnotations(annotationsRef.current);

      if (annotationsRef.current.length > 1) {
        const padding =
          annotationsRef.current.length > 15
            ? 40
            : annotationsRef.current.length > 10
            ? 80
            : annotationsRef.current.length > 2
            ? 120
            : 140;
        const pad = new window.mapkit.Padding(padding, padding, padding, padding);
        map.current.showItems(annotationsRef.current, { animate: false, padding: pad });
      } else {
        const firstMarker = markers.find((m) => typeof m.lat === "number" && typeof m.lng === "number");
        if (firstMarker) {
          const zoomLevel = Math.max(0, Math.min(20, zoom));
          const spanMultiplier = Math.pow(2, 15 - zoomLevel);
          const center = new window.mapkit.Coordinate(firstMarker.lat, firstMarker.lng);
          const region = new window.mapkit.CoordinateRegion(
            center,
            new window.mapkit.CoordinateSpan(0.01 * spanMultiplier, 0.01 * spanMultiplier)
          );
          map.current.region = region;
        }
      }
    } catch (error) {
      console.error("Error updating MapKit annotations:", error);
    }

    return () => {
      if (map.current && annotationsRef.current.length) {
        try {
          map.current.removeAnnotations(annotationsRef.current);
        } catch (error) {
          console.error("Error removing annotations:", error);
        }
      }
      annotationsRef.current = [];
    };
  }, [markers, mapkitLoaded, zoom, useTargetBlank, isVisible]);

  React.useEffect(() => {
    return () => {
      if (map.current) {
        try {
          if (annotationsRef.current.length > 0) {
            map.current.removeAnnotations(annotationsRef.current);
            annotationsRef.current = [];
          }
          map.current.destroy();
          map.current = null;
        } catch (error) {
          console.error("Error cleaning up MapKit map:", error);
        }
      }
    };
  }, []);

  React.useEffect(() => {
    if (!map.current || markerCount > 1 || !mapkitLoaded || !isVisible || markers.length === 0 || !window.mapkit)
      return;
    const center = new window.mapkit.Coordinate(markers[0].lat, markers[0].lng);
    const zoomLevel = Math.max(0, Math.min(20, zoom));
    const spanMultiplier = Math.pow(2, 15 - zoomLevel);
    const region = new window.mapkit.CoordinateRegion(
      center,
      new window.mapkit.CoordinateSpan(0.01 * spanMultiplier, 0.01 * spanMultiplier)
    );
    map.current.region = region;
  }, [zoom, markerCount, mapkitLoaded, markers, isVisible]);

  return (
    <div className="relative w-full aspect-[4/3.5] rounded-md overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
