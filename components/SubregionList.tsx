import { Region } from "lib/types";
import clsx from "clsx";
import Link from "next/link";

type Props = {
  regionCode: string;
  subregions?: Region[];
};

export default function SubregionList({ subregions, regionCode }: Props) {
  const hasLongNames = ["CA", "CA-NL"].includes(regionCode);
  const truncateLength = hasLongNames ? 28 : 12;
  return (
    <div
      className={clsx(
        "columns-2 flex-grow bg-gradient-to-t from-slate-600 to-slate-600/95 px-4 py-2 rounded lg:ml-24",
        !hasLongNames && "sm:columns-4"
      )}
    >
      {subregions?.map((it) => (
        <p key={it.code}>
          <Link href={`/region/${it.code}`} className="font-bold text-slate-300 truncate" title={it.name}>
            {it.name.length > truncateLength ? `${it.name.slice(0, truncateLength)}...` : it.name}
          </Link>
        </p>
      ))}
    </div>
  );
}
