import Tooltip from "components/Tooltip";

type PropTypes = {
  className?: string;
  tooltip?: string;
  color?: string;
  children: React.ReactNode;
};

type ColorTypes = {
  [x: string]: string;
};

export default function Badge({ className, color = "default", children, tooltip }: PropTypes) {
  const colors: ColorTypes = {
    default: "bg-gray-600",
    green: "bg-lime-600",
    red: "bg-red-600",
    amber: "bg-amber-600",
  };
  const colorClasses = colors[color];
  if (tooltip) {
    return (
      <Tooltip text={tooltip}>
        <span className={`py-0.5 px-2 text-white rounded text-xs ml-1 whitespace-nowrap ${colorClasses} ${className}`}>
          {children}
        </span>
      </Tooltip>
    );
  }
  return (
    <span className={`py-0.5 px-2 text-white rounded text-xs ml-1 whitespace-nowrap ${colorClasses} ${className}`}>
      {children}
    </span>
  );
}
