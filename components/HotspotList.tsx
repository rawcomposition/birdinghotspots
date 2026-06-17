import Link from "next/link";

type Props = {
  className?: string;
  hotspots: {
    name: string;
    url: string;
    noContent?: boolean;
    needsDeleting?: boolean;
  }[];
};

export default function HotspotList({ hotspots, className }: Props) {
  return (
    <ul className={className || ""}>
      {hotspots?.map(({ name, url, noContent }) => (
        <li key={url}>
          <Link href={url} className={noContent ? "" : "font-bold"}>
            {name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
