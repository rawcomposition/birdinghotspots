import Link from "next/link";
import NoticeIcon from "components/NoticeIcon";
import { useUser } from "providers/user";

type Props = {
  className?: string;
  hotspots: {
    name: string;
    url: string;
    noContent?: boolean;
  }[];
};

export default function HotspotList({ hotspots, className }: Props) {
  const { user } = useUser();

  return (
    <ul className={className || ""}>
      {hotspots?.map(({ name, url, noContent }) => (
        <li key={url}>
          <Link href={url}>{name}</Link>
          {noContent && user && <NoticeIcon color="green" title="New Hotspot - needs content" />}
        </li>
      ))}
    </ul>
  );
}
