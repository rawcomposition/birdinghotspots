import { useFormContext, useFieldArray } from "react-hook-form";
import SortableImage from "./SortableImage";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { FeaturedMlImg } from "lib/types";

type Props = {
  locationId: string;
};

export default function InputFeaturedImages({ locationId }: Props) {
  const { control, watch } = useFormContext();
  const { fields, move } = useFieldArray({ name: "featuredImages", control });
  const featuredImages = watch("featuredImages");
  const imageIds = featuredImages.map((it: { id: string; data: FeaturedMlImg | null }) => it.data?.id).filter(Boolean);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
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
                <SortableImage key={field.id} id={field.id} i={i} locationId={locationId} disabledIds={imageIds} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
