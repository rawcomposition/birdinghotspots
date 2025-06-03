import { useFormContext, useFieldArray } from "react-hook-form";
import SortableImage from "./SortableImage";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { MlImage } from "lib/types";
import { useQuery } from "@tanstack/react-query";

type Props = {
  locationId: string;
};

export default function InputFeaturedImages({ locationId }: Props) {
  const { control, watch } = useFormContext();
  const { fields, move } = useFieldArray({ name: "featuredImages", control });
  const featuredImages = watch("featuredImages");
  const imageIds = featuredImages.map((it: { id: string; data: MlImage | null }) => it.data?.id).filter(Boolean);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = fields.map(({ id }) => id);
  const mlIds = featuredImages.map((it: { data: MlImage | null }) => it.data?.id).filter(Boolean);

  const { data: isMissingData } = useQuery<{ missingIds: number[] }>({
    queryKey: ["/api/check-ml-ids", { assetIds: mlIds.join(",") }],
    enabled: !!ids.length,
  });

  const missingIds = isMissingData?.missingIds;

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    move(oldIndex, newIndex);
  }

  return (
    <div className="mt-2">
      {!!missingIds?.length && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-500 font-medium">Some images are missing from eBird and should be removed</p>
        </div>
      )}
      {!!fields.length && (
        <div className="grid lg:grid-cols-2 gap-4 mb-4 sortableGrid">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={rectSortingStrategy}>
              {fields.map((field: any, i) => (
                <SortableImage
                  key={field.id}
                  id={field.id}
                  i={i}
                  locationId={locationId}
                  disabledIds={imageIds}
                  missingIds={missingIds}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
