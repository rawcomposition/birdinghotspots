import React from "react";
import { useModal, ModalFooter } from "providers/modals";
import BtnSmall from "components/BtnSmall";
import { FeaturedMlImg } from "lib/types";
import { CheckIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import ExternalIcon from "icons/ExternalIcon";
import { useQuery } from "@tanstack/react-query";

type Props = {
  locationId: string;
  selectedId?: string;
  disabledIds?: string[];
  onSelect: (photo: FeaturedMlImg) => void;
};

export default function FeaturedPhotoPicker({ locationId, selectedId, disabledIds = [], onSelect }: Props) {
  const [selectedPhoto, setSelectedPhoto] = React.useState<FeaturedMlImg | null>(null);
  const [fullSizePhoto, setFullSizePhoto] = React.useState<FeaturedMlImg | null>(null);
  const { close } = useModal();

  const { data, isLoading, error, refetch } = useQuery<{ success: boolean; images: FeaturedMlImg[] }>({
    queryKey: ["/api/ml-photos", { locationId }],
    enabled: !!locationId,
  });

  const photos = data?.images || [];

  React.useEffect(() => {
    if (photos.length > 0 && selectedId) {
      const preSelected = photos.find((img: FeaturedMlImg) => img.id === selectedId);
      if (preSelected) {
        setSelectedPhoto(preSelected);
      }
    }
  }, [photos, selectedId]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!fullSizePhoto) return;

      if (event.key === "Escape") {
        setFullSizePhoto(null);
        event.stopPropagation();
      } else if (event.key === "ArrowLeft") {
        navigateToPreviousPhoto();
      } else if (event.key === "ArrowRight") {
        navigateToNextPhoto();
      }
    };

    if (fullSizePhoto) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [fullSizePhoto, photos, disabledIds]);

  const handlePhotoClick = (photo: FeaturedMlImg) => {
    if (disabledIds.includes(photo.id)) return;
    setFullSizePhoto(photo);
  };

  const handleSelectFromFullSize = () => {
    if (fullSizePhoto) {
      setSelectedPhoto(fullSizePhoto);
      setFullSizePhoto(null);
    }
  };

  const closeFullSizeView = () => {
    setFullSizePhoto(null);
  };

  const navigateToPreviousPhoto = () => {
    if (!fullSizePhoto) return;
    const currentIndex = photos.findIndex((photo) => photo.id === fullSizePhoto.id);
    if (currentIndex > 0) {
      const previousPhoto = photos[currentIndex - 1];
      if (!disabledIds.includes(previousPhoto.id)) {
        setFullSizePhoto(previousPhoto);
      }
    }
  };

  const navigateToNextPhoto = () => {
    if (!fullSizePhoto) return;
    const currentIndex = photos.findIndex((photo) => photo.id === fullSizePhoto.id);
    if (currentIndex < photos.length - 1) {
      const nextPhoto = photos[currentIndex + 1];
      if (!disabledIds.includes(nextPhoto.id)) {
        setFullSizePhoto(nextPhoto);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedPhoto) {
      onSelect(selectedPhoto);
      close();
    }
  };

  const handleClose = () => {
    close();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="ml-2 text-gray-600">Loading photos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error.message || "Failed to load photos"}</p>
        <ModalFooter>
          <BtnSmall type="button" onClick={() => refetch()} className="px-4">
            Try Again
          </BtnSmall>
        </ModalFooter>
      </div>
    );
  }

  if (fullSizePhoto) {
    const currentIndex = photos.findIndex((photo) => photo.id === fullSizePhoto.id);
    const canGoPrevious =
      currentIndex > 0 && photos.slice(0, currentIndex).some((photo) => !disabledIds.includes(photo.id));
    const canGoNext =
      currentIndex < photos.length - 1 &&
      photos.slice(currentIndex + 1).some((photo) => !disabledIds.includes(photo.id));

    return (
      <>
        <div className="relative bg-gray-900 flex items-center justify-center h-[480px] -mx-4 sm:-mx-6 -my-5">
          <button
            onClick={closeFullSizeView}
            className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full h-10 w-10 flex items-center justify-center text-white transition-all duration-200 z-10"
            title="Close (Esc)"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {canGoPrevious && (
            <button
              onClick={navigateToPreviousPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full w-10 h-10 flex items-center justify-center text-white transition-all duration-200 z-10"
              title="Previous photo (←)"
            >
              <ChevronLeftIcon className="h-6 w-6 mr-0.5" />
            </button>
          )}

          {canGoNext && (
            <button
              onClick={navigateToNextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex h-10 w-10 items-center justify-center text-white transition-all duration-200 z-10"
              title="Next photo (→)"
            >
              <ChevronRightIcon className="h-6 w-6 ml-0.5" />
            </button>
          )}

          <img
            src={`https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${fullSizePhoto.id.replace("ML", "")}/1800`}
            alt={fullSizePhoto.caption || `Photo by ${fullSizePhoto.by}`}
            className="max-w-full max-h-full object-contain"
          />
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <div className="bg-white/60 opacity-60 hover:opacity-100 transition-all duration-200 py-0.5 border-t rounded-full px-6 max-w-sm flex items-center justify-center gap-1">
              <span className="font-medium text-gray-800 truncate">{fullSizePhoto.by}</span>
              <span className="rounded-full bg-gray-500 w-[4px] h-[4px] mx-1.5" />
              <span className="text-sm text-gray-600 whitespace-nowrap">{fullSizePhoto.date}</span>
              <span className="rounded-full bg-gray-500 w-[4px] h-[4px] mx-1.5" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://media.ebird.org/asset/${fullSizePhoto.id.replace("ML", "")}`, "_blank");
                }}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="View on eBird"
              >
                Details
              </button>
            </div>
          </div>
        </div>
        <ModalFooter>
          <BtnSmall
            type="button"
            color="green"
            onClick={handleSelectFromFullSize}
            disabled={!fullSizePhoto}
            className="px-4"
          >
            Select Photo
          </BtnSmall>
          <BtnSmall type="button" color="gray" onClick={closeFullSizeView} className="px-4 ml-2">
            Back to Grid
          </BtnSmall>
        </ModalFooter>
      </>
    );
  }

  return (
    <>
      <div className="mb-4">
        <p className="text-gray-600 font-medium">
          Choose a photo from the Macaulay Library.{" "}
          <a
            href={`https://media.ebird.org/catalog?regionCode=${locationId}&mediaType=photo&sort=rating_rank_desc&view=grid&tag=environmental`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Browse on eBird
          </a>
          .
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[450px] items-start overflow-y-auto mb-4 p-1">
        {photos.map((photo) => {
          const isSelected = selectedPhoto?.id === photo.id;
          const isDisabled = disabledIds.includes(photo.id);

          return (
            <div
              key={photo.id}
              className={`group relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                isSelected ? "ring-2 ring-blue-500" : isDisabled ? "opacity-50" : "hover:opacity-90"
              } ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"} bg-white border border-gray-200`}
              onClick={() => handlePhotoClick(photo)}
            >
              <div className="aspect-square relative bg-gray-50 flex items-center justify-center p-2">
                <img
                  src={`https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${photo.id.replace("ML", "")}/480`}
                  alt={photo.caption || `Photo by ${photo.by}`}
                  className="max-w-full max-h-full object-contain"
                />

                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-blue-500 rounded-full p-1">
                      <CheckIcon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}

                {isDisabled && (
                  <div className="absolute inset-0 bg-gray-500/30 flex items-center justify-center">
                    <div className="bg-gray-700 text-white px-2 py-1 rounded text-xs">In Use</div>
                  </div>
                )}
              </div>

              <div className="p-2 bg-white border-t border-gray-100">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-800 truncate">{photo.by}</p>
                  <p className="text-xs text-gray-500">{photo.date}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-8 text-gray-500">No Macaulay Library photos found for this location.</div>
      )}

      <ModalFooter>
        <BtnSmall type="button" color="green" onClick={handleConfirm} disabled={!selectedPhoto} className="px-4">
          Select Photo
        </BtnSmall>
        <BtnSmall type="button" color="gray" onClick={handleClose} className="px-4 ml-2">
          Cancel
        </BtnSmall>
      </ModalFooter>
    </>
  );
}
