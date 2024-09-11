import Drag from "icons/Drag";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import { TrashIcon } from "@heroicons/react/24/outline";

type Props = {
  baseName: string;
  handleDelete: (i: number) => void;
  i: number;
  id: string;
};

export default function SortableLinkItem({ baseName, handleDelete, id, i }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: id || "",
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx("bg-gray-100 mb-2 rounded py-2 px-3 relative", isDragging ? "z-50" : "")}
    >
      <div className="flex gap-4">
        <button
          type="button"
          {...attributes}
          {...listeners}
          tabIndex={-1}
          className="cursor-move -mx-3 px-3 text-lg"
          aria-label="Drag to reorder"
        >
          <Drag />
        </button>
        <input
          type="text"
          placeholder="Label"
          {...register(`${baseName}.${i}.label` as const, { required: true })}
          className={`form-input ${(errors?.[baseName] as any)?.[i]?.label ? "input-error" : ""}`}
        />
        <input
          type="text"
          placeholder="URL"
          {...register(`${baseName}.${i}.url` as const, { required: true })}
          className={`form-input ${(errors?.[baseName] as any)?.[i]?.url ? "input-error" : ""}`}
        />
        <button type="button" onClick={() => handleDelete(i)} className="-mx-3 px-3">
          <TrashIcon className="h-5 w-5 mr-1 text-red-700 opacity-80" />
        </button>
      </div>
    </div>
  );
}
