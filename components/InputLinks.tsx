import { useFormContext, useFieldArray } from "react-hook-form";
import { TrashIcon } from "@heroicons/react/24/outline";

type Props = {
  name: string;
  label?: string;
};

const InputLinks = ({ name, label }: Props) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({ name, control });
  return (
    <div className="flex-1">
      {label && <label className="text-gray-500 font-bold">{label}</label>}
      <div>
        {fields.map((field, index) => {
          //@ts-ignore
          const error = errors?.[name]?.[index] as any;
          return (
            <div key={field.id} className="bg-gray-100 mb-2 rounded py-2 px-3">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Label"
                  {...register(`${name}.${index}.label` as const, { required: true })}
                  className={`form-input ${error?.label ? "input-error" : ""}`}
                />
                <input
                  type="text"
                  placeholder="URL"
                  {...register(`${name}.${index}.url` as const, { required: true })}
                  className={`form-input ${error?.url ? "input-error" : ""}`}
                />
                <button type="button" onClick={() => remove(index)}>
                  <TrashIcon className="h-5 w-5 mr-1 text-red-700 opacity-80" />
                </button>
              </div>
            </div>
          );
        })}
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
