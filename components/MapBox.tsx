import * as React from "react";
import mapboxgl from "mapbox-gl";
import { Marker } from "lib/types";
import { getMarkerShade } from "lib/helpers";

const keys = process.env.NEXT_PUBLIC_MAPBOX_KEY?.split(",") || [];
const key = keys[Math.floor(Math.random() * keys.length)];
mapboxgl.accessToken = key || "";

type Props = {
  markers: Marker[];
  zoom: number;
  disabled?: boolean;
  landscape?: boolean;
  disableScroll?: boolean;
  lgMarkers?: boolean;
};

export default function MapBox({ markers, zoom, disabled, landscape, disableScroll, lgMarkers }: Props) {
  const [satellite, setSatellite] = React.useState<boolean>(false);
  const mapContainer = React.useRef(null);
  const map = React.useRef<any>(null);
  const markerCount = markers.length;

  const handleToggle = () => {
    const style = satellite ? "outdoors-v11" : "satellite-streets-v11";
    map.current.setStyle(`mapbox://styles/mapbox/${style}`);
    setSatellite((prev) => !prev);
  };

  React.useEffect(() => {
    if (!mapContainer.current || markers.length === 0) return;
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v11",
      center: [markers[0].lng, markers[0].lat],
      zoom: zoom || 15,
      interactive: !disabled,
      cooperativeGestures: disableScroll,
    });

    if (!disabled) {
      map.current.addControl(new mapboxgl.NavigationControl());

      map.current.addControl(new mapboxgl.FullscreenControl());
    }

    const bounds = new mapboxgl.LngLatBounds();

    markers.map((data) => {
      const img = document.createElement("img");
      img.className = lgMarkers ? "marker" : "marker-sm";
      img.src = data.species ? `/markers/shade-${getMarkerShade(data.species)}.svg` : `/markers/shade-1.svg`;

      const id = new Date().getTime();
      const marker = new mapboxgl.Marker(img);

      const viewLink = data.url ? `<a href="${data.url}" class="marker-link"><b>View Hotspot</b></a>&nbsp;&nbsp;` : "";
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<span class="font-medium text-sm">${data.name}</span><br>${viewLink}<a href="https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lng}" target="_blank" class="marker-link"><b>Get Directions</b></a>`
      );
      marker.setLngLat([data.lng, data.lat]).setPopup(popup).addTo(map.current);
      bounds.extend(marker.getLngLat());

      return { ...data, id, ref: marker };
    });

    if (markers.length > 1) {
      const padding = markers.length > 15 ? 40 : markers.length > 10 ? 80 : markers.length > 2 ? 120 : 160;
      map.current.fitBounds(bounds, { padding, duration: 0 });
    }
  });

  React.useEffect(() => {
    if (!map.current || markerCount > 1) return;
    map.current.flyTo({ zoom });
  }, [zoom, markerCount]);

  return (
    <div className={`relative w-full ${landscape ? "h-[500px]" : "aspect-[4/3.5]"} rounded-md overflow-hidden`}>
      <div ref={mapContainer} className="w-full h-full" />
      <div className="flex gap-2 absolute top-2 left-2">
        <button type="button" className="bg-white shadow text-black rounded-sm px-4" onClick={handleToggle}>
          {satellite ? "Terrain" : "Satellite"}
        </button>
      </div>
    </div>
  );
}
