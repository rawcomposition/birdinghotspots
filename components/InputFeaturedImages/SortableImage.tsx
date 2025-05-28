import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import InputFeaturedImg from "components/InputFeaturedImg";
import { useFormContext, useController } from "react-hook-form";
import { useModal } from "providers/modals";
import { FeaturedMlImg } from "lib/types";
import { TrashIcon } from "@heroicons/react/24/outline";

type Props = {
  handleDelete: (i: number) => void;
  i: number;
  id: string;
  locationId: string;
  disabledIds?: string[];
};

export default function SortableImage({ handleDelete, id, i, locationId, disabledIds }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: id || "",
  });

  const { open } = useModal();
  const { control } = useFormContext();

  const { field } = useController({
    control,
    name: `featuredImages.${i}.data`,
  });

  const mlId = field.value?.id;

  const onSelect = (photo: FeaturedMlImg) => {
    field.onChange(photo);
  };

  const onDelete = () => {
    if (!confirm("Are you sure you want to remove this image?")) return;
    handleDelete(i);
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  return (
    <div
      className={clsx("bg-gray-200 rounded relative w-full max-w-sm aspect-[4/3] group", isDragging && "z-10")}
      ref={setNodeRef}
      style={style}
      key={id}
      {...attributes}
      {...listeners}
    >
      {mlId && (
        <img
          src={`https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${mlId.replace("ML", "")}/480`}
          alt="Featured Photo"
          className="w-full h-full object-cover"
        />
      )}
      <button
        type="button"
        className="absolute inset-0 flex items-center justify-center"
        onClick={() => open("featuredPhotoPicker", { locationId, disabledIds, selectedId: mlId, onSelect })}
      >
        {mlId ? (
          <div className="bg-white/80 opacity-0 group-hover:opacity-100 hover:bg-white/100 transition-all text-gray-700 text-sm font-medium px-2 py-1 rounded-md">
            Replace Image
          </div>
        ) : (
          <span className="text-gray-700 text-[15px] font-medium">Select Featured Image #{i + 1}</span>
        )}
      </button>
      {mlId && (
        <button
          type="button"
          tabIndex={-1}
          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-700/90 p-1.5 rounded-full flex items-center justify-center absolute -left-2 -top-2 shadow"
          onClick={onDelete}
        >
          <TrashIcon className="h-4 w-4 text-white opacity-80" />
        </button>
      )}
    </div>
  );
}
