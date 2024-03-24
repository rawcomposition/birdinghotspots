import { Group } from "lib/types";
import Link from "next/link";
import { getFileUrl } from "lib/s3";

type Props = {
  groups: Group[];
  smallTitle?: boolean;
};

export default function GroupGrid({ groups, smallTitle }: Props) {
  return (
    <>
      {groups.map(({ name, _id, mapImgUrl, url, hotspots }) => {
        return (
          <article key={_id} className="flex flex-col gap-3">
            <Link href={url}>
              <img
                src={getFileUrl(mapImgUrl) || "/placeholder.png"}
                className="object-cover rounded-md bg-gray-100 w-full aspect-[1.55]"
                loading="lazy"
              />
            </Link>
            <div className="flex-1">
              <div className="mb-4 leading-5 flex items-start">
                <div>
                  <h2 className="font-bold">
                    <Link href={url} className={`text-gray-700 ${smallTitle ? "text-[13px] leading-3" : ""}`}>
                      {name}
                    </Link>
                  </h2>
                  <p className="gap-1.5 text-gray-500 text-[11px]">
                    <span>
                      {hotspots.length} {hotspots.length === 1 ? "hotspot" : "hotspots"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </>
  );
}
