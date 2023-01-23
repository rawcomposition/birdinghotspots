import * as React from "react";

type Props = {
  heading?: string;
  links?: { label: string; url: string }[];
};

export const StateLinkSection = ({ heading, links }: Props) => {
  if (!links?.length) return null;
  return (
    <>
      <h3 className="text-lg mb-1.5 font-bold break-after-avoid">{heading}</h3>
      <p className="mb-4 break-inside-avoid">
        {links.map(({ label, url }) => (
          <React.Fragment key={url}>
            <a href={url} target="_blank" rel="noreferrer">
              {label}
            </a>
            <br />
          </React.Fragment>
        ))}
      </p>
    </>
  );
};
