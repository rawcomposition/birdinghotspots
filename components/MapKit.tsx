import React from "react";
import { Marker } from "lib/types";
import { getMarkerShade } from "lib/helpers";

declare global {
  interface Window {
    mapkit: any;
  }
}

type Props = {
  markers: Marker[];
  zoom: number;
  disabled?: boolean;
  landscape?: boolean;
  disableScroll?: boolean;
  lgMarkers?: boolean;
};

export default function MapKit({ markers, zoom, disabled, landscape, disableScroll, lgMarkers }: Props) {
  const [mapkitLoaded, setMapkitLoaded] = React.useState<boolean>(false);
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<any>(null);
  const annotationsRef = React.useRef<any[]>([]);
  const markerCount = markers.length;

  const keys = process.env.NEXT_PUBLIC_MAPKIT_KEY?.split(",") || [];
  const key = keys[Math.floor(Math.random() * keys.length)] || "";

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.mapkit) {
      setMapkitLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if (key) {
        window.mapkit.init({
          authorizationCallback: (done: (token: string) => void) => {
            done(key);
          },
        });
      }
      setMapkitLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [key]);

  React.useEffect(() => {
    if (!mapContainer.current || !mapkitLoaded || markers.length === 0 || !window.mapkit) return;
    if (!map.current) {
      const center = new window.mapkit.Coordinate(markers[0].lat, markers[0].lng);
      const span = new window.mapkit.CoordinateSpan(0.01, 0.01);
      const region = new window.mapkit.CoordinateRegion(center, span);

      const mkMap = new window.mapkit.Map(mapContainer.current, {
        region,
        showsUserLocation: false,
        showsUserLocationControl: false,
        showsCompass: window.mapkit.FeatureVisibility.Hidden,
        showsZoomControl: !disabled,
        isZoomEnabled: !disabled,
        isScrollEnabled: !disabled && !disableScroll,
        isRotationEnabled: false,
        isPitchEnabled: false,
        mapType: window.mapkit.Map.MapTypes.standard,
      });
      map.current = mkMap;
    }

    map.current.isZoomEnabled = !disabled;
    map.current.isScrollEnabled = !disabled && !disableScroll;
    map.current.isRotationEnabled = false;
    map.current.isPitchEnabled = false;
  }, [mapkitLoaded, markers, disabled, disableScroll]);

  React.useEffect(() => {
    if (!map.current || !window.mapkit || markers.length === 0) return;

    if (annotationsRef.current.length) {
      map.current.removeAnnotations(annotationsRef.current);
      annotationsRef.current = [];
    }

    const annotationDataMap = new Map<any, Marker>();

    const calloutDelegate = {
      calloutElementForAnnotation(annotation: any) {
        const data = annotationDataMap.get(annotation);
        if (!data) return null;

        const viewLink = data.url
          ? `<a href="${data.url}" class="marker-link"><b>View Hotspot</b></a>&nbsp;&nbsp;`
          : "";
        const container = document.createElement("div");
        container.className = "mapkit-popup bg-white p-3 rounded shadow-lg text-sm border border-gray-200";
        container.innerHTML = `<span class="font-medium text-sm">${data.name}</span><br>${viewLink}<a href="https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lng}" target="_blank" class="marker-link"><b>Get Directions</b></a>`;
        return container;
      },
    };

    annotationsRef.current = markers.map((data) => {
      const coordinate = new window.mapkit.Coordinate(data.lat, data.lng);
      const imageUrl = data.species ? `/markers/shade-${getMarkerShade(data.species)}.svg` : `/markers/shade-1.svg`;
      const absoluteUrl =
        typeof window !== "undefined" ? new URL(imageUrl, window.location.origin).toString() : imageUrl;
      const imageByScale = { 1: absoluteUrl, 2: absoluteUrl };
      const size = { width: lgMarkers ? 21 : 15, height: lgMarkers ? 28 : 20 };

      const annotation = new window.mapkit.ImageAnnotation(coordinate, {
        title: data.name,
        url: imageByScale,
        size,
        callout: calloutDelegate,
        enabled: !disabled,
        anchorOffset: typeof DOMPoint !== "undefined" ? new DOMPoint(0, 0) : undefined,
      });

      annotationDataMap.set(annotation, data);
      return annotation;
    });

    map.current.addAnnotations(annotationsRef.current);

    if (markers.length > 1) {
      const padding = markers.length > 15 ? 40 : markers.length > 10 ? 80 : markers.length > 2 ? 120 : 140;
      map.current.showItems(annotationsRef.current, { animate: false, padding });
    } else {
      const zoomLevel = Math.max(0, Math.min(20, zoom));
      const spanMultiplier = Math.pow(2, 15 - zoomLevel);
      const center = new window.mapkit.Coordinate(markers[0].lat, markers[0].lng);
      const region = new window.mapkit.CoordinateRegion(
        center,
        new window.mapkit.CoordinateSpan(0.01 * spanMultiplier, 0.01 * spanMultiplier)
      );
      map.current.region = region;
    }

    return () => {
      if (map.current && annotationsRef.current.length) {
        map.current.removeAnnotations(annotationsRef.current);
      }
      annotationsRef.current = [];
    };
  }, [markers, disabled, mapkitLoaded, zoom]);

  React.useEffect(() => {
    if (!map.current || markerCount > 1 || !mapkitLoaded || markers.length === 0 || !window.mapkit) return;
    const center = new window.mapkit.Coordinate(markers[0].lat, markers[0].lng);
    const zoomLevel = Math.max(0, Math.min(20, zoom));
    const spanMultiplier = Math.pow(2, 15 - zoomLevel);
    const region = new window.mapkit.CoordinateRegion(
      center,
      new window.mapkit.CoordinateSpan(0.01 * spanMultiplier, 0.01 * spanMultiplier)
    );
    map.current.region = region;
  }, [zoom, markerCount, mapkitLoaded, markers]);

  return (
    <div className={`relative w-full ${landscape ? "h-[500px]" : "aspect-[4/3.5]"} rounded-md overflow-hidden`}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
