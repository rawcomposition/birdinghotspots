import React from "react";
import { useModal, ModalFooter } from "providers/modals";
import BtnSmall from "components/BtnSmall";
import { FeaturedMlImg } from "lib/types";
import { CheckIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
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
  const { close } = useModal();

  const { data, isLoading, error } = useQuery<{ success: boolean; images: FeaturedMlImg[] }>({
    queryKey: ["/api/ml-photos", { locationId }],
    enabled: !!locationId,
    meta: {
      errorMessage: "Failed to load photos",
    },
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

  const handlePhotoSelect = (photo: FeaturedMlImg) => {
    if (disabledIds.includes(photo.id)) return;
    setSelectedPhoto(photo);
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
        <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading photos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error.message || "Failed to load photos"}</p>
        <ModalFooter>
          <BtnSmall type="button" color="gray" onClick={handleClose} className="px-4">
            Close
          </BtnSmall>
        </ModalFooter>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <p className="text-gray-600 text-sm">
          Choose a photo from eBird Macaulay Library to feature.{" "}
          {disabledIds.length > 0 && "Grayed out photos are already in use."}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto mb-4 p-1">
        {photos.map((photo) => {
          const isSelected = selectedPhoto?.id === photo.id;
          const isDisabled = disabledIds.includes(photo.id);

          return (
            <div
              key={photo.id}
              className={`group relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                isSelected ? "ring-2 ring-blue-500" : isDisabled ? "opacity-50" : "hover:opacity-90"
              } ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"} bg-white border border-gray-200`}
              onClick={() => handlePhotoSelect(photo)}
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

              <div className="p-2 bg-white border-t border-gray-100 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-800 truncate">{photo.by}</p>
                  <p className="text-xs text-gray-500">{photo.date}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://media.ebird.org/asset/${photo.id.replace("ML", "")}`, "_blank");
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  title="View on eBird"
                >
                  <ExternalIcon className="w-3 h-3" />
                </button>
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
