import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { useFormContext, useController } from "react-hook-form";
import { useModal } from "providers/modals";
import { MlImage } from "lib/types";
import { ArrowPathRoundedSquareIcon, ExclamationTriangleIcon, PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";

type Props = {
  i: number;
  id: string;
  locationId: string;
  disabledIds?: string[];
  missingIds?: number[];
};

export default function SortableImage({ id, i, locationId, disabledIds, missingIds }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: id || "",
  });

  const { open } = useModal();
  const { control } = useFormContext();

  const { field } = useController({
    control,
    name: `featuredImages.${i}.data`,
  });

  const mlId = (field.value as MlImage | null)?.id;
  const isMissing = missingIds?.includes(mlId || 0);

  const onSelect = (photo: MlImage) => {
    field.onChange(photo);
  };

  const onDelete = () => {
    if (!confirm("Are you sure you want to remove this image?")) return;
    field.onChange(null);
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  return (
    <div
      className={clsx(
        "rounded h-full border bg-white border-gray-200 shadow-sm relative max-w-sm group aspect-[1.19] p-3 pb-0 flex flex-col",
        isDragging && "z-10"
      )}
      ref={setNodeRef}
      style={style}
      key={id}
    >
      {mlId ? (
        <>
          <img
            src={`https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${mlId}/480`}
            alt="Featured Photo"
            className="w-full h-0 flex-1 object-contain cursor-move"
            {...attributes}
            {...listeners}
          />
          <div className="flex items-center py-1.5 gap-4 shrink-0">
            <button
              type="button"
              className="flex gap-1 items-center text-[#4a84b2] font-medium"
              onClick={() => open("featuredPhotoPicker", { locationId, disabledIds, selectedId: mlId, onSelect })}
            >
              <ArrowPathRoundedSquareIcon className="h-4 w-4" />
              Replace
            </button>
            <button type="button" className="flex gap-1 items-center text-[#4a84b2] font-medium" onClick={onDelete}>
              <TrashIcon className="h-4 w-4" />
              Remove
            </button>
            {isMissing && (
              <span className="flex items-center gap-1 cursor-default ml-auto">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                <span className="text-red-600">Missing</span>
              </span>
            )}
          </div>
        </>
      ) : (
        <button
          type="button"
          className="absolute inset-0 flex flex-col gap-2 items-center justify-center w-full"
          onClick={() => open("featuredPhotoPicker", { locationId, disabledIds, selectedId: mlId, onSelect })}
        >
          <PhotoIcon className="h-8 w-8 text-gray-600" />
          <span className="text-gray-700 text-[15px] font-medium">Select Featured Image #{i + 1}</span>
        </button>
      )}
    </div>
  );
}
