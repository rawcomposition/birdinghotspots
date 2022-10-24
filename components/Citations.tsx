import * as React from "react";

type Props = {
  citations: {
    label: string;
    url: string;
  }[];
};

export default function Citations({ citations }: Props) {
  return (
    <>
      {!!citations && citations.length > 0 && (
        <p className="text-xs mt-8 border-t pt-4 border-gray-100">
          Content from{" "}
          {citations.map(({ label, url }, index) => (
            <React.Fragment key={label}>
              {url ? (
                <a href={url} target="_blank" rel="noreferrer">
                  {label}
                </a>
              ) : (
                <span>{label}</span>
              )}
              {index < citations.length - 2 && ", "}
              {index === citations.length - 2 && ", and "}
            </React.Fragment>
          ))}
        </p>
      )}
    </>
  );
}
