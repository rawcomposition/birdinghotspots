import { Menu } from "@headlessui/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

export const filters = [
  {
    label: "Images",
    name: "images",
    options: [
      { label: "All", value: "" },
      { label: "Has Images", value: "Yes" },
      { label: "No Images", value: "No" },
    ],
  },
  {
    label: "Content",
    name: "content",
    options: [
      { label: "All", value: "" },
      { label: "Has Content", value: "Yes" },
      { label: "No Content", value: "No" },
    ],
  },
  {
    label: "Features",
    name: "features",
    options: [
      { label: "All", value: "" },
      { label: "Restrooms on site", value: "Restrooms" },
      { label: "Wheelchair accessible", value: "Accessible" },
      { label: "Free entrance", value: "Free" },
      { label: "Roadside viewing", value: "Roadside" },
    ],
  },
];

export default function HotspotFilters() {
  const router = useRouter();

  return (
    <div className="flex gap-2 mt-4 flex-wrap">
      {filters.map(({ label, name, options }) => {
        const query = router.query[name] as string;
        const selectedOption = options?.find((it) => it.value === query);
        const isSelected = !!selectedOption?.value;
        return (
          <div className="relative inline-block" key={name}>
            <Menu>
              <Menu.Button
                className={clsx(
                  "text-[13px] rounded-md px-2 inline-flex items-center gap-1 pl-2.5",
                  isSelected ? "bg-primary text-white font-bold" : "bg-gray-100 text-gray-600 font-medium"
                )}
              >
                {isSelected && selectedOption?.label ? selectedOption.label : label}
                <ChevronDownIcon className="w-4 h-4" />
              </Menu.Button>
              <Menu.Items className="absolute left-0 top-8 rounded bg-white shadow-lg px-4 py-2 w-[190px] ring-1 ring-black ring-opacity-5 flex flex-col gap-1 z-10">
                {options?.map(({ label, value }) => (
                  <Menu.Item key={value}>
                    <Link
                      className="py-0.5 text-[13px] font-medium text-left text-gray-600 flex items-center"
                      href={{
                        pathname: router.pathname,
                        query: { ...router.query, [name]: value },
                      }}
                    >
                      <span
                        className={clsx(
                          "font-bold text-2xl mr-2",
                          (value === "" && !selectedOption?.value) || selectedOption?.value === value
                            ? "text-primary"
                            : "text-gray-200"
                        )}
                      >
                        •
                      </span>
                      {label}
                    </Link>
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Menu>
          </div>
        );
      })}
    </div>
  );
}
