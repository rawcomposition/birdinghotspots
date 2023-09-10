import React from "react";
import clsx from "clsx";
import { Region } from "lib/types";

type Props = {
  regionCode: string;
  className?: string;
};

const data = [
  {
    code: "US-MO",
    html: (
      <>
        A project supported by the
        <br />
        <a href="https://mobirds.org" target="_blank">
          Missouri Birding Society
        </a>
      </>
    ),
    imgUrl: "/mbs-logo.jpg",
  },
  {
    code: "US-OH",
    html: (
      <>
        A project supported by the
        <br />
        <a href="https://ohiobirds.org" target="_blank">
          Ohio Ornithological Society
        </a>
      </>
    ),
    imgUrl: "/oh-logo-small.jpg",
  },
  {
    code: "US-IA",
    html: (
      <>
        A project supported by the
        <br />
        <a href="https://iowabirds.org" target="_blank">
          Iowa Ornithologists’ Union
        </a>
      </>
    ),
    imgUrl: "/ioulogo.png",
  },
  {
    code: "US-SD",
    html: (
      <>
        A project supported by the
        <br />
        <a href="https://sdou.org" target="_blank">
          South Dakota Ornithologists’ Union
        </a>
      </>
    ),
    imgUrl: "/sdou-logo.png",
  },
  {
    code: "US-NE",
    html: (
      <>
        A project supported by the
        <br />
        <a href="https://www.noubirds.org" target="_blank">
          Nebraska Ornithologists’ Union
        </a>
      </>
    ),
    imgUrl: "/NOUl.jpg",
  },
  {
    code: "US-KS",
    html: (
      <>
        A project supported by the
        <br />
        <a href="https://ksbirds.org/kos/KOSindex.html" target="_blank">
          Kansas Ornithological Society
        </a>
      </>
    ),
    imgUrl: "/KOS.jpg",
  },
];

export default function RegionBranding({ regionCode, className }: Props) {
  const branding = data.find((d) => d.code === regionCode || regionCode.startsWith(d.code));
  if (!branding) return null;
  return (
    <div className={clsx("flex gap-4 items-center", className)}>
      <img src={branding.imgUrl} className="w-20" />
      <p className="font-bold text-secondary">{branding.html}</p>
    </div>
  );
}
