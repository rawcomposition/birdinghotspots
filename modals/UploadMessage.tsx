import React from "react";
import { useModal, ModalFooter } from "providers/modals";
import BtnSmall from "components/BtnSmall";
import { useRouter } from "next/router";

export default function UploadMessage() {
  const router = useRouter();
  const { locationId } = router.query;
  const { close } = useModal();

  return (
    <>
      <div>
        <p className="mb-4 font-medium text-[15px]">
          Habitat photos uploaded to eBird.org will now be displayed on BirdingHotspots.org. Follow the steps below to
          get started.{" "}
          <a
            href="https://support.ebird.org/en/support/solutions/articles/48001269559-upload-checklist-media"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more
          </a>
          .
        </p>
        <h3 className="text-[16px] font-bold">
          1. Find the appropriate checklist{" "}
          <span className="font-normal">
            (
            <a href={`https://ebird.org/mychecklists/${locationId}`} target="_blank" rel="noopener noreferrer">
              view mine
            </a>
            )
          </span>
        </h3>
        <h3 className="text-[16px] font-bold mt-4 mb-2">2. Click &quot;Add Media&quot;</h3>
        <img
          src="/upload-step-1.jpg"
          alt="Screenshot of eBird checklist page pointing to the Add Media button"
          className="w-full"
          width={1200}
          height={591}
        />
        <h3 className="text-[16px] font-bold mt-6 mb-2">
          3. Upload your photos to the &quot;Habitat or Soundscape&quot; section
        </h3>
        <img
          src="/upload-step-2.jpg"
          alt="Screenshot of the eBird manage media page highlighting the Habitat or Soundscape section"
          className="w-full"
          width={1200}
          height={672}
        />
      </div>
      <ModalFooter>
        <BtnSmall type="button" color="gray" onClick={close} className="px-4">
          Close
        </BtnSmall>
      </ModalFooter>
    </>
  );
}
