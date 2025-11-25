import React from "react";
import toast from "react-hot-toast";
import useRegionBounds from "hooks/useRegionBounds";
import { getMarkerShade } from "lib/helpers";

declare global {
  interface Window {
    mapkit: any;
  }
}

const markerColors = [
  "#bcbcbc",
  "#8f9ca0",
  "#9bc4cf",
  "#aaddeb",
  "#c7e466",
  "#eaeb1f",
  "#fac500",
  "#e57701",
  "#e33b15",
  "#ce0d02",
];

type Props = {
  lat?: number;
  lng?: number;
  region?: string;
  mode: string;
};

export default function ExploreMap({ lat, lng, region, mode }: Props) {
  const [mapkitLoaded, setMapkitLoaded] = React.useState<boolean>(false);
  const [tooLarge, setTooLarge] = React.useState<boolean>(false);
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<any>(null);
  const annotationsRef = React.useRef<any[]>([]);
  const annotationDataMap = React.useRef<Map<any, any>>(new Map());
  const zoomRef = React.useRef<any>(6);
  const tooLargeRef = React.useRef<boolean>(false);
  const lastFetchBoundsRef = React.useRef<{ swLat: number; swLng: number; neLat: number; neLng: number } | null>(null);
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  tooLargeRef.current = tooLarge;
  const { regionBounds } = useRegionBounds(region);

  const keys = process.env.NEXT_PUBLIC_MAPKIT_KEY?.split(",") || [];
  const key = keys[Math.floor(Math.random() * keys.length)] || "";

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const circleRadius = isMobile ? 9 : 8;

  const fetchMarkers = React.useCallback(
    async (swLat: number, swLng: number, neLat: number, neLng: number) => {
      const createCircleImage = (color: string): string => {
        const scale = 2;
        const size = circleRadius * 2;
        const canvas = document.createElement("canvas");
        canvas.width = size * scale;
        canvas.height = size * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return "";

        ctx.scale(scale, scale);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const center = circleRadius;
        const radius = circleRadius - 0.75;
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 0.75;
        ctx.stroke();

        return canvas.toDataURL();
      };

      const res = await fetch(
        `/api/hotspot/within?swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}&region=${region || ""}`
      );
      const data = await res.json();
      if (!data.success) {
        toast.error("Failed to load hotspots");
        return;
      }
      setTooLarge(data.tooLarge);

      if (!map.current || !window.mapkit) return;

      if (annotationsRef.current.length) {
        map.current.removeAnnotations(annotationsRef.current);
        annotationsRef.current = [];
        annotationDataMap.current.clear();
      }

      const calloutDelegate = {
        calloutElementForAnnotation(annotation: any) {
          const data = annotationDataMap.current.get(annotation);
          if (!data) return null;

          const viewLink = `<a href="/hotspot/${data.locationId}" class="marker-link"><b>View Hotspot</b></a>&nbsp;&nbsp;&nbsp;`;
          const container = document.createElement("div");
          container.className = "mapkit-popup bg-white p-3 rounded shadow-lg text-sm border border-gray-200";
          container.innerHTML = `<span class="font-medium text-sm">${data.name}</span><br>${viewLink}<a href="https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lng}" target="_blank" class="marker-link"><b>Get Directions</b></a>`;
          return container;
        },
      };

      annotationsRef.current = data.results.map(([name, locationId, location, species]: any) => {
        const shade = getMarkerShade(species);
        const shadeIndex = Math.min(9, Math.max(0, shade - 1));
        const color = markerColors[shadeIndex];
        const circleImageUrl = createCircleImage(color);

        const coordinate = new window.mapkit.Coordinate(location[1], location[0]);
        const imageByScale = { 1: circleImageUrl, 2: circleImageUrl };
        const size = { width: circleRadius * 2, height: circleRadius * 2 };

        const annotation = new window.mapkit.ImageAnnotation(coordinate, {
          title: name,
          url: imageByScale,
          size,
          callout: calloutDelegate,
          anchorOffset: typeof DOMPoint !== "undefined" ? new DOMPoint(0, 0) : undefined,
        });

        const hotspotData = {
          name,
          locationId,
          lat: location[1],
          lng: location[0],
        };

        annotationDataMap.current.set(annotation, hotspotData);
        return annotation;
      });

      map.current.addAnnotations(annotationsRef.current);
    },
    [region, circleRadius]
  );

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
    if (!mapContainer.current || !mapkitLoaded || !window.mapkit) return;
    if (region && !regionBounds) return;
    if (map.current) return;

    const centerLat = lat ? Number(lat) : 37.0902;
    const centerLng = lng ? Number(lng) : -95.7129;
    const initialCenter = new window.mapkit.Coordinate(centerLat, centerLng);
    const initialZoom = mode === "nearby" && lat && lng ? 12 : 3;
    const spanMultiplier = Math.pow(2, 15 - initialZoom);
    const initialSpan = new window.mapkit.CoordinateSpan(0.01 * spanMultiplier, 0.01 * spanMultiplier);
    const regionObj = new window.mapkit.CoordinateRegion(initialCenter, initialSpan);

    const mkMap = new window.mapkit.Map(mapContainer.current, {
      region: regionBounds
        ? new window.mapkit.CoordinateRegion(
            new window.mapkit.Coordinate(
              (regionBounds.minY + regionBounds.maxY) / 2,
              (regionBounds.minX + regionBounds.maxX) / 2
            ),
            new window.mapkit.CoordinateSpan(
              regionBounds.maxY - regionBounds.minY,
              regionBounds.maxX - regionBounds.minX
            )
          )
        : regionObj,
      showsUserLocation: false,
      showsUserLocationControl: false,
      showsCompass: window.mapkit.FeatureVisibility.Hidden,
      showsZoomControl: true,
      isZoomEnabled: true,
      isScrollEnabled: true,
      isRotationEnabled: false,
      isPitchEnabled: false,
      mapType: window.mapkit.Map.MapTypes.standard,
    });

    map.current = mkMap;

    if (regionBounds) {
      const pad = new window.mapkit.Padding(40, 40, 40, 40);
      map.current.region = new window.mapkit.CoordinateRegion(
        new window.mapkit.Coordinate(
          (regionBounds.minY + regionBounds.maxY) / 2,
          (regionBounds.minX + regionBounds.maxX) / 2
        ),
        new window.mapkit.CoordinateSpan(regionBounds.maxY - regionBounds.minY, regionBounds.maxX - regionBounds.minX)
      );
    }

    const regionChangeHandler = () => {
      if (!map.current || !window.mapkit) return;

      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      fetchTimeoutRef.current = setTimeout(() => {
        if (!map.current || !window.mapkit) return;
        const currentRegion = map.current.region;
        const regionCenter = currentRegion.center;
        const regionSpan = currentRegion.span;

        const neLat = regionCenter.latitude + regionSpan.latitudeDelta / 2;
        const swLat = regionCenter.latitude - regionSpan.latitudeDelta / 2;
        const neLng = regionCenter.longitude + regionSpan.longitudeDelta / 2;
        const swLng = regionCenter.longitude - regionSpan.longitudeDelta / 2;

        const currentZoom = Math.log2(0.01 / regionSpan.latitudeDelta) + 15;
        if (currentZoom < 7) return;

        const lastBounds = lastFetchBoundsRef.current;
        if (
          lastBounds &&
          Math.abs(lastBounds.swLat - swLat) < 0.005 &&
          Math.abs(lastBounds.swLng - swLng) < 0.005 &&
          Math.abs(lastBounds.neLat - neLat) < 0.005 &&
          Math.abs(lastBounds.neLng - neLng) < 0.005
        ) {
          return;
        }

        const oldZoom = zoomRef.current;
        const zoomChanged = Math.abs(currentZoom - oldZoom) > 0.1;
        zoomRef.current = currentZoom;

        if (zoomChanged && currentZoom > oldZoom && !tooLargeRef.current && annotationsRef.current.length > 0) {
          return;
        }

        lastFetchBoundsRef.current = { swLat, swLng, neLat, neLng };
        fetchMarkers(swLat, swLng, neLat, neLng);
      }, 300);
    };

    map.current.addEventListener("region-change-end", regionChangeHandler);

    setTimeout(() => {
      if (!map.current || !window.mapkit) return;
      const initialRegion = map.current.region;
      const initialRegionCenter = initialRegion.center;
      const initialRegionSpan = initialRegion.span;
      const neLat = initialRegionCenter.latitude + initialRegionSpan.latitudeDelta / 2;
      const swLat = initialRegionCenter.latitude - initialRegionSpan.latitudeDelta / 2;
      const neLng = initialRegionCenter.longitude + initialRegionSpan.longitudeDelta / 2;
      const swLng = initialRegionCenter.longitude - initialRegionSpan.longitudeDelta / 2;
      const initialZoom = Math.log2(0.01 / initialRegionSpan.latitudeDelta) + 15;
      zoomRef.current = initialZoom;
      lastFetchBoundsRef.current = { swLat, swLng, neLat, neLng };
      fetchMarkers(swLat, swLng, neLat, neLng);
    }, 100);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (map.current) {
        map.current.removeEventListener("region-change-end", regionChangeHandler);
      }
    };
  }, [mapkitLoaded, regionBounds, lat, lng, mode, region, fetchMarkers]);

  React.useEffect(() => {
    document.getElementById("footer")?.classList.add("hidden");
    return () => {
      document.getElementById("footer")?.classList.remove("hidden");
    };
  }, []);

  return (
    <div className="flex-1 relative min-h-0">
      <div ref={mapContainer} className="w-full h-full explore-map" />
      {tooLarge && (
        <div className="absolute bottom-[40%] left-1/2 -translate-x-1/2 text-center opacity-80 bg-slate-600 text-white rounded-md px-4 py-2 text-lg font-bold">
          Zoom in to see hotspots
        </div>
      )}
    </div>
  );
}
