import React from "react";
import Logo from "components/Logo";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

type Props = {
  className?: string;
};

export default function ContentFreezeBanner({ className }: Props) {
  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden shadow-sm ${className || ""}`}>
      <div className="bg-secondary px-6 py-5 flex items-center gap-4">
        <Logo className="w-10 h-10 flex-shrink-0 [&_path]:fill-white" />
        <div>
          <h2 className="text-white text-lg font-semibold leading-snug">Content editing is now closed</h2>
          <p className="text-blue-200 text-sm">BirdingHotspots.org | March 23, 2026</p>
        </div>
      </div>

      <div className="p-6">
        <p className="text-gray-700 mb-5">
          The BirdingHotspots content freeze is now in effect. Editing has been disabled as we migrate all hotspot
          content to eBird, where it will be available to the global birding community.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">What happens next</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Existing hotspot content is being migrated to eBird.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">
                This site will remain accessible in read-only mode for at least 12 months.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">
                Editing will continue on eBird, with the same community-driven model you know.
              </span>
            </li>
          </ul>
        </div>

        <hr className="mb-5" />

        <p className="text-gray-600 text-sm">
          Hotspot content will be editable on eBird starting in late April. Thank you for your contributions to
          BirdingHotspots over the years.
        </p>
      </div>
    </div>
  );
}
