import * as React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Popover, Transition } from "@headlessui/react";

type Item = {
  label: string;
  url: string;
};

const InputCitations = () => {
  const {
    register,
    control,
    formState: { errors },
    watch,
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({ name: "citations", control });

  const citations = watch("citations") || [];
  const links = watch("links") || [];

  const unusedLinks = links.filter((link: Item) => !citations.some((citation: Item) => citation.label === link.label));

  return (
    <div className="flex-1">
      <label className="text-gray-500 font-bold">Citations</label>
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
      {unusedLinks.length === 0 && (
        <button
          type="button"
          className="bg-gray-700 py-1 px-4 text-sm rounded text-white mt-2"
          onClick={() => append({ label: "", url: "" })}
        >
          Add Citation
        </button>
      )}
      {unusedLinks.length > 0 && (
        <Popover className="relative">
          {({ close, open }) => (
            <>
              <Popover.Button className="bg-gray-700 py-1 px-4 text-sm rounded text-white mt-2">
                <span>Add Citation</span>
              </Popover.Button>
              <Transition
                as={React.Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute -left-4 z-10 mt-3 w-screen max-w-sm transform px-4 sm:px-0">
                  <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="relative bg-white p-6 space-y-2">
                      <h4 className="text-gray-500 font-medium">Choose from link</h4>
                      <ul>
                        {unusedLinks.map((link: any, index: number) => (
                          <li key={index}>
                            <button
                              type="button"
                              className="text-[#4a84b2] font-bold"
                              onClick={() => append({ label: link.label, url: link.url })}
                            >
                              {link.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                      <hr className="!mt-3" />
                      <button
                        type="button"
                        className="text-[#4a84b2] font-bold"
                        onClick={() => append(() => append({ label: "", url: "" }))}
                      >
                        Or add custom citation
                      </button>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      )}
    </div>
  );
};

export default InputCitations;
