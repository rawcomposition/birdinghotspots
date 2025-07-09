import React, { useState, useEffect } from "react";
import { XMarkIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import HelpIcon from "components/Help";
import { ABOUT_SECTION_HELP_TEXT, BIRDING_SECTION_HELP_TEXT, PLAN_SECTION_HELP_TEXT } from "lib/config";

export default function NewSectionsBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const bannerClosed = localStorage.getItem("newSectionsBannerClosed");
    if (!bannerClosed) {
      setIsVisible(true);
    }
  }, []);

  const closeBanner = () => {
    localStorage.setItem("newSectionsBannerClosed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 md:p-6 mb-8 shadow-sm relative">
      <button
        onClick={closeBanner}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-blue-100 transition-colors"
        aria-label="Close banner"
      >
        <XMarkIcon className="w-5 h-5 text-gray-500" />
      </button>

      <div className="flex gap-4 mb-4 items-center">
        <h2 className="text-lg font-semibold text-gray-800">New Content Sections</h2>
        <span className="text-gray-600 text-xs bg-blue-100 font-medium px-3 py-1 rounded-full">July 9, 2025</span>
      </div>

      <p className="text-gray-600 mb-4">
        As part of our collaboration with the eBird team, we are updating the content sections to be more helpful to the
        global birding community. Existing content has been automatically migrated to the appropriate new sections.
      </p>

      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-4">
        <h3 className="font-semibold text-gray-700 mb-4 text-center">Overview of Changes</h3>

        <div className="space-y-8 max-w-md mx-auto">
          <div className="grid grid-cols-[1fr_auto_1fr] sm:gap-4 items-center">
            <div className="flex items-center justify-center">
              <div className="w-full border-2 border-dashed border-gray-300 text-gray-500 px-3 py-1 rounded-full text-sm font-medium bg-transparent text-center">
                N/A
              </div>
            </div>

            <div className="flex items-center justify-center px-2">
              <ArrowRightIcon className="w-6 h-6 text-gray-400" />
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-center">
                Plan Your Visit{" "}
                <HelpIcon heading="Plan Your Visit" text={PLAN_SECTION_HELP_TEXT} color="text-green-800" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-full bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium text-center">
                Tips for Birding
              </div>
              <div className="w-full bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium text-center">
                Birds of Interest
              </div>
              <div className="w-full bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium text-center">
                Notable Trails
              </div>
            </div>

            <div className="flex items-center justify-center px-2">
              <ArrowRightIcon className="w-6 h-6 text-gray-400" />
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-center">
                How to Bird Here{" "}
                <HelpIcon heading="How to Bird Here" text={BIRDING_SECTION_HELP_TEXT} color="text-green-800" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <div className="flex items-center justify-center">
              <div className="w-full bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium text-center">
                About this Location
              </div>
            </div>

            <div className="flex items-center justify-center px-2">
              <ArrowRightIcon className="w-6 h-6 text-gray-400" />
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-center">
                About this Place{" "}
                <HelpIcon heading="About this Place" text={ABOUT_SECTION_HELP_TEXT} color="text-green-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
