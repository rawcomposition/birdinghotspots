import Link from "next/link";
import MapTooltip from "components/MapTooltip";
import useHoverMap from "hooks/useHoverMap";

export default function NevadaMap() {
  const { linkProps, pathProps, tooltipProps, svgRef } = useHoverMap();
  return (
    <>
      <MapTooltip {...tooltipProps} />
      <svg
        className="state-map hover-map max-w-[320px] sm:mr-[10%]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMinYMin meet"
        viewBox="300 30 332 495"
        ref={svgRef}
      >
        <Link href="/region/US-NV-003" {...linkProps}>
          <path
            {...pathProps}
            d="m528.183 398.448 32.19-.8 69.91.727.355 44.706-1.263.977-1.67 3.99-1.32.683.49 1.09-1.934 4.71-5.357.738-1.493-2.07-2.362-.924.368-1.604-3.497-4.115-1.96-.299-2.18 1.481-.97-.978-2.329.852-.36-1.6-3.31-.037-2.453 1.469-.83-.86-6.858 3.835 1.063 2.02-.33 1.272 1.059.622-1.156 1.401.136 2.25 1.793 4.48 2.57 2.641-2.445 1.414.585 1.325-.926 1.743.982 3.332-.627 3.294 1.38 1.65-.49 2.22 1.989 2.84-1.224 2.016 1.045 3.063-1.21 2.536 4.094 9.662 1.955 11.636-.498 3.693-3.788 1.821 2.425 2.249-1.76 2.354.07 2.152-67.043-65.313.013-14.164-2.764-.1Z"
          />
          <text>Clark</text>
        </Link>
        <Link href="/region/US-NV-017" {...linkProps}>
          <path {...pathProps} d="m528.182 398.443.17-84.16 49.377-.015v-44.185l52.585-.003-.03 128.295-69.911-.727Z" />
          <text>Lincoln</text>
        </Link>
        <Link href="/region/US-NV-033" {...linkProps}>
          <path
            {...pathProps}
            d="m592.29 270.082-14.56.001-50.108-34.434-.032-21.624.515.755 1.552-1.157 3.14-8.852-1.094-9.668 1.171-1.783-.196-4.418 1.148-2.852-2.265-10.094.509-4.273-.75-3.212.908-1.536-.62-.652 98.883.788-.177 103.01Z"
          />
          <text>White Pine</text>
        </Link>
        <Link href="/region/US-NV-009" {...linkProps}>
          <path
            {...pathProps}
            d="m388.511 325.097 3.955.187 36.518-40.806 24.887 28.446-.008 1.389 1.205-.016 2.967 3.415-.022 71.814Z"
          />
          <text>Esmeralda</text>
        </Link>
        <Link href="/region/US-NV-021" {...linkProps}>
          <path
            {...pathProps}
            d="m410.74 263.861 18.244 20.617-36.518 40.806-4.24-.177-40.298-36.46 13.83.004.262-30.966-6.215.061-.018-6.537 4.706-9.277 58.865.003-18.31 5.248.002 5.75Z"
          />
          <text>Mineral</text>
        </Link>
        <Link href="/region/US-NV-013" {...linkProps}>
          <path
            {...pathProps}
            d="m338.283 99.938.02-14.391 1.401.042.086-5.38-.026-7.884-1.068.013-.013-42.906 127.497-.41-.02 99.863-12.614.043-2.975 8.468-.031-11.377-18.978-.145.01-12.666-63.173.138.002-7.676-30.028.034Z"
          />
          <text>Humboldt</text>
        </Link>
        <Link href="/region/US-NV-007" {...linkProps}>
          <path
            {...pathProps}
            d="m579.286 29.131 51.489.3-.284 137.64-108.057-.755-8.677-39.133-.018-24.374-47.566-.025.007-73.761Z"
          />
          <text>Elko</text>
        </Link>
        <Link href="/region/US-NV-011" {...linkProps}>
          <path
            {...pathProps}
            d="m489.305 169.816.734-67.042 23.7.035.018 24.374 8.677 39.133 9.793.534-.908 1.621.75 3.212-.508 4.273 2.265 10.094-1.148 2.852.196 4.418-1.171 1.783 1.094 9.668-3.14 8.852-1.552 1.157-.515-.755.032 21.624-38.366.028.599-40.325Z"
          />
          <text>Eureka</text>
        </Link>
        <Link href="/region/US-NV-015" {...linkProps}>
          <path
            {...pathProps}
            d="m444.786 153.87 8.76-24.942 12.614-.043.013-26.1 23.866-.011-.783 132.903-40.413-.14-24.528 4.99-1.363-1.361.476-1.344-.845-.998 1.225-.404-.385-1.326 3.974-3.094.313-2.324-2.533-6.322.226-3.015 3.289-.695 1.145-2.614 1.636-.296.485-1.806-1.074-1.152 3.035-1.64.643-1.95 4.907-.918.889-1.044.17-3.79 1.142-1.753-1.354-1.588 1.2-2.457-1.297-1.791.697-2.297-1.113-.9-.039-1.584 1.903-8.382-.89-3.785-3.54-4.453Z"
          />
          <text>Lander</text>
        </Link>
        <Link href="/region/US-NV-001" {...linkProps}>
          <path
            {...pathProps}
            d="m350.074 218.53.03-8.396h1.522l.67-14.622 1.076-1.06-6.69 6.106-.617 1.467.075-3.497 1.033.002-.015-7.754-2.081-1.56-.92-13.653 93.08-.119 4.081 5.693.365 3.913-1.487 2.967-.465 4.717 1.185 1.814-.697 2.297 1.296 1.791-1.199 2.443 1.354 1.602-1.142 1.753-.171 3.795-5.795 1.957-.643 1.95-3.035 1.64 1.074 1.152-.485 1.806-1.636.296-1.145 2.614-3.289.695-.226 3.015 2.533 6.322-.313 2.324-4.814 4.824.845.998-.476 1.344 1.363 1.36-4.957 1.409-49.14-.07-.01-2.664-2.117-.028-.024-2.078-2.116-1v-1.107l-.989-.008-1.05-1.896-1.276-.027.027-2.11-3.14-2.053-1.03-2.098-1.25.007-.005-1.046-.994.033.013-1.13-1.039.01.007-1.04-1.039.003.005-1.04-1.026-.003v-1.04l-1.024-.007Z"
          />
          <text>Churchill</text>
        </Link>
        <Link href="/region/US-NV-027" {...linkProps}>
          <path
            {...pathProps}
            d="m337.848 175.53.043-37.528 1.408-.038.19-32.26 28.912-.034-.002 7.676 63.173-.138-.01 12.666 18.978.145.031 11.377-13.334 38.048Z"
          />
          <text>Pershing</text>
        </Link>
        <Link href="/region/US-NV-005" {...linkProps}>
          <path
            {...pathProps}
            d="m301.126 239.154 13.393-.094.503 2.073 24.35.092.056 6.613-5.028.526-.047 2.04-1.014-.005-.06 5.157-.974.01-.02 2.088.996-.007.006 2.086.988 1.008-.131 5.372 3.118.295.115 5.715 1.025.003.048 8.042-37.19-32.96Z"
          />
          <text>Douglas</text>
          <line x1="322.4787655893366" y1="253.41739590839808" x2="322.4787655893366" y2="253.41739590839808" />
        </Link>
        <Link href="/region/US-NV-019" {...linkProps}>
          <path
            {...pathProps}
            d="m332.286 257.6.02-2.034.974-.01.059-5.157 1.014.004.047-2.039 5.028-.526-.056-6.613-13.231-.155-1.31-4.916.726-2.84-4.832-.05-1.843-1.004-1.678-2.963 12.93-6.183 12.166-22.34 3.839-.12-.074 1.37 7.23-7.802-1 1.29-.67 14.622h-1.521l-.031 9.325 3.092 2.09 1.021 2.084 1.039-.004-.007 1.04 1.04-.009.984 2.143 1.251-.007 1.03 2.098 2.066.999v1.057l1.074-.003-.027 2.11 1.276.027 1.05 1.896.99.008-.001 1.107 2.116 1 .024 2.078 2.118.028.01 2.664-9.726.067-4.706 9.277.018 6.537 6.215-.06-.262 30.965-13.83-.004-9.478-8.479-.048-8.042-1.025-.003-.115-5.715-3.118-.295.13-5.372-.987-1.008-.006-2.086Z"
          />
          <text>Lyon</text>
        </Link>
        <Link href="/region/US-NV-031" {...linkProps}>
          <path
            {...pathProps}
            d="m318.553 210.042-.433 5.198h2.268l-.115 3.104-1.566 1.04 1.49 4.15-1.045-.008-.003 3.629-1.022-.003-.031 1.554-3.073 1.054-1.038 2.077-4.04 1.036-1.005 2.113-7.862.396.284-206.023 37.321.073.013 42.906 1.068-.013.026 7.883-.086 5.381-1.402-.042.071 20.157h1.116l.024 6.057-.214 26.203-1.408.038-.044 37.617 6.315-.055.915 13.652 2.081 1.56.015 7.754-1.033-.002-.001 2.127-3.839.119-1.003 1.934-5.18 2.54-4.802-.152-.841 1.653-3.12-.052-2.979 1.39-2.228 2.599Z"
          />
          <text>Washoe</text>
        </Link>
        <Link href="/region/US-NV-023" {...linkProps}>
          <path
            {...pathProps}
            d="m455.226 314.47-1.363-.157.008-1.39-52.821-59.99-.003-5.75 23.268-6.657 24.528-4.99 78.78.113 50.106 34.434v44.185l-49.376.016-.105 130.244 2.764.1-.013 14.164-72.986-69.266.046-71.69Z"
          />
          <text>Nye</text>
        </Link>
        <Link href="/region/US-NV-029" {...linkProps}>
          <path
            {...pathProps}
            d="m318.113 214.966.031-4.924 4.003.644 4.39-3.683 3.937-.254.927-1.674 4.715.173 5.021-2.888-11.003 20.754-12.93 6.183.892-.59.03-1.555 1.023.003.003-3.63 1.046.009-1.49-4.15 1.565-1.04.115-3.105Z"
          />
          <text>Storey</text>
          <line x1="327.4678021240725" y1="215.11733754355" x2="327.4678021240725" y2="215.11733754355" />
        </Link>
        <Link href="/region/US-NV-510" {...linkProps}>
          <path
            {...pathProps}
            d="m301.078 235.382 6.83.006 2.037-2.515 4.04-1.036 1.038-2.077 2.181-.463 1.678 2.963 1.843 1.004 4.832.05-.726 2.84 1.46 4.56-11.27.42-.502-2.074-13.393.094Z"
          />
          <text>Carson City</text>
          <line x1="315.1507055085984" y1="236.34967985862153" x2="315.1507055085984" y2="236.34967985862153" />
        </Link>
      </svg>
    </>
  );
}
