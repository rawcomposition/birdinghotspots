import React from "react";
import { useModal, ModalFooter } from "providers/modals";
import BtnSmall from "components/BtnSmall";
import { MlImage } from "lib/types";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, ArrowsPointingInIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, ArrowPathIcon } from "@heroicons/react/20/solid";
import { clsx } from "clsx";
import Error from "components/Error";

type Props = {
  locationId: string;
  selectedId?: number;
  disabledIds?: number[];
  onSelect: (photo: MlImage) => void;
};

export default function FeaturedPhotoPicker({
  locationId,
  selectedId: initialSelectedId,
  disabledIds = [],
  onSelect,
}: Props) {
  const [selectedId, setSelectedId] = React.useState<number | null>(initialSelectedId || null);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const { close } = useModal();

  const { data, isLoading, error, refetch, isRefetching } = useQuery<{ success: boolean; images: MlImage[] }>({
    queryKey: ["/api/ml-photos", { locationId }],
    enabled: !!locationId,
  });

  const photos = data?.images || [];
  const selectedPhoto = photos.find((photo) => photo.id === selectedId) || null;

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFullScreen) return;

      if (event.key === "Escape") {
        setIsFullScreen(false);
        event.stopPropagation();
      } else if (event.key === "ArrowLeft") {
        navigateToPreviousPhoto();
      } else if (event.key === "ArrowRight") {
        navigateToNextPhoto();
      } else if (event.key === "Enter") {
        handleConfirm();
      }
    };

    if (isFullScreen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isFullScreen, data]);

  const handlePhotoClick = (photo: MlImage) => {
    if (disabledIds.includes(photo.id)) return;
    setIsFullScreen(true);
    setSelectedId(photo.id);
  };

  const closeFullSizeView = () => {
    setIsFullScreen(false);
  };

  const navigateToPreviousPhoto = () => {
    if (!isFullScreen) return;
    const currentIndex = photos.findIndex((photo) => photo.id === selectedId);
    if (currentIndex > 0) {
      const previousPhoto = photos[currentIndex - 1];
      if (!disabledIds.includes(previousPhoto.id)) {
        setSelectedId(previousPhoto.id);
      }
    }
  };

  const navigateToNextPhoto = () => {
    if (!isFullScreen) return;
    const currentIndex = photos.findIndex((photo) => photo.id === selectedId);
    if (currentIndex < photos.length - 1) {
      const nextPhoto = photos[currentIndex + 1];
      if (!disabledIds.includes(nextPhoto.id)) setSelectedId(nextPhoto.id);
    }
  };

  const handleConfirm = () => {
    if (selectedId) {
      if (selectedPhoto) onSelect(selectedPhoto);
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
        <Error message="Failed to load eBird photos " onReload={refetch} />
      </div>
    );
  }

  if (isFullScreen && selectedId && selectedPhoto) {
    const currentIndex = photos.findIndex((photo) => photo.id === selectedId);
    const canGoPrevious =
      currentIndex > 0 && photos.slice(0, currentIndex).some((photo) => !disabledIds.includes(photo.id));
    const canGoNext =
      currentIndex < photos.length - 1 &&
      photos.slice(currentIndex + 1).some((photo) => !disabledIds.includes(photo.id));

    return (
      <>
        <div className="relative bg-gray-900 flex items-center justify-center sm:h-[550px] -mx-4 sm:-mx-6 -my-5">
          <button
            onClick={closeFullSizeView}
            className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full h-10 w-10 flex items-center justify-center text-white transition-all duration-200 z-10"
            title="Close (Esc)"
          >
            <ArrowsPointingInIcon className="h-6 w-6" />
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
            src={`https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${selectedId}/1800`}
            alt={selectedPhoto?.caption || `Photo by ${selectedPhoto?.by}`}
            className="max-w-full max-h-full object-contain"
            key={selectedId}
          />
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <div className="bg-white/60 opacity-80 hover:opacity-100 transition-all duration-200 py-0.5 border-t rounded-full px-6 max-w-sm flex items-center justify-center gap-1">
              <span className="font-medium text-gray-800 truncate">{selectedPhoto.by}</span>
              <span className="rounded-full bg-gray-500 w-[4px] h-[4px] mx-1.5" />
              <span className="text-sm text-gray-600 whitespace-nowrap">{selectedPhoto.date}</span>
              <span className="rounded-full bg-gray-500 w-[4px] h-[4px] mx-1.5" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://media.ebird.org/asset/${selectedId}`, "_blank");
                }}
                className="ml-2 text-gray-600 hover:underline transition-colors duration-200"
                title="View on eBird"
              >
                Details
              </button>
            </div>
          </div>
        </div>
        <ModalFooter>
          <BtnSmall type="button" color="green" onClick={handleConfirm} disabled={!selectedPhoto} className="px-4">
            Select Photo
          </BtnSmall>
          <BtnSmall type="button" color="gray" onClick={closeFullSizeView} className="px-4 ml-2 flex items-center">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Grid
          </BtnSmall>
        </ModalFooter>
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600 font-medium">
          Choose a photo from the Macaulay Library, or{" "}
          <a
            href={`https://media.ebird.org/catalog?regionCode=${locationId}&mediaType=photo&sort=rating_rank_desc&view=grid&tag=environmental`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Browse on eBird
          </a>
          .
        </p>
        <button
          className="font-semibold rounded-lg text-[13px] py-px px-2.5 text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-xs focus:ring-4 focus:ring-gray-100 flex items-center gap-1"
          onClick={() => refetch()}
        >
          <ArrowPathIcon className={clsx("h-3.5 w-3.5", isRefetching && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[450px] items-start overflow-y-auto mb-4 p-1">
        {photos.map((photo) => {
          const isSelected = selectedId === photo.id;
          const isInUse = disabledIds.includes(photo.id) && !isSelected;

          return (
            <div
              key={photo.id}
              className={clsx(
                "group relativerounded-lg overflow-hidden transition-all duration-200",
                isSelected
                  ? "ring-2 ring-blue-500 cursor-pointer"
                  : isInUse
                  ? "cursor-default"
                  : "hover:opacity-90 cursor-pointer",
                "bg-white border border-gray-200"
              )}
              onClick={() => handlePhotoClick(photo)}
            >
              <div className="aspect-square relative bg-gray-50 flex items-center justify-center p-2">
                <img
                  src={`https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${photo.id}/480`}
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

                {isInUse && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <div className="bg-white shadow-sm text-gray-700 px-2 py-1 rounded text-xs">In Use</div>
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
        <div className="text-center py-8 text-gray-500">No eBird photos found for this location.</div>
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
