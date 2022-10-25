import { useFormContext, useFieldArray } from "react-hook-form";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Link, Citation } from "lib/types";

type Props = {
  groupLinks?: Link[];
  groupCitations?: Citation[];
};

const InputCitations = ({ groupCitations, groupLinks }: Props) => {
  const {
    register,
    control,
    formState: { errors },
    watch,
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({ name: "citations", control });

  const links = watch("links") || [];
  const linkCitations = links.filter((it: Link) => it.cite);
  const groupItems = [...(groupLinks?.filter((it) => it.cite) || []), ...(groupCitations || [])];
  const hasExtraCitations = groupItems.length > 0 || linkCitations.length > 0;

  return (
    <>
      {!!groupItems && groupItems.length > 0 && (
        <div className="bg-gray-100 px-3 py-2 rounded-md">
          <h4 className="text-gray-500 font-bold">Citations from Group Page(s)</h4>
          {groupItems.map(({ label, url }) => (
            <>
              <a href={url} key={url} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
              <br />
            </>
          ))}
        </div>
      )}
      {!!linkCitations && linkCitations.length > 0 && (
        <div className="bg-gray-100 px-3 py-2 rounded-md">
          <h4 className="text-gray-500 font-bold">Citations from Links</h4>
          {linkCitations.map(({ label, url }: Citation) => (
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
        <label className="text-gray-500 font-bold">{hasExtraCitations ? "Additional Citations" : "Citations"}</label>
        <div>
          {fields.map((field, index) => {
            //@ts-ignore
            const error = errors?.citations?.[index] as any;
            return (
              <div className="flex gap-4" key={field.id}>
                <input
                  type="text"
                  placeholder="Label"
                  {...register(`citations.${index}.label` as const, { required: true })}
                  className={`form-input ${error?.label ? "input-error" : ""}`}
                />
                <input
                  type="text"
                  placeholder="URL (optional)"
                  {...register(`citations.${index}.url` as const)}
                  className={`form-input ${error?.url ? "input-error" : ""}`}
                />
                <button type="button" onClick={() => remove(index)}>
                  <TrashIcon className="h-6 w-6 text-red-700 opacity-80" />
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="bg-gray-700 py-1 px-4 text-sm rounded text-white mt-2"
          onClick={() => append({ label: "", url: "" })}
        >
          Add Citation
        </button>
      </div>
    </>
  );
};

export default InputCitations;
