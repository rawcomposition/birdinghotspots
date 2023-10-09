import React from "react";
import Info from "icons/Info";
import Tooltip from "components/Tooltip";

type Props = {
  text: string;
};

const Help = ({ text }: Props) => {
  return (
    <Tooltip text={text}>
      <Info className="text-[16px] text-slate-500 ml-1 -mt-px cursor-pointer" />
    </Tooltip>
  );
};

export default Help;
