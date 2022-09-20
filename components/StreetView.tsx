type Props = {
  lat: number;
  lng: number;
  heading: number;
  pitch: number;
  fov: number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
};

export default function StreetView({ lat, lng, heading, pitch, fov, className, style, ...props }: Props) {
  let url = `https://www.google.com/maps/embed/v1/streetview?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=${fov}`;
  return (
    <iframe
      key={url}
      width="600"
      height="450"
      style={{ border: 0, ...(style || {}) }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={url}
      className={className || ""}
      {...props}
    />
  );
}
