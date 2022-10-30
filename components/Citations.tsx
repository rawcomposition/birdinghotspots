import * as React from "react";
import { Link, Citation } from "lib/types";

type Props = {
  citations?: Citation[];
  links?: Link[];
};

export default function Citations({ citations, links }: Props) {
  const filteredLinks = links?.filter((it) => it.cite);
  const allCitations = [...(filteredLinks || []), ...(citations || [])];
  if (!allCitations.length) {
    return null;
  }

  return (
    <>
      <p className="text-xs mt-8 border-t pt-4 border-gray-100">
        Content from{" "}
        {allCitations.map(({ label, url }, index) => (
          <React.Fragment key={label}>
            {url ? (
              <a href={url} target="_blank" rel="noreferrer">
                {label}
              </a>
            ) : (
              <span>{label}</span>
            )}
            {index < allCitations.length - 2 && ", "}
            {index === allCitations.length - 2 && allCitations.length === 2 && " and "}
            {index === allCitations.length - 2 && allCitations.length !== 2 && ", and "}
          </React.Fragment>
        ))}
      </p>
    </>
  );
}
