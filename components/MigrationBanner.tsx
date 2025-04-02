import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function MigrationBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const bannerClosed = localStorage.getItem("migrationBannerClosed");
    if (!bannerClosed) {
      setIsVisible(true);
    }
  }, []);

  const closeBanner = () => {
    localStorage.setItem("migrationBannerClosed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-8 shadow-sm relative">
      <button
        onClick={closeBanner}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-blue-100 transition-colors"
        aria-label="Close banner"
      >
        <XMarkIcon className="w-5 h-5 text-gray-500" />
      </button>

      <h2 className="text-lg font-semibold text-gray-800 mb-2">Re-upload Your Images to eBird</h2>
      <p className="text-gray-700 mb-3">
        <span className="font-semibold">BirdingHotspots.org is transitioning to the Cornell Lab of Ornithology!</span>{" "}
        As part of this exciting change, media uploaded to Birding Hotspots will be integrated into the Cornell
        Lab&rsquo;s infrastructure. We encourage users to re-upload their photos to eBird checklists to take full
        advantage of the new{" "}
        <a
          href="https://support.ebird.org/en/support/solutions/articles/48001269559"
          className="font-bold"
          target="_blank"
        >
          Checklist Media features
        </a>
        .
      </p>
      <ul className="pl-5 text-gray-700 space-y-1">
        <li>✅ eBird Checklist Media includes rich context like date, time, species observed, and effort details.</li>
        <li>📸 Your photos will be archived in full resolution and linked to your birding data.</li>
        <li>🌍 Images added to eBird can be featured on BirdingHotspots.org and support research and conservation.</li>
        <li>
          ℹ️ Re-uploading is optional—your existing images will be transferred automatically, but without checklist
          context or full resolution.
        </li>
      </ul>
      <h2 className="text-lg font-semibold text-gray-800 mb-2 mt-4">Steps</h2>
      <ol className="pl-3 text-gray-700 space-y-3">
        <li className="flex items-start">
          <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center mr-2 font-bold">
            1
          </span>
          <span className="-mt-0.5">
            Locate your <strong>original, full resolution images</strong> to re-upload, if available. Reference the
            image capture date shown below (if available).
          </span>
        </li>
        <li className="flex items-start">
          <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center mr-2 font-bold">
            2
          </span>
          <span className="-mt-0.5">
            Click &quot;<strong>My Checklists</strong>&quot; to find the checklist you want to add images to.
          </span>
        </li>
        <li className="flex items-start">
          <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center mr-2 font-bold">
            3
          </span>
          <span className="-mt-0.5">
            Click &quot;<strong>Add Media</strong>&quot; and upload your images to either the Habitat or Experience
            section.
          </span>
        </li>
      </ol>
    </div>
  );
}
