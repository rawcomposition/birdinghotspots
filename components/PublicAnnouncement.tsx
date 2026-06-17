import React from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import ViewOnEbirdBtn from "components/ViewOnEbirdBtn";

type Props = {
  className?: string;
  ebirdHref?: string;
  ebirdLabel?: string;
};

export default function PublicAnnouncement({ className, ebirdHref, ebirdLabel }: Props) {
  return (
    <div className={`bg-amber-50 border-2 border-amber-300 rounded-lg p-4 sm:p-5 mb-8 shadow-sm ${className || ""}`}>
      <h2 className="text-lg font-semibold text-gray-800 leading-snug mb-3">
        Birding Hotspots content is now on eBird
      </h2>

      <p className="text-gray-700 text-[15px] mb-4">
        The descriptions, tips, and community knowledge collected here have been integrated into eBird as the new{" "}
        <strong>Hotspot About pages</strong> and <strong>Hotspot Groups</strong>. Contribute and explore these features
        directly on eBird, where they&apos;re available to the global birding community.
      </p>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {ebirdHref && <ViewOnEbirdBtn href={ebirdHref} label={ebirdLabel} />}
        <a
          href="https://ebird.org/news/new-hotspot-about-pages-and-groups"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-secondary"
        >
          Read the announcement
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
