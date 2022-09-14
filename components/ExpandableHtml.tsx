import * as React from "react";

type Props = {
  html: string;
  className?: string;
  isGray?: boolean;
};

export default function AboutSection({ html, className, isGray }: Props) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  return (
    <div className={`relative ${isExpanded ? "pb-6" : ""}`}>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className={`${!isExpanded ? "h-32 overflow-hidden" : ""} ${className || ""}`}
      />
      {!isExpanded && (
        <div
          className={`w-full h-16 bg-gradient-to-t ${
            isGray ? "from-gray-100 via-gray-100/90" : "from-white"
          } absolute bottom-0`}
        />
      )}
      <button
        className="text-sky-700 font-bold text-xs z-10 absolute bottom-0 left-0"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        {isExpanded ? "Collapse" : "Read more"}
      </button>
    </div>
  );
}
