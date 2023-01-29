import Link from "next/link";
import NoticeIcon from "components/NoticeIcon";
import { useUser } from "providers/user";

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
  const { user } = useUser();

  return (
    <ul className={className || ""}>
      {hotspots?.map(({ name, url, noContent, needsDeleting }) => (
        <li key={url}>
          <Link href={url}>{name}</Link>
          {noContent && user && <NoticeIcon color="yellow" tooltip="Needs content" />}
          {needsDeleting && user && (
            <span className={`bg-red-600 rounded-full text-xs px-2 text-white font-bold ml-2`}>Removed</span>
          )}
        </li>
      ))}
    </ul>
  );
}
