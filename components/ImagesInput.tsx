import { useFormContext, useFieldArray } from "react-hook-form";
import Uppy from "components/Uppy";
import SortableImage from "./SortableImage";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { useModal } from "providers/modals";

type Props = {
  hideExtraFields?: boolean;
  enableStreetview?: boolean;
  hideMapCheckbox?: boolean;
  showHideFromChildrenCheckbox?: boolean;
};

export default function ImagesInput({
  hideExtraFields,
  enableStreetview,
  hideMapCheckbox,
  showHideFromChildrenCheckbox,
}: Props) {
  const { control } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ name: "images", control });
  const { open } = useModal();

  const handleDelete = async (i: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    remove(i);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = fields.map(({ id }) => id);

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    move(oldIndex, newIndex);
  }

  return (
    <div className="mt-2">
      {!!fields.length && (
        <div className="grid lg:grid-cols-2 gap-4 mb-4 sortableGrid">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={rectSortingStrategy}>
              {fields.map((field: any, i) => (
                <SortableImage
                  key={field.id}
                  i={i}
                  handleDelete={handleDelete}
                  hideExtraFields={hideExtraFields}
                  hideMapCheckbox={hideMapCheckbox}
                  showHideFromChildrenCheckbox={showHideFromChildrenCheckbox}
                  {...field}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      <Uppy onSuccess={(result) => append(result)} />
      {enableStreetview && (
        <button
          type="button"
          className="text-[#2275d7] text-xs font-medium"
          onClick={() =>
            open("addStreetView", {
              onSuccess: (result: any) => append(result),
            })
          }
        >
          Or add Google Street View
        </button>
      )}
    </div>
  );
}
