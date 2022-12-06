import * as React from "react";
import Info from "icons/Info";

type Props = {
  text: string;
};

const Help = ({ text }: Props) => {
  return (
    <div className="inline-block group relative">
      <Info className="text-[16px] text-slate-500 ml-1 -mt-px cursor-pointer" />
      <span className="invisible opacity-0 group-hover:opacity-100 transition-opacity group-hover:visible absolute z-10 left-1/2 bottom-0 bg-gray-700 text-white text-sm p-3 rounded shadow-md mb-6 -translate-x-1/2 w-[200px]">
        {text}
      </span>
    </div>
  );
};

export default Help;
