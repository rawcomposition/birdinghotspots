import Link from "next/link";
import MapTooltip from "components/MapTooltip";
import useHoverMap from "hooks/useHoverMap";

export default function GeorgiaMap() {
  const { linkProps, pathProps, tooltipProps, svgRef } = useHoverMap();

  return (
    <>
      <MapTooltip {...tooltipProps} />
      <svg
        className="state-map hover-map max-w-[500px]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMinYMin meet"
        ref={svgRef}
        viewBox="145 25 680 500"
      >
        <Link href="/region/US-OR-005" {...linkProps}>
          <path
            {...pathProps}
            d="m286.403 141.58 1.792.018.006-3.447 8.603 1.674.002-12.074 7.958.07-1.027-2.998 1.626-.438 68.863-.023 3.634 7.044 6.642 3.466-.535 5.007 2.03 4.103-1.495 4.43 1.343 1.117-.144 2.569-5.383 2.734-.15 1.688 4.103 8.318 2.845.245 1.2 3.67-.613 2.663-2.723.079-2.215 3.335-5.112.034-.275 2.615-1.953.441 1.649 7.239-.883 1.533 2.685-.536 1.406 3.232 2.755 1.034-1.66 2.386-55.859-.003.12-2.168-9.093-1.836-5.085-7.592-2.191-.848-.048-3.404-9.191-4.703-6.5-7.742.676-4.429 1.915-2.421-.637-2.511 1.718-6.687-3.834-.004-.002-1.705-6.978 1.69Z"
          />
          <text>Clackamas</text>
        </Link>
        <Link href="/region/US-OR-021" {...linkProps}>
          <path
            {...pathProps}
            d="m471.913 91.366 5.225-1.116 7.146 5.58 8.537.096 16.186-3.204 3.376-4.322 14.322-6.07-.591 66.351 10.406.094-.132 10.437 10.402-.007-.082 10.44-2.522.004.011 1.593-59.016-.054-1.65-3.129 3.184-2.018 1.198 1.247-.265-3.44 1.412-1.551-2.295-1.03-.453-4.931-5.035-2.021 1.45-1.451-1.71.012-.938-3.331 1.877-1.024-1.835-2.642.846-2.537 1.793.286-1.4-1.358 1.123-1.513-1.34-2.598.745-2.885 1.835-1.002-1.675-.346 1.18-1.563-.854-.68 3.829-2.41-1.935-.92 1.876-.87-1.106-1.362 1.215-1.505-1.13-.693 3.472-2.37 3.724 1.775-1.416-3.3 4.943.323.593-1.743-1.651-1.662 1.885-1.194-4.11-2.879-.31-4.492-2.807-1.454.31-2.234-2.296.813-1.745-4.274-4.908-1.685Z"
          />
          <text>Gilliam</text>
        </Link>
        <Link href="/region/US-OR-033" {...linkProps}>
          <path
            {...pathProps}
            d="m188.043 482.038 2.794-3.627.02-8.713 7.462.184 3.695-2.104 2.14-7.972 2.536-3.31-.994-2.263 9.615-17.3-.001 5.066 1.647.008-.013-1.633 1.652 1.623 8.007-.028 1.637 2.549 5.685 1.747 7.783-.917.097-1.671h2.366l.035-1.658 10.242 1.72.01 2.506 1.641-.021-.125 79.205-49.505.938-2.262-5.646 2.266-4.685-3.063-5.411 3.85-3.903-.66-3.315 2.514-2.43-.145-1.942-1.676-.72-2.942-6.253.655-1.471-2.52-1.2-1.545-3.248-11.639-.878Z"
          />
          <text>Josephine</text>
        </Link>
        <Link href="/region/US-OR-035" {...linkProps}>
          <path
            {...pathProps}
            d="m334.819 511.524.619-107.045 17.285-.003-1.33-2.19 4.454-12.027-.142-3.05 5.568-5.01-2.802-3.053-.231-6.502-3.838-4.236-.074-2.097-2.889-3.364-5.142-2.174 1.845-4.317.096-2.383-1.654-1.733 1.552-4.228 10.778-6.733 56.079-.133.046 30.02-1.345-.01-.101 69.946 39.069.278.285 85.096-118.11-1.617Z"
          />
          <text>Klamath</text>
        </Link>
        <Link href="/region/US-OR-039" {...linkProps}>
          <path
            {...pathProps}
            d="m178.971 307.118 2.98-42.616 78.273-.882.134 3.759 2.383 2.92-1.264 3.104 21.754-.078.147-6.827 3.222.017.006-3.315 3.557 1.52 7.698-1.627 6.134 2.005 1.525 2.554 3.873.566 1.36 1.915 3.506-.797 13.052 2.972 4.38-2.542.013-2.532 42.535-1.118 2.495 1.529 1.36 7.446-.889 4.34.967 6.702-2.492 4.47-2.701 1.51.508 5.943-2.623 3.166-.81 5.778-4.928.312-3.93 5.999 1.19 10.889-1.704 2.413 1.201 4.654-1.675 5.671 1.843 3.104-2.947.08-.911 1.977-10.057 6.013-1.552 4.228 1.654 1.733-.096 2.383-1.845 4.317 1.753.858-51.076.326-.011-12.385-30.631.536.013-7.617-2.504-.002-.01-20.133-17.67-.058.004-3.371-10.235-.098.01-2.453-4.935.13.013-4.445-4.246.004.009-2.646-3.35-.071.046-3.424-7.103-2.7-10.321-.06-4.675 4.683-3.612.71.037 3.78-1.744.373-17.797-.114Z"
          />
          <text>Lane</text>
        </Link>
        <Link href="/region/US-OR-043" {...linkProps}>
          <path
            {...pathProps}
            d="m253.488 231.508.802-2.014 5.516-1.491-1.06-1.83 2.815-4.079 7.55-1.425-6.005-7.28-.373-1.911 1.507-1.598-.955-.915 2.582-1.247 4.262 1.35 1.905 2.895 1.78-.017-.05 2.922 1.57 1.407 3.583-4.029 1.941.627 7.28-6.875 5.338-2.403 4.843.152 2.915 2.091 6.103-1.587 9.623 4.614 15.439-1.124 3.015 1.021 5.341 6.742 6.43-3.848 9.064 4.75 19.616.28-.967 7.967 1.48 2.555-1.878 6.665.58 2.697-3.35 3.512.673 23.313 1.91 2.462-42.609 1.377-.013 2.532-4.38 2.542-13.052-2.972-3.506.797-1.36-1.915-3.873-.566-1.525-2.554-6.134-2.005-7.698 1.628-3.557-1.521-.006 3.315-3.222-.017-.147 6.827-21.754.078 1.264-3.104-2.383-2.92-1.255-6.48-4.35-2.942 2.235-3.561-2.185-2.26 1.8-1.368-.373-4.508 1.908-1.308-1.318-4.897.703-2.375-3.276-2.527.805-2.45Z"
          />
          <text>Linn</text>
        </Link>
        <Link href="/region/US-OR-051" {...linkProps}>
          <path
            {...pathProps}
            d="m281.268 99.311.004-6.053 13.966-.862-1.012 5.786.897 2.793 7.44 4.685 19.798 6.519 4.89-1.479 7.155 3.877 9.316-4.087 6.872-.697 15.05-7.862.312 7.551 1.438 3.6-1.055 2.677 1.702 2.445 2.032-.117.459 2.552 3.694 3.723-68.863.023-1.626.438 1.027 2.997-7.958-.069-.012-10.3-1.726-.007-1.701-3.448-6.939-5.204-1.696-3.423-1.772-.036-.007-1.732-1.68-.01Z"
          />
          <text>Multnomah</text>
        </Link>
        <Link href="/region/US-OR-055" {...linkProps}>
          <path
            {...pathProps}
            d="m440.273 145.33 4.057-4.3 1.928 1.67.51-3.492 1.668.704-.394-1.848 6.091-5.293.242-4.31 1.123-.489-1.366-1.624 2.488-2.878-.235-3.979 1.102-1.39-6.091-3.577-.917-2.054 1.172-3.374-1.71-6.223 5.037-3.625 16.935-7.882 8.894 8.181 4.908 1.685 1.745 4.274 2.297-.813-.311 2.234 2.807 1.454.31 4.492 4.11 2.88-1.885 1.193 1.651 1.662-.593 1.743-4.943-.323 1.416 3.3-3.724-1.776-3.473 2.371 1.131.693-1.215 1.505 1.106 1.361-1.876.872 1.935.919-3.829 2.41.855.68-1.181 1.563 1.675.346-1.835 1.002-.745 2.885 1.34 2.598-1.122 1.513 1.399 1.358-1.793-.286-.846 2.537 1.835 2.642-1.877 1.024.938 3.33 1.71-.011-1.45 1.45 5.035 2.022.453 4.932 2.295 1.029-1.412 1.55.265 3.44-3.713-.193.262 2.29-18.938-.03.555-5.553-4.003-3.78-8.289-4.356-9.597.143-2.887-1.77.096-8.575Z"
          />
          <text>Sherman</text>
        </Link>
        <Link href="/region/US-OR-061" {...linkProps}>
          <path
            {...pathProps}
            d="m635.759 138.207 22.572-1.138-.017-8.814 1.988.007-.004-1.616 3.227 1.624 14.113.208-.007-5.158 6.827-.04-.061-26.078 4.256.025-.01-10.209 1.793-.01.009-5.23 6.036.021-.003-5.255 18.905-.057-.027 10.511-3.414.014.065 10.075 1.739-.005-.017 3.523 1.753-.061.015 5.284 1.57-.043-.001 12.231 3.623-.054.016 10.378 1.646.002.063 7.468 1.668.051v3.392l5.122-.146.015 3.326 3.36 1.694-.013 3.397 1.673-.036.11 6.896 3.7-.024.007 5.162h17.65v10.208l-24.922.133-.046 10.264-17.883.084-1.36-4.024-2.038.025-1.65-3.466-3.014-1.245-7.955 8.266-5.733-.96-6.141-5.091-4.24 3.705-4.453.982-1.503 5.475-5.605.067-5.062-3.75-6.42 3.538-.857-3.269-6.063-.693v-10.055l-2.426-.008.085-13.794-9.162-.003-.009-7.233-3.425.002Z"
          />
          <text>Union</text>
        </Link>
        <Link href="/region/US-OR-007" {...linkProps}>
          <path
            {...pathProps}
            d="m225.161 29.359.63-.109 1.544.308-.903.098Zm-5.632.78 1.786-.541.292.181-.896.499Zm-27.515-2.182 2.253-.313.253.196-1.143.337Zm-1.513 3.17 1.992 1.175-.08 2.17 3.003.25 4.312 4.654 3.996 1.375 1.373-1.659-2.161-2.235 8.932-2.841 5.375 2.806 2.235-3.44 3.958.354 9.908-6.746 4.494 2.565 1.673 2.481-.282 5.784 5.634 4.263.178 44.2-50.917-.423.148-14.998-2.185-4.652 4.711-3.72.682-7.801-1.524-8.956-6.191-13.789Zm-1.892-5.85.956-.837 1.752 3.166-2.13-.976Z"
          />
          <text>Clatsop</text>
        </Link>
        <Link href="/region/US-OR-017" {...linkProps}>
          <path
            {...pathProps}
            d="m358.949 341.273 3.102-1.23-1.843-3.105 1.675-5.671-1.2-4.654 1.703-2.413-1.19-10.89 3.93-5.998 4.928-.312.81-5.778 2.623-3.166-.508-5.943 2.701-1.51 2.762-5.672-1.237-5.5 1.037-2.233-.551-6.298-.957-3.255-4.331-4.25-.15-12.53 61.626.237.398 29.536 9.677.478.057 20.185 19.967.412.034 9.999 30.922-.12.053 10.095 10.03.016.05 10.034 30.189.065.071 10.078Z"
          />
          <text>Deschutes</text>
        </Link>
        <Link href="/region/US-OR-019" {...linkProps}>
          <path
            {...pathProps}
            d="m173.592 339.976 4.67-27.38 19.541-.259-.037-3.78 3.612-.71 4.258-4.478 10.738-.144 7.103 2.699-.047 3.424 3.35.071-.008 2.646 4.246-.004-.013 4.445 4.935-.13-.01 2.453 10.235.098-.004 3.37 17.67.059.01 20.133 2.504.002-.013 7.617 30.63-.536.012 12.385 51.076-.326 3.39 1.316 4.849 8.32.996-.621 1.886 6.11-.7 2.39 2.802 3.053-5.568 5.01.142 3.05-4.454 12.027 1.33 2.19-17.285.003-.012 8.162-9.91-.015-3.308 4.833-1.65.006-.002 1.66-8.382.078-.002 1.659-3.343 1.557-.004 1.76-6.445 1.67-.001 1.655-1.66.004-3.297 4.922-3.255-.606-1.638 5.775-13.105.394-4.906 2.582-11.936-.421.018 2.066-2.387-.005-4.114 4.009-1.641.021-.01-2.506-2.09-.87-7.739-.848-.448 1.655h-2.366l-.097 1.672-4.516 1.241-7.308-1.188-3.28-3.432-8.008.028-1.652-1.623.013 1.633-1.647-.008v-5.217l-5.596-1.604-2.366 1.28-.802-23.793 4.987-.003.021-9.954 4.959-.45-.218-19.604-4.994-.036.237-18.919-4.699-1.04.08-9.828-4.94.058-.006-10.69-28.757-.292Z"
          />
          <text>Douglas</text>
        </Link>
        <Link href="/region/US-OR-065" {...linkProps}>
          <path
            {...pathProps}
            d="m375.425 177.92 1.953-.44.275-2.616 5.112-.034 2.215-3.335 2.723-.079.509-4.228-1.205-2.2-2.35.372-4.488-8.84.149-1.688 5.383-2.734.144-2.569-1.306-.873 17.978-.025-.024-31.192 3.479.026-.049-21.306 8.667-.917 10.22 4.043 2.676 7.764 4.347-.398 5.662-5.126 10.086-.467 3.284 4.17.53 9.296 6.092 3.576-1.102 1.391.235 3.979-2.488 2.878 1.366 1.624-1.123.49-.342 4.548-1.182-.397-1.675 3.692-3.134 1.759.394 1.848-1.668-.704-.51 3.491-1.928-1.67-4.057 4.3 1.154.464-.55 7.558 3.313 2.457 9.597-.143 8.289 4.357 4.003 3.779-.555 5.554 18.938.03 1.767 3.218.492 10.534-1.035 1.913 1.304 5.104 3.135 1.668-1.965 2.338 7.385 6.206-113.4-.443-2.34-.52.915-2.39-.931-1.31 3.248-5.281-2.755-1.034-1.406-3.232-2.6.744.798-1.741Z"
          />
          <text>Wasco</text>
        </Link>
        <Link href="/region/US-OR-023" {...linkProps}>
          <path
            {...pathProps}
            d="m554.122 179.86 100.813-.006 2.64 1.231.105 2.648 6.421-3.539 5.062 3.751 4.555.265 1.777 2.543-1.169 3.375.781 5.065-5.17-.103-2.422 3.562 1.98 2.727.807 7.343-6.885.444-8.626 5.095-4.093-.222 1.257 4.752 12.534 3.097 4.109 5.937-5.508 6.775.904 6.988-5.041 1.951-1.26 6.237 2.374 3.642-2.111.2-3.021 4.048-2.399 9.286 22.229-.245.379 25.392-49.365-.928-.003 10.144-70.393.21.398-101.34-1.6-.005Z"
          />
          <text>Grant</text>
        </Link>
        <Link href="/region/US-OR-015" {...linkProps}>
          <path
            {...pathProps}
            d="m164.426 518.355.177-.074.057.257-.184.102Zm-8.659-28.02.159-.095.026.28-.158-.002Zm-4.176-40.072.13-.158.063.247-.09.102Zm-7.33-19.819 1.265-.313 5.852-12.662 18.535-.07 3.248 2.422.454 3.407 4.431 2.345 1.251 2.448.435 3.84-1.631.021-.355 4.372.413 5.712h1.785l.48 8.35 3.607-2.137 7.84-.022v-1.647l5.893-4.517.019-3.97 11.93-2.845 5.598 1.604-9.615 17.451.994 2.262-2.535 3.311-2.141 7.972-3.695 2.104-7.463-.184-.02 8.713-2.793 3.627 1.26 3.227 11.638.878 1.545 3.248 2.52 1.2-.655 1.47 2.942 6.253 1.676.72.145 1.943-2.514 2.43.66 3.315-3.85 3.903 3.063 5.411-2.259 4.987 2.58 4.986-32.961.037-4.931-5.31-1.743.177-5.011-6.346-.832-9.1-4.452-8.078.196-6.253-1.78-1.879-.173-13.378 3.782-15.095-1.534-2.282.596-3.686-1.307-3.918-2.845-1.618-1.937-6.484-3.335-.032-.902-6.486Z"
          />
          <text>Curry</text>
        </Link>
        <Link href="/region/US-OR-031" {...linkProps}>
          <path
            {...pathProps}
            d="m371.719 241.98.22-2.67 3.142-2.74-.581-2.697 1.878-6.665-1.48-2.555 1.505-9.483-.93-3.876 3.748-3.911-4.405-2.288-.648-2.174 5.637-3.518 115.74.963-1.14 2.995-1.644.199 1.59 3.959-.072 23.223-36.945.143.055 10.14-13.565.001.037 10.115-71.608-.277Z"
          />
          <text>Jefferson</text>
        </Link>
        <Link href="/region/US-OR-047" {...linkProps}>
          <path
            {...pathProps}
            d="m260.18 196.138 2.64-.437 3.177-8.15 3.219.255 2.645-2.38.164-4.65-2.073-.283-.948-2.93.584-7.436 6.047-4.848-3.034-3.426.416-1.746 2.258-.345-1.658-4.198-2.53-1.484 4.32-1.401-.137-4.193 2.811-3.072 1.668 2.103 6.714 1.727 2.715-2.481 8.024 1.7-1.718 6.688.637 2.511-3.067 6.158 6.976 8.434 9.191 4.703.048 3.404 2.19.848 5.292 7.715 8.888 1.713-.12 2.168 55.937.403-1.667 2.494.929 1.75-.963 2.07-5.587 3.399.648 2.174 4.405 2.288-3.748 3.911.392 5.392-19.616-.28-9.065-4.75-6.429 3.848-5.341-6.742-3.015-1.02-15.44 1.123-9.622-4.614-6.103 1.587-2.915-2.09-4.843-.153-18.714 12.682-.823-4.153-1.905-.161-1.905-2.895-7.178-.401 1.6-4.48 3.121-2.611-6.833-2.19Z"
          />
          <text>Marion</text>
        </Link>
        <Link href="/region/US-OR-003" {...linkProps}>
          <path
            {...pathProps}
            d="m206.915 256.49 6.846-.135-.013-1.707 1.643-.013-.38-8.55 10.254.032-.413-33.878 37.999.11 2.692 5.098 3.623 2.313-1.817 1.91-6.329.808-2.274 3.695 1.06 1.83-5.516 1.49-.802 2.015 1.564 1.196-.805 2.449 3.276 2.527-.703 2.375 1.318 4.897-1.908 1.308.372 4.508-1.799 1.368 2.185 2.26-2.234 3.561 2.126.313 3.344 5.35-49.865.021-.016-3.818-3.412.101Z"
          />
          <text>Benton</text>
        </Link>
        <Link href="/region/US-OR-025" {...linkProps}>
          <path
            {...pathProps}
            d="m531.401 440.4.908-48.69 2.986-.006-.04-59.902 10.046.028.178-30.324 80.297-.191.003-10.144 49.365.928-.097 129.914 1.002-.009.18 72.7 1.626.008-.175 31.5-97.41.294-.437-85.568Z"
          />
          <text>Harney</text>
        </Link>
        <Link href="/region/US-OR-011" {...linkProps}>
          <path
            {...pathProps}
            d="m152.804 413.222 2.213-9.155-.138-4.9 3.026-8.138 1.614-9.804-1.705-4.11 7.356-9.506 8.046-25.702 28.757.292.006 10.69 4.94-.058-.08 9.829 4.7 1.04-.238 18.918 4.994.036.218 19.604-4.959.45-.021 9.954-4.987.003.801 23.722-9.564 1.635-.019 3.971-5.894 4.517v1.647l-7.84.022-3.605 2.138-.481-8.352-1.785.001-.413-8.889 1.986-1.216-1.686-6.288-4.431-2.345-.454-3.407-3.248-2.422-18.535.07Z"
          />
          <text>Coos</text>
        </Link>
        <Link href="/region/US-OR-027" {...linkProps}>
          <path
            {...pathProps}
            d="m365.644 101.93 4.596-5.288 4.68-1.618 8.708 1.434 14.598-3.807 7.697 3.508.049 21.306-3.479-.026.024 31.192-17.978.025 1.458-4.674-2.03-4.103.535-5.007-6.642-3.466-7.787-13.32-3.082-.756Z"
          />
          <text>Hood River</text>
        </Link>
        <Link href="/region/US-OR-049" {...linkProps}>
          <path
            {...pathProps}
            d="m526.197 137.622.508-55.292 27.614-5.337 3.895-5.87 4.34-2.386 7.017 2.306 4.664-1.438-.208 37.858 15.59.125.028 10.273 8.634.02-.107 51.568h-1.392l.006 10.279-52.627.176.027-10.255 2.522-.003.082-10.441-10.402.007.132-10.437-10.406-.094Z"
          />
          <text>Morrow</text>
        </Link>
        <Link href="/region/US-OR-059" {...linkProps}>
          <path
            {...pathProps}
            d="m574.016 80.4.22-10.795 14.66-2.61 10.977.85 8.3-4.37 3.344-3.704 84.569-.105.395 22.133-6.036-.021-.009 5.23-1.793.01.01 10.21-4.256-.026.061 26.078-6.827.04.007 5.158-14.113-.208-3.227-1.624.004 1.616-1.988-.007.017 8.814-22.572 1.138.065 10.473 3.425-.002.01 7.233 9.161.003-.085 13.794 2.426.008v10.055l-53.975-.043-.006-10.28h1.392l.107-51.567-8.634-.02-.028-10.273-15.59-.125Z"
          />
          <text>Umatilla</text>
        </Link>
        <Link href="/region/US-OR-001" {...linkProps}>
          <path
            {...pathProps}
            d="m650.698 214.039 4.093.222 8.626-5.095 6.885-.444-.807-7.343-1.98-2.727 2.422-3.562 5.17.103-.78-5.065 1.168-3.375-1.754-.876-.063-1.939 1.09-.06 1.503-5.475 4.453-.982 2.57-3.475 12.787 5.934 4.694-2.859 4.018-5.52 3.014 1.245 1.65 3.466 2.037-.025 1.36 4.024 17.884-.084.046-10.264 65.321.14-5.376 6.6-.756 5.62 2.572-.867-2.05 2.887 1.555 3.165-2.083 5.986-3.444 3.126-3.062 8.32-10.687 6.693-5.235 16.877-1.969 2.29-.082 3.317-6.353 6.32.838 6.477-2.342 4.244 4.461 6.374-2.537 4.12-22.364.126.022-10.183-1.882.012-1.688-3.35-3.377.004-1.774-3.39-31.914.086-.013 1.707-5.004 1.654-.011 2.96-1.688-.01.005 2.114-2.942 1.682-.428 3.387-5.054 3.422-.041 3.373-3.39-.003.005 1.698-25.48.111 2.398-9.286 3.02-4.048 2.112-.2-2.375-3.642 1.26-6.237 5.042-1.951-.904-6.988 5.508-6.775-4.109-5.937-12.534-3.097Z"
          />
          <text>Baker</text>
        </Link>
        <Link href="/region/US-OR-045" {...linkProps}>
          <path
            {...pathProps}
            d="m674.76 266.849 6.642-1.703.04-3.373 5.055-3.422.428-3.387 2.942-1.682-.005-2.113 1.688.009.011-2.96 5.004-1.654.013-1.707 31.914-.085 1.774 3.39 3.377-.006 1.688 3.351 1.882-.012-.022 10.183 22.364-.127 1.836 3.227 3.442 1.912 4.137-2.723 4.578 6.046 1.773-2.288 4.688.678.354 5.329 6.36 3.036-3.178 8.314-3.657 1.712.349 4.19 3.003 2.337.147 4.95-3.4 1.416 1.421.973-1.1.931 1.138 4.085-1.94 1.252-.086 5.205-3.195 1.016 1.011 1.933-2 1.428.95 1.234-.39 208.141-98.116.327.175-31.5-1.627-.009-.179-72.699-1.002.01Z"
          />
          <text>Malheur</text>
        </Link>
        <Link href="/region/US-OR-009" {...linkProps}>
          <path
            {...pathProps}
            d="m244.63 52.701.233-10.618 7.002.18 9.53-5.34 4.23.45 17.743 12.274 2.18 6.333 5.37 8.477.209 5.813 2.218 5.42-.886 6.938 2.184 3.535.615 6.244-13.986.851.02-1.705-8.623-1.888.08-3.331-27.708-.05Z"
          />
          <text>Columbia</text>
        </Link>
        <Link href="/region/US-OR-057" {...linkProps}>
          <path
            {...pathProps}
            d="m190.232 171.605 2.205-3.474 1.598-9.344.527-17.17-.732-2.366-2.92.009 2.879-2.143.642-3.75.31-6.8-1.392-5.213 1.386-1.233 1.06-5.765.763-13.996-.233-7.768-2.99-5.508.789-1.224 50.917.423.05 8.51-10.364-.009-.033 3.54 3.466 1.693 1.716 3.47 10.374 3.465-1.722 3.42-3.446-.012-.002 3.456-3.426-.02-1.669 3.428-1.739.035-1.772 8.825-1.806.015-.054 1.664 1.776-.016.114 25.859-26.894.002.044 16.586 4.998-.014-.026 3.836-23.81-.067Z"
          />
          <text>Tillamook</text>
        </Link>
        <Link href="/region/US-OR-037" {...linkProps}>
          <path
            {...pathProps}
            d="m413.457 421.4 1.536-80.154 120.334.634-.032 49.824-2.986.006-.936 49.523 48.46-.295.436 85.568-127.322.07-.285-85.096-39.07-.278Z"
          />
          <text>Lake</text>
        </Link>
        <Link href="/region/US-OR-029" {...linkProps}>
          <path
            {...pathProps}
            d="m255.983 525.317.115-79.93 6.502-3.167-.018-2.066 11.936.42 4.906-2.581 13.105-.394 1.638-5.775 3.255.606 3.296-4.922 1.66-.004.002-1.655 6.445-1.67.004-1.76 3.343-1.557.002-1.659 8.382-.079.001-1.66 1.65-.005 3.308-4.833 9.91.015-.587 112.318Z"
          />
          <text>Jackson</text>
        </Link>
        <Link href="/region/US-OR-041" {...linkProps}>
          <path
            {...pathProps}
            d="m182.009 262.904 4.668-43.325-1.756-2.16 1.788-6.832-1.354-7.427 3.5-12.136 1.96-17.075 23.811.067-.028 36.113 1.711.008.01 2.102h8.533l.413 33.878-10.254-.031.38 8.549-1.643.013.013 1.707-6.846.135.016 3.434 3.412-.101.016 3.818-24.102.99-4.305-.13Z"
          />
          <text>Lincoln</text>
        </Link>
        <Link href="/region/US-OR-053" {...linkProps}>
          <path
            {...pathProps}
            d="m214.626 174.016.025-3.77 54.932.161-.579 7.156.948 2.93 2.073.284.12 3.649-2.93 3.38-3.218-.255-3.178 8.15-2.608.294.628 3.39 6.833 2.19-4.552 4.875 1.12 3.43-1.389 2.469-46.533-.11-.009-2.102-1.71-.008Z"
          />
          <text>Polk</text>
        </Link>
        <Link href="/region/US-OR-063" {...linkProps}>
          <path
            {...pathProps}
            d="m696.086 59.666 88.943.64 3.351 4.943 1.356 5.679 5.34 5.871 1.121 3.98 5.936-.106 3.894 5.32 6.06.415 3.884 3.31.942 7.109 3.98 5.031 2.032 5.628-5.439 6.19-2.432 5.723.231 4.813-2.795 2.39-7.171 14.481-.059 5.379-2.439 4.355-2.178 11.61-3.79 4.34-.748 3.236-40.4-.273v-10.208h-17.65l-.006-5.162-3.7.024-.11-6.896-1.673.036.013-3.397-3.36-1.694-.015-3.326-5.123.146.001-3.392-1.668-.05-.063-7.469-1.646-.002-.016-10.378-3.623.054v-12.23l-1.569.042-.015-5.284-1.753.06.017-3.522-1.74.005-.064-10.075 3.414-.014.027-10.511-19.295.056Z"
          />
          <text>Wallowa</text>
        </Link>
        <Link href="/region/US-OR-071" {...linkProps}>
          <path
            {...pathProps}
            d="m209.544 159.477.066-5.87 26.894-.001-.114-25.86 27.6-.014 1.742 3.47 6.91-.07 3.415 5.233 1.767.039.006 1.707 5.146.032-.006 3.42 3.433.016-.015 6.865h1.52l-4.146.354-5.68-3.384-2.415 2.421-.26 4.844-4.351 1.658 2.56 1.227 1.659 4.198-2.258.345-.416 1.746 3 3.572-6.018 4.982-59.929-.213Z"
          />
          <text>Yamhill</text>
        </Link>
        <Link href="/region/US-OR-013" {...linkProps}>
          <path
            {...pathProps}
            d="m433.811 266.158.068-15.056 9.982.04-.037-10.116 13.565-.002-.055-10.139 36.945-.143.04 15.026 30.533-.318.076 5.76 10.173.012.023 9.719 20.398-.05-.14 40.635-9.903-.02-.178 30.324-40.233-.093-.051-10.034-10.03-.016-.053-10.095-30.922.12-.034-10-19.967-.411-.057-20.185-9.677-.478Z"
          />
          <text>Crook</text>
        </Link>
        <Link href="/region/US-OR-069" {...linkProps}>
          <path
            {...pathProps}
            d="m485.18 171.188 59.017.054-.038 8.662 9.963-.043.059 20.319 1.6.005-.259 60.706-20.398.05-.023-9.719-10.173-.013-.076-5.76-30.533.319.033-38.25-1.59-3.958 1.642-.2 1.141-2.994-7.385-6.206 1.965-2.338-3.135-1.668-1.304-5.104 1.002-3.62Z"
          />
          <text>Wheeler</text>
        </Link>
        <Link href="/region/US-OR-067" {...linkProps}>
          <path
            {...pathProps}
            d="m234.668 126.099 1.806-.015 1.772-8.825 1.739-.035 1.669-3.428 3.426.02.002-3.456 5.183-1.704-.015-1.704-3.426-.025-.014-1.766-6.934-1.674-1.716-3.47-3.466-1.693.033-3.54 10.363.008-.05-8.509 27.71.05-.081 3.332 8.623 1.888-.019 12.037 1.68.01.007 1.733 1.772.036 1.696 3.423 6.939 5.204 1.7 3.448 1.727.007.01 22.374-8.603-1.674-.006 3.447-5.225-.034.006-3.421-5.146-.032-.006-1.707-1.767-.039-3.416-5.232-6.91.069-1.74-3.47-29.377.03Z"
          />
          <text>Washington</text>
        </Link>
      </svg>
    </>
  );
}