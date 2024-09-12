import React from "react";
import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

type Props = {
  heading?: string;
  links: { label: string; url: string }[];
  external?: boolean;
};

const limit = 4;

export const StateLinkSection = ({ heading, links, external }: Props) => {
  const [viewMore, setViewMore] = React.useState<boolean>(false);
  const visibleLinks = viewMore ? links : links.slice(0, limit);
  if (!links?.length) return null;
  return (
    <div className="break-inside-avoid">
      <h3 className="text-lg mb-1.5 font-bold">{heading}</h3>
      <p className="mb-4">
        {visibleLinks.map(({ label, url }) => (
          <React.Fragment key={url}>
            {external ? (
              <a href={url} target="_blank" rel="noreferrer">
                {label}
              </a>
            ) : (
              <Link href={url}>{label}</Link>
            )}
            <br />
          </React.Fragment>
        ))}
        {links.length > limit && !viewMore && (
          <button
            type="button"
            className="mt-1 flex gap-1 items-center font-medium text-sm text-gray-600"
            onClick={() => setViewMore(!viewMore)}
          >
            View {links.length - limit} more
            <ChevronDownIcon className="h-4 w-4 inline-block" />
          </button>
        )}
      </p>
    </div>
  );
};
