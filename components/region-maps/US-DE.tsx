import Link from "next/link";
import MapTooltip from "components/MapTooltip";
import useHoverMap from "hooks/useHoverMap";

export default function DelawareMap() {
  const { linkProps, pathProps, tooltipProps, svgRef } = useHoverMap();

  return (
    <>
      <MapTooltip {...tooltipProps} />
      <svg
        className="state-map hover-map max-w-[150px] sm:!mr-[10%]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMinYMin meet"
        viewBox="390 30 200 480"
        ref={svgRef}
      >
        <Link href="/region/US-DE-005" {...linkProps}>
          <path
            {...pathProps}
            d="m408.798 377.71 44.926-1.992 19.004-23.69 22.174-4.79 2.198-12.886 20.516.975 3.38 13.7 30.434 36.597 15.155 8.468 9.897-2.223 1.364-5.228 11.548 121.012-172.841-3.018Z"
          />
          <text>Sussex</text>
        </Link>
        <Link href="/region/US-DE-003" {...linkProps}>
          <path
            {...pathProps}
            d="m450.9 140.836 1.02-1.975-1.529 4.141Zm-1.542-38.345 3.178-1.637.959 8.348-1.626.211Zm-2.43 8.927 2.571 1.866 1.654 1.654-2.014 1.21Zm-55.84-20.842.017-21.902h3.97l12.53-21.594 17.218-12.92 33.101-5.955 31.08 11.029-12.087 7.027-25.132 45.228-6.675 1.984-7.448 12.205 2.758 9.057 11.154 9.627-7.853 32.896 14.427 17.73 7.008 17.638-10.99 4.384-5.698 13.717-21.404 7.709-28.321-1.952Z"
          />
          <text>New Castle</text>
        </Link>
        <Link href="/region/US-DE-001" {...linkProps}>
          <path
            {...pathProps}
            d="m398.743 216.484 28.321 1.952 18.684-6.05 8.417-15.376 10.99-4.384 19.663 18.118 9.206 19.24 2.71 18.9-5.034 17.267 3.035 29.855 16.392 16.197 6.954 13.517.812 12.019-18.425-5.5-5.38 4.88-.48 10.393-21.88 4.517-19.004 23.689-44.926 1.992Z"
          />
          <text>Kent</text>
        </Link>
      </svg>
    </>
  );
}
