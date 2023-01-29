import * as React from "react";

type Props = {
  text: string;
  children: React.ReactNode;
  small?: boolean;
};

const Tooltip = ({ text, children, small }: Props) => {
  return (
    <div className="inline-block group relative">
      {children}
      <span
        className={`invisible opacity-0 group-hover:opacity-100 transition-opacity group-hover:visible absolute z-10 left-1/2 bottom-0 bg-gray-700 text-white text-sm rounded shadow-md mb-6 -translate-x-1/2 ${
          small ? "p-2 text-center w-32" : "p-3 w-[200px]"
        }`}
      >
        {text}
      </span>
    </div>
  );
};

export default Tooltip;
