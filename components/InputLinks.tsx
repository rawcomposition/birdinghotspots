import { useFormContext, useFieldArray } from "react-hook-form";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableLinkItem from "components/SortableLinkItem";

type Props = {
  name: string;
  label?: string;
};

const InputLinks = ({ name, label }: Props) => {
  const { control } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ name, control });

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
    <div className="flex-1">
      {label && <label className="text-gray-500 font-bold">{label}</label>}
      <div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {fields.map((field: any, i) => (
              <SortableLinkItem key={field.id} baseName={name} handleDelete={remove} i={i} id={field.id} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <button
        type="button"
        className="bg-gray-700 py-1 px-4 text-sm rounded text-white mt-2"
        onClick={() => append({ label: "", url: "" })}
      >
        Add Link
      </button>
    </div>
  );
};

export default InputLinks;
