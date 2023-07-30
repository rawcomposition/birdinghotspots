import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import AsyncSelectStyled from "components/AsyncSelectStyled";
import { components, MultiValueProps, MultiValueRemoveProps, OnChangeValue } from "react-select";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Highlighter from "react-highlight-words";

type Option = {
  value: string;
  label: string;
};

type Props = {
  name: string;
  regionCode?: string;
  required?: boolean;
  [x: string]: any;
};

export default function HotspotSelect({ name, regionCode, required, ...props }: Props) {
  const { control, watch } = useFormContext();
  const value = watch(name);

  const loadOptions = async (inputValue: string, callback: (options: Option[]) => void) => {
    let ids: any = [];
    if (Array.isArray(value)) {
      ids = value.map(({ value }) => value).join(",");
    } else if (typeof value === "string") {
      ids = value;
    }
    const response = await fetch(`/api/hotspot/search?regionCode=${regionCode || ""}&q=${inputValue}&ids=${ids}`);
    const json = await response.json();
    const options = json.results;
    callback(options || []);
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: required ? "This field is required" : false }}
      render={({ field: { ref, value, onChange, ...field } }) => {
        const onDragEnd = (event: DragEndEvent) => {
          const { active, over } = event;

          if (!active || !over) return;
          const oldIndex = value.findIndex((item: Option) => item.value === active.id);
          const newIndex = value.findIndex((item: Option) => item.value === over.id);
          onChange(arrayMove(value, oldIndex, newIndex));
        };

        return (
          <DndContext modifiers={[restrictToParentElement]} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
            <SortableContext items={value.map((o: Option) => o.value)} strategy={rectSortingStrategy}>
              <AsyncSelectStyled
                loadOptions={loadOptions}
                formatOptionLabel={formatOptionLabel}
                components={{
                  MultiValue,
                  MultiValueRemove,
                  ClearIndicator,
                }}
                defaultOptions
                noOptionsMessage={({ inputValue }: any) =>
                  inputValue.length ? "No Results" : "Search for a hotspot..."
                }
                value={value}
                onChange={onChange}
                {...field}
                {...props}
              />
            </SortableContext>
          </DndContext>
        );
      }}
    />
  );
}

function formatOptionLabel({ label }: any, { inputValue }: any) {
  return <Highlighter searchWords={[inputValue]} textToHighlight={label} highlightTag="b" />;
}

const MultiValue = (props: MultiValueProps<Option>) => {
  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const innerProps = { ...props.innerProps, onMouseDown };
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.data.value,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div style={style} ref={setNodeRef} {...attributes} {...listeners}>
      <components.MultiValue {...props} innerProps={innerProps} />
    </div>
  );
};

const MultiValueRemove = (props: MultiValueRemoveProps<Option>) => {
  return (
    <components.MultiValueRemove
      {...props}
      innerProps={{
        onPointerDown: (e) => e.stopPropagation(),
        ...props.innerProps,
      }}
    />
  );
};

const ClearIndicator = (props: any) => {
  const {
    children = "",
    getStyles,
    innerProps: { ref, ...restInnerProps },
  } = props;
  return (
    <div {...restInnerProps} ref={ref} style={getStyles("clearIndicator", props)}>
      <div style={{ padding: "0px 16px" }}>{children}</div>
    </div>
  );
};
