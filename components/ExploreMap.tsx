import * as React from "react";
import mapboxgl from "mapbox-gl";
import toast from "react-hot-toast";
import useRegionBounds from "hooks/useRegionBounds";

const keys = process.env.NEXT_PUBLIC_MAPBOX_KEY?.split(",") || [];
const key = keys[Math.floor(Math.random() * keys.length)];
mapboxgl.accessToken = key || "";

type Props = {
  lat?: number;
  lng?: number;
  region?: string;
  mode: string;
};

export default function ExploreMap({ lat, lng, region, mode }: Props) {
  const [satellite, setSatellite] = React.useState<boolean>(false);
  const [tooLarge, setTooLarge] = React.useState<boolean>(false);
  const mapContainer = React.useRef(null);
  const map = React.useRef<any>(null);
  const zoomRef = React.useRef<any>(6);
  const refs = React.useRef<any>(null);
  const tooLargeRef = React.useRef<boolean>(false);
  tooLargeRef.current = tooLarge;
  const { regionBounds } = useRegionBounds(region);

  const fetchMarkers = async (swLat: number, swLng: number, neLat: number, neLng: number) => {
    const res = await fetch(`/api/hotspot/within?swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}`);
    const data = await res.json();
    if (!data.success) toast.error("Failed to load hotspots");
    setTooLarge(data.tooLarge);
    refs.current?.map((ref: any) => ref.remove());
    refs.current = data.results.map(({ lat, lng, url, name, img }: any) => {
      const icon = document.createElement("img");
      icon.className = "marker";
      icon.src = `/child-marker.png`;

      const marker = new mapboxgl.Marker(icon);
      const photo = img ? `<a href="${url}"><img src="${img}" class="popup-img" /></a>` : "";
      const viewLink = `<a href="${url}" class="marker-link"><b>View Hotspot</b></a>&nbsp;&nbsp;`;
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `${photo}<span class="font-medium">${name}</span><br>${viewLink}<a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" class="marker-link"><b>Get Directions</b></a>`
      );
      marker.setLngLat([lng, lat]).setPopup(popup).addTo(map.current);

      return marker;
    });
  };

  const handleToggle = () => {
    const style = satellite ? "outdoors-v11" : "satellite-streets-v11";
    map.current.setStyle(`mapbox://styles/mapbox/${style}`);
    setSatellite((prev) => !prev);
  };

  React.useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;
    if (region && !regionBounds) return;
    console.log(lat, lng);
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v11",
      center: [lng || -95.7129, lat || 37.0902],
      zoom: mode === "nearby" && lat && lng ? 12 : 3,
    });
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.FullscreenControl());

    if (regionBounds) {
      console.log("Fitting to bounds");
      const mapBounds = new mapboxgl.LngLatBounds();
      mapBounds.extend([regionBounds.minX, regionBounds.minY]);
      mapBounds.extend([regionBounds.maxX, regionBounds.maxY]);
      map.current.fitBounds(mapBounds, { padding: 40, duration: 0 });
    }

    map.current.on("moveend", () => {
      const newZoom = map.current.getZoom();
      if (newZoom < 7) return;
      const oldZoom = zoomRef.current;
      zoomRef.current = newZoom;
      if (newZoom > oldZoom && !tooLargeRef.current) return;
      //TODO: debounce
      const bounds = map.current.getBounds();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      fetchMarkers(sw.lat, sw.lng, ne.lat, ne.lng);
    });

    const bounds = map.current.getBounds();
    fetchMarkers(
      bounds.getSouthWest().lat,
      bounds.getSouthWest().lng,
      bounds.getNorthEast().lat,
      bounds.getNorthEast().lng
    );
  });

  React.useEffect(() => {
    document.getElementById("footer")?.classList.add("hidden");
    return () => {
      document.getElementById("footer")?.classList.remove("hidden");
    };
  }, []);

  return (
    <div className={`fixed left-0 right-0 bottom-0 w-full h-[calc(100vh-220px)] overflow-hidden`}>
      <div ref={mapContainer} className="w-full h-full" />
      <div className="flex gap-2 absolute top-2 left-2">
        <button type="button" className="bg-white shadow text-black rounded-sm px-4" onClick={handleToggle}>
          {satellite ? "Terrain" : "Satellite"}
        </button>
      </div>
      {tooLarge && (
        <div className="absolute bottom-[40%] left-1/2 -translate-x-1/2 text-center opacity-80 bg-slate-600 text-white rounded-md px-4 py-2 text-lg font-bold">
          Zoom in to see hotspots
        </div>
      )}
    </div>
  );
}