import { useFormContext, useFieldArray } from "react-hook-form";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Link } from "lib/types";

type Props = {
  name?: string;
  groupLinks?: Link[];
  hideLabel?: boolean;
};

const InputHotspotLinks = ({ name = "links", groupLinks, hideLabel }: Props) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({ name, control });
  return (
    <>
      {!!groupLinks && groupLinks.length > 0 && (
        <div className="bg-gray-100 px-3 py-2 rounded-md">
          <h4 className="text-gray-500 font-bold">Links from Group Page(s)</h4>
          {groupLinks.map(({ label, url }) => (
            <>
              <a href={url} key={url} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
              <br />
            </>
          ))}
        </div>
      )}
      <div className="flex-1">
        {!hideLabel && <label className="text-gray-500 font-bold">Links</label>}
        <div>
          {fields.map((field, index) => {
            //@ts-ignore
            const error = errors?.links?.[index] as any;
            return (
              <div key={field.id} className="bg-gray-100 mb-2 rounded py-2 px-3">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Label"
                    {...register(`links.${index}.label` as const, { required: true })}
                    className={`form-input ${error?.label ? "input-error" : ""}`}
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    {...register(`links.${index}.url` as const, { required: true })}
                    className={`form-input ${error?.url ? "input-error" : ""}`}
                  />
                  <button type="button" onClick={() => remove(index)}>
                    <TrashIcon className="h-5 w-5 mr-1 text-red-700 opacity-80" />
                  </button>
                </div>
                <label className="flex gap-1 items-center mt-1">
                  <input
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    {...register(`links.${index}.cite` as const)}
                  />
                  Include as citation
                </label>
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
    </>
  );
};

export default InputHotspotLinks;
