import React from "react";

type Props = {
  text: string | React.ReactNode;
};

export default function Popover({ text }: Props) {
  return <div>{text}</div>;
}
