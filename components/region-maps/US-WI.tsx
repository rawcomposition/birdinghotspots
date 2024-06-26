import Link from "next/link";
import MapTooltip from "components/MapTooltip";
import useHoverMap from "hooks/useHoverMap";

export default function CaliforniaMap() {
  const { linkProps, pathProps, tooltipProps, svgRef } = useHoverMap();

  return (
    <>
      <MapTooltip {...tooltipProps} />
      <svg
        className="state-map hover-map max-w-[500px] lg:mr-[10%]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMinYMin meet"
        ref={svgRef}
        viewBox="260 25 470 495"
      >
        <Link {...linkProps} href="/region/US-WI-059">
          <path
            {...pathProps}
            d="m653.511 499.267-1.056 5.4 1.327 12.87-38.722-.181-.1-12.143 9.083-.066-.016-6.078Zm.148 18.304.005.015-.076-.004.011-.015Z"
          />
          <text>Kenosha</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-101">
          <path
            {...pathProps}
            d="m652.037 481.18 5.193 6.147-1.595 1.983.015 4.566-2.125 5.358-29.498-.165.016 6.078-9.083.066-.028-24.289Z"
          />
          <text>Racine</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-049">
          <path
            {...pathProps}
            d="m457.421 442.18 6.948 1.298 5.95 4.274 7.352-.557 2.133 1.786 4.586-5.195 7.266.701 5.21-1.917-.024 41.336-45.353.09-.177-40.885Z"
          />
          <text>Iowa</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-079">
          <path
            {...pathProps}
            d="m647.429 447.2-1.22 3.824 2.845 5.802-2.42 3.025-.177 2.351 4.023 6.11-.227 7.498 1.686 5.14-18.792-.14.51-36.767 13.157.008Zm3.23 27.153.05-.062.015-.078.009.062Z"
          />
          <text>Milwaukee</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-043">
          <path
            {...pathProps}
            d="m442.538 441.994 8.774 1.117.186 72.941-16.504-.088-.3-3.675-4.976-9.741-18.43-5.155-7.973-5.453-1.961-6.797-.185-7.036-5.108-4.24-.242-8.829 6.827.02 7.029-4.222 2.471-3.212 6.925-1.401 8.147-4.977 3.953-5.144Z"
          />
          <text>Grant</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-023">
          <path
            {...pathProps}
            d="m391.675 419.608 41.203-.02.133 26.61-1.84-.096-3.953 5.144-8.147 4.977-6.925 1.4-2.471 3.213-6.767 4.09-5.781-.583-1.893 1.224-1.735-8.302.125-6.606 9.249-13.315-3.827-6.169-7.596-4.041Z"
          />
          <text>Crawford</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-103">
          <path
            {...pathProps}
            d="m469.582 407.157-.025 39.856-5.188-3.535-5.918-1.293-7.972 1.068-8.061-1.264-9.407 4.208-.385-40.413 36.97-.216Z"
          />
          <text>Richland</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-095">
          <path
            {...pathProps}
            d="m291.005 170.078 27.344.32-.157 56.728-46.37-.01-.345-8.647 4.15-3.708.444-3.954 4.06-4.414.29-4.719-6.148-7.929-.045-3.062-3.376-2.823-3.901.725-4.786-1.588-.436-7.381 27.738-.007.06-9.55Z"
          />
          <text>Polk</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-075">
          <path
            {...pathProps}
            d="m639.475 162.965-.018 2.495 8.593 1.77 7.368 8.115-3.369 3.192 3.39 4.12.29 2.871-1.126 2.755-3.234.196 2.333 2.535.826 4.245-1.592 3.982-3.757 3.283.989 3.32-3.002 5.288 1.391-1.18 1.57 2.829 1.371-1.316 5.925.356 4.848-4.51 2.709 2.443.673 3.162-3.826 6.237-3.384 9.303.437 2.747 4.077 3.133 1.735 3.905 5.185 1.412-.088.323.233-.039-.116.065.475.526.696 1.388-.825-1.322-.974.369-1.563 2.97-.532 7.49-.13.398-.142.188-1.083-.37-.526.609.121.456 1.11-.225.49.06-1.986.661-1.16-.443-3.955.13-3.09.857.194-2.71-14.205-.273.115-2.984-13.729-.339.172-9.46-5.427-.18.227-9.415-9.442-.386.23-18.958-9.42-.259.208-38.034 28.206 1.044.091-7.473Zm37.71 80.363.294.117.37.59-1.257-.526Zm-10.862 8.787.245.098-.98.205.561-.312Zm3.879-10.889.08.18-.304-.433h.04Zm-.044-.286-.11.031-.066-.06.161-.147Zm-11.497 12.597.057.006-.542.03.098-.039Zm6.817-1.551-.065-.037.203-.145-.06.144Zm4.93-10.324-.04.024.047.042.397.055Zm-12.835 11.973.007-.045.158.008-.017.017Zm8.111-1.08-.13.086-.025-.041.008-.036Zm4.65-11.146.004.04-.085.064.003-.08Zm-12.276 12.165-.086.017-.05-.017.059-.027Zm2.798-.527.044.006-.07.01-.02-.032Zm-3.427.621-.032-.007.096-.018-.014.014Zm12.935-12.14-.04.01.05-.04.03.007Zm-10.608 11.657.02.025-.082.02.006-.017Zm-1.038.282v-.026l.078-.02-.014.017Zm.37-.147.03.007.008.008-.064.007Zm6.681-1.472-.025-.029.021-.039.013.007Zm-6.866 1.536-.025.004.07-.02-.012.016Zm2.183-.396-.02-.002.083-.013-.006.01Zm4.616-.905-.03-.027-.011-.037.04.046Zm4.642-10.493.024-.005.009.01-.057-.005Zm-4.85 11.068-.022-.012.047-.02-.006.019Zm-6.257.668-.023-.025.011-.02.02.015Zm-.405.08-.025-.006.045-.018-.001.005Zm6.884-.811-.007-.019.027-.02.005.016Zm-6.68.766-.04.002-.004-.01.028-.01Zm6.758-.775-.02-.003.002-.02.02-.003Zm-.21-.082-.01-.02.023-.02.002.006Zm-4.323.475-.02-.002-.019-.017h.032Zm8.705-11.984-.021-.009.014-.028.01.01Zm-4.372 11.562-.01-.022.012-.014.011.015Zm-6.423.754-.026.001-.003-.003.04-.013Zm11.061-11.807-.01-.007.001-.032.019.01Zm.497.061-.013.006.03-.032-.003.014Zm-9.676 11.395-.014.006-.013-.007.038-.013Zm-.133.047-.023.007-.01-.004.026-.018Zm9.506-11.39-.016-.005v-.032l.008.004Zm-.488-.644-.005-.023.026-.007-.02.024Zm.418.382-.005.001-.02-.008.018-.018Zm.056.211-.013-.005.005-.017.01.007Zm-.46-.545-.005.002-.017-.027.02.016Zm.467.691-.018-.005-.007-.013.004-.001Zm.303.176-.013-.002-.004-.008.008-.006Zm-.48-.447-.008.01-.009-.011.005-.006Zm.133.037-.007-.003-.001-.007.011-.002Zm-.046-.334h-.005l-.004-.008h.015Zm.081.49-.008.002-.004-.011.012.005Zm-.13-.611h-.004l-.002-.009.011-.001Zm.13.45-.005.005-.008-.009.01-.002Zm-.062.089-.006.002-.004-.007.008-.004Zm-.014-.237-.005.001-.002-.005.007-.005Zm.048.248-.006-.002v-.007l.006.002Zm-.018-.005-.007-.002.001-.005.007.001Zm.114.165-.007-.002v-.003l.007-.002Z"
          />
          <text>Marinette</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-037">
          <path
            {...pathProps}
            d="m597.481 137.683 2.004.346 1.333 2.964 2.368-.901 3.3 2.693 2.741-1.833 4.09 4.076 6.198-.949.79 1.708 3.49-.488 6.92 3.501.028 4.305 2.426 1.02-5.108 6.077 3.202 3.568 2.79.547-.092 7.473-47.515-1.093-.57-32.232.923 2.824 2.71.403 1.708-.45.964-3.176 1.002 1.404Z"
          />
          <text>Florence</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-041">
          <path
            {...pathProps}
            d="m566.811 131.957 8.826 5.825 1.531-1.48 1.337.26-.118 1.791 3.121-1.351 4.368 1.463.57 32.232 19.31.05-.21 38.033-38.38-.188.224-9.5-9.515.044-.075-57.15 8.794.002Z"
          />
          <text>Forest</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-013">
          <path
            {...pathProps}
            d="m308.709 122.52 17.724-.002 1.405 57.343-9.54.018.05-9.482-28.821-.338-.06 9.55-27.579-.227 1.378-8.084 6.637-5.286 1.971-4.543-.558-2.688 3.997-6.714 5.793-4.756 6.625-1.918 1.827-3.44 4.496 1.052 3.097-5.608 6.085.855 1.42-5.266 2.913-1.2.076-9.27Z"
          />
          <text>Burnett</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-051">
          <path
            {...pathProps}
            d="m445.236 74.219 6.915 2.68 1.934 3.773 4.725-2.346 1.74 1.799-.565 2.286 3.07-.84.338 2.23 4.306.306 7.544 15.907-.174 2.51 14.79 4.146.045 35.356-28.818.055-.08-19.265-9.464.1.043-9.655-9.758-.056.173-38.276Z"
          />
          <text>Iron</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-089">
          <path
            {...pathProps}
            d="m654.585 406.85.093 5.318-6.142 11.21-3.065 13.77 1.343 6.903-13.158-.008.075-18.544 1.73.002-.047-18.6Z"
          />
          <text>Ozaukee</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-027">
          <path {...pathProps} d="m607.636 399.028-1.312 44.741-45.545-.32.165-46.19 46.68.222Z" />
          <text>Dodge</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-111">
          <path
            {...pathProps}
            d="m472.66 396.31 28.266.101 1.378 3.664 3.837.924-.9 2.961 9.492.792.43 19.394-6.035 2.093-3.39 4.712.026 5.223-6.617 3.063-3.167 4.063-11.59.486-3.753 2.943-.753 2.248-2.213-1.782-7.405.537-.67-42.164-9.176.104-.123-9.263Z"
          />
          <text>Sauk</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-021">
          <path
            {...pathProps}
            d="m551.684 396.225-.018 1.167 9.278-.133-.183 36.972-27.278.375-.003-1.35-28.032-.61 3.68-6.407 6.034-2.093.084-18.91-10.054-1.305.95-2.932-3.838-.924-1.378-3.664Z"
          />
          <text>Columbia</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-117">
          <path
            {...pathProps}
            d="m659.234 369.58.384 8.685 2.388 5.007-1.105 2.66.534 5.616-6.852 15.29-28.443.014-.103-37.177Z"
          />
          <text>Sheboygan</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-063">
          <path
            {...pathProps}
            d="m392.906 348.34 2.71 2.117 18.417-.055.18 37.016-26.758-.035 1.033-5.25-3.065-7.777-10.887-14.61 7.96-.022-1.739-3.441 2.775-5.104 3.199-.865 3.526 2.056Z"
          />
          <text>La Crosse</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-057">
          <path
            {...pathProps}
            d="m491.908 331.44.552 2.082-2.318 1.525 1.478 1.502-1.536.56 1.764 1.765-1.596.092-.374 2.749-3.249-1.54-1.229 3.774.88.729-2.785.51-1.106 5.51 2.147 5.004-.623 1.54 3.568 3.26.631 6.003-2.33.885 1.508 5.119 8.571 10.312 5.065 13.59-40.629-.002-.004-65.053Z"
          />
          <text>Juneau</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-001">
          <path
            {...pathProps}
            d="m493.786 331.282 21.595.405-.134 64.555-14.533.057.022-2.66-2.744-3.24-2.131-7.578-8.57-10.312-1.509-5.119 2.33-.885-.63-6.003-3.609-3.35.663-1.45-2.356-7.362 1.71-1.403-.319-1.842 2.673-.333-.844-.813 1.281-3.821 3.348 1.452.176-2.537 1.814-.808-1.88-.796 1.506-1.116-1.471-1.479 2.31-1.373-.568-2.19Z"
          />
          <text>Adams</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-071">
          <path
            {...pathProps}
            d="m673.718 322.898 2.703 10.352-.31 4.087-2.531 4.026-7.889 5.606-.575 5.397-2.167 3.523-3.712 13.685-23.916.076-.113-37.46 11.964.059.04-9.38Z"
          />
          <text>Manitowoc</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-121">
          <path
            {...pathProps}
            d="m367.321 293.862 27.236-.08 1.048 55.746-3.689-.81-1.66 3.652-3.525-2.056-3.133.811-2.84 5.158 1.739 3.44-7.961.023-1.12-1.815-10.121-3.98 2.852-6.231-2.065-5.206-3.995-3.01 1.263-1.185-.356-2.891 5.514-3.845Z"
          />
          <text>Trempealeau</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-011">
          <path
            {...pathProps}
            d="m330.743 293.807 35.81.053-.045 37.723-5.514 3.845.356 2.89-1.263 1.186 3.995 3.01 2.065 5.206-2.822 5.544.907 2.08-6.828-4.143-4.64-4.32-.962-2.73-11.928-7.605-1.643-8.024-2.128-1.7.816-2.161-.893-2.378-3.478-3.54-8.746-4.481 4.16-19.25Z"
          />
          <text>Buffalo</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-009">
          <path
            {...pathProps}
            d="m638.994 285.142-1.415 3.618-.167 6.3-2.203 1.943 5.612 4 3.26-.693 2.24-4.103-1.159-.341 4.371-4.52 7.317-2.81-.281 34.385-9.356-.051-.04 9.379-23.464-.165.148-37.204-4.205.22-.58-10.296Zm.464-.108.732 2.223-.149.274-.949-2.046Zm.648 9.077.03.729-.148.2-.36-1.407Zm-.895-1.304-.36-.01-.769-1.181.186-.04Zm.398.731-.35-.545.026-.06.487.471Zm-1.487-4.455-.155.123.07-.546.107.318Zm-.756 6.688-.028-.003-.022-.201.044.045Zm-.094-.288-.006-.017.075-.184-.008.08Zm1.83-10.075h-.025l.078-.091-.001.042Zm-.805 6.823-.024.002-.008-.015.04-.019Zm.787-6.902-.024-.009.016-.038.014.013Zm-.075.01-.013.002-.008-.014.023-.004Zm.074.032-.01-.007v-.014l.016.007Zm.007-.117-.011-.007.002-.016.013.008Zm-.84 2.676-.01.005.002-.03.008.006Zm.813-2.561-.012.006-.004-.012.007-.004Z"
          />
          <text>Brown</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-061">
          <path {...pathProps} d="m686.704 285.266-7.184 13.39-5.792 24.215-17.16.05.282-34.386 1.096-2.45Z" />
          <text>Kewaunee</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-093">
          <path
            {...pathProps}
            d="m271.572 265.022 48.166.46.072 34.508-13.938-.165-3.186-1.888-14.65-.987-1.636-3.862-4.1-1.34-.765-3.614-13.583-11.07Z"
          />
          <text>Pierce</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-033">
          <path
            {...pathProps}
            d="m319.801 227.137 36.218.156-.07 9.528 1.151-.002.095 47.576-37.375-.088-.072-47.564-1.61-.01.054-9.607Z"
          />
          <text>Dunn</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-029">
          <path
            {...pathProps}
            d="m714.677 217.66 3.233 1.749-1.147 2.017.482 3.969-1.839 1.503-1.515-2.365-1.414.435-.35 7.741 1.258 1.328-1.362 1.249-.734-1.422-.704-.969-.323-.123-1.125 1.426 2.552 3.11.26 3.092-1.43 1.05-2.163-1.522 1.138 2.419-.877 2.103-.605-2.095-1.91.341-1.193 5.887-1.962.957-1.928 3.905 1.349 4.082-3.422 2.7.913 3.301-4.837 3.137-3.549 5.73-2.547-3.618-2.356-.311-.55-6.149-1.599-2.789 6.406-13.701 1.514-1.7 1.546.58 1.81-7.82 1.691-1.33-.124-3.863 1.232-.79 3.846 2.542.382-3.458 3.67-.876.196-5.412.861-1.94 2.389.494.5-4.517 1.957 1.148Zm-31.758 44.366-1.237.28-.208 1.188 1.637-.133 2.454 5.01 5.873 4.067-4.731 12.823-27.863-.15 1.34-1.9-.075-3.345 8.485-12.277 4.565-1.462-1.306 2.369.976-.647-.37 1.16.475.06 1.52-3.259 1.262.605 1.088-.654-.873-1.597 2.09 1.71 3.74-4.1Zm38.14-56.162 4.108-1.115 2.93 2.03-2.053 3.474-.203 3.2-2.756.022-1.395-2.218-1.013 1.032-.445-.199.25.844-.14.113.027.152.13.08-.312.243-1.015-.627.815-2.735-.903-2.17 1.43-4.05Zm-31.407 21.023-.102 4.411.816 1.544-3.84-2.425.113-2.063Zm39.2-23.754 1.43.665.348 1.668-2.255.528Zm-7.85 10.427.88-.32 1.608 4.506-.521-.189-.203-1.673-1.27-1.145-.615-1.156.051-.679Zm-1.99 2.049.625.22.249 1.192-.945-.256Zm-23.624 16.846-.104.4-.334-.05.039-.218Zm4.103-2.146.117.344-.342-.006-.043-.26Zm-23.579 33.638-.072.184-.378.003.263-.273Zm-1.2 1.621-.134.06-.011.182-.168-.124Zm42.956-38.473-.13.003-.246.334.054-.29.26-.184Zm3.153-15.393.09.004.116.17-.314.01Zm-25.805 20.237.06.044-.34-.166.162-.124Zm.114-.77-.066.02-.071.172.053-.345Zm13.023 12.857-.058-.132.075-.192.022.17Zm-16.932-5.114-.108.003-.067-.193.052-.006Zm27.859-27.792.104.04-.192-.027.036-.15Zm2.734 7.89-.052-.053.087-.169.014.12Zm-13.62 24.637-.072-.138.062-.06.036.13Zm-33.549 22.164-.06-.054.078-.07.001.088Zm46.161-53.845.054-.002.05.047-.149-.005Zm6.305-.994-.072-.02.023-.102.058.049Zm-9.534 14.682-.027.024-.048-.074.068-.042Zm1.6-14.717-.039-.056.052-.063.026.032Zm-6.526 14.039-.04.047-.07-.042.073-.038Zm-1.006 14.205-.009.041-.076.077.025-.107Zm9.02-26.772-.057-.054.023-.05.043.041Zm2.957 5.698-.068-.006.111-.068-.01.047Zm-4.455-7.125.046.058v.018l-.11-.08Zm-.624 11.268.01.033-.088.049.023-.07Zm2-9.835-.038-.027-.01-.06.055.03Zm-8.875 27.032-.011.044-.048-.03.047-.067Zm9.838-27.749-.059-.013-.02-.103.008-.002Zm-28.885 32.455-.037.028-.088-.047.081-.013ZM723.806 218l-.005.03-.08-.024.063-.05Zm-3.041-5.05-.02-.017-.021-.063.075.046Zm2.901 4.99-.046-.018-.014-.058.078.064Zm.239.121-.012-.096-.036-.054.057.048Zm-3.491-4.889-.026-.01-.003-.032.047-.008ZM695.739 230.7l-.021-.045.017-.02.01.01Zm24.987-19.048.016.032-.03.024-.007-.01Zm-4.506 14.882.012-.049.023.02-.03.026Zm-43.958 42.065-.017.025-.024-.025.025-.022Zm51.646-50.709-.018-.008.005-.04.014.008Zm-1.125-4.725-.01-.009.073-.026-.027.027Zm-28.066 20.859-.017-.013.003-.023.02.01Zm24.567-22.57-.01-.005-.008-.019.021-.003Zm-47.139 57.152-.01-.01.004-.018.013.007Zm48.13-56.33-.01.005-.017-.024.025.006Zm-.036-.036-.013-.001v-.021l.012.004Zm.1-.091h-.013l-.004-.008h.016Zm-.904-1.003h-.002l-.014-.006.003-.008Zm-1.925 9.346-.01.005-.005-.013.011-.001Zm.062-.116-.008.005-.006-.003.009-.008Zm2.767-8.174-.003.002-.006-.005.01-.007Zm4.132 1.29h-.005l-.002-.006.006-.002Z"
          />
          <text>Door</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-083">
          <path
            {...pathProps}
            d="m611.733 208.971 3.234.068-.23 18.958 9.442.386-.227 9.415 5.427.18-.172 9.46 13.73.34-.116 2.983 14.205.273-.195 2.708-3.915 1.23-2.189 2.82.16 2.471 1.435.744-.623.334-2.847 6-3.442 2.337-1.93 6.595-3.683 4.174-.34 4.586-19.623-.21-.427-18.792-18.564-.298.423-28.486-12.164-.044.244-9.576-3.223-.015.172-19.015Zm39.828 53.664-.1-.066.182-.158-.058.086Zm.319-.268-.143.152-.086-.145.214-.031Zm-5.52 7.374.07.036-.28-.12.123.031Zm-6.865 13.967h-.025l-.004-.057h.027Z"
          />
          <text>Oconto</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-069">
          <path {...pathProps} d="m522.145 189.15 6.318.018.173 47.832-47.619-.113.025-47.7Z" />
          <text>Lincoln</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-055">
          <path {...pathProps} d="m595.706 443.575 1.528.047-.435 37.22-36.377-.465.357-36.928Z" />
          <text>Jefferson</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-039">
          <path
            {...pathProps}
            d="m626.076 364.953.064 41.899-18.459-.066-.057-9.305-37.375-.271.028-27.925 37.207.244-.014-4.797Z"
          />
          <text>Fond du Lac</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-105">
          <path {...pathProps} d="m560.422 480.377 18.227.491.044 36.773-45.42-.846-.255-36.174Z" />
          <text>Rock</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-133">
          <path {...pathProps} d="m633.601 447.175-.454 33.634-36.348.034.435-37.221 36.422.421Z" />
          <text>Waukesha</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-065">
          <path {...pathProps} d="m468.506 483.801 28.336.105.06 32.304-45.404-.158-.009-32.057Z" />
          <text>Lafayette</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-139">
          <path {...pathProps} d="m607.408 333.41.076 36.119-37.207-.244-.08-37.276 37.197-.154Z" />
          <text>Winnebago</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-131">
          <path
            {...pathProps}
            d="m635.418 408.477.044 17.024-1.731-.002-.075 18.544-27.332-.274 1.357-36.983 27.733.114Z"
          />
          <text>Washington</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-127">
          <path {...pathProps} d="m614.902 482.443.158 34.913-36.367.285-.044-36.773 36.283.056Z" />
          <text>Walworth</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-045">
          <path {...pathProps} d="m533.018 480.621.255 36.174-36.37-.585-.027-36.877 36.145.09Z" />
          <text>Green</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-025">
          <path
            {...pathProps}
            d="m533.483 434.606 27.278-.375-.339 46.146-63.546-1.044-.01-36.763 2.164-3.217 5.973-2.27 1.427-2.173-.49-1.538 27.54-.116Z"
          />
          <text>Dane</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-077">
          <path
            {...pathProps}
            d="m548.47 360.38.04 10.904-2.318.005v6.812l2.331.274.03 4.757-5.85.244-.142 12.823-27.314.043.127-36.277Z"
          />
          <text>Marquette</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-015">
          <path {...pathProps} d="m635.199 333.02.122 36.63-9.284.025.046-4.942-18.613-.001-.076-32.877Z" />
          <text>Calumet</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-123">
          <path
            {...pathProps}
            d="m388.016 387.398 72.322-.63.082 18.904-27.794.112.252 13.803-41.374.02-2.14-3.25 1.372-3.313-.198-3.077-2.003-3.164.926-4.061-2.866-3.681.038-9.972Z"
          />
          <text>Vernon</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-047">
          <path
            {...pathProps}
            d="m570.25 360.253-.001 36.957-27.688-1.01.143-12.824 5.848-.244-.029-4.757-2.33-.274v-6.812l2.318-.005-.042-11.394Z"
          />
          <text>Green Lake</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-081">
          <path {...pathProps} d="m414.595 341.075 45.707.348.036 45.345-46.126.65-.18-37.016-4.64.061-.407-6.05Z" />
          <text>Monroe</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-078">
          <path
            {...pathProps}
            d="m601.234 238.826-.391 26.907-19.045-.096.023-9.439-18.923.03-.06-19.109 38.428.128Z"
          />
          <text>Menominee</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-137">
          <path {...pathProps} d="m570.203 333.572.041 26.281-54.87.112.007-28.278 54.817.322Z" />
          <text>Waushara</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-087">
          <path {...pathProps} d="m623.862 295.039-.153 37.045-42.19-.148.236-37.469Z" />
          <text>Outagamie</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-141">
          <path {...pathProps} d="m467.563 284.203 28.777.049.036 18.773 9.081.03.139 28.42-45.711-.116.131-47.129Z" />
          <text>Wood</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-135">
          <path
            {...pathProps}
            d="m591.89 286.63-.063 7.843-10.072-.006-.236 37.47-37.377-.003.074-47.299 47.682.337Z"
          />
          <text>Waupaca</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-053">
          <path
            {...pathProps}
            d="m395.356 293.791 17.948.05-.042 9.342 9.354.041-.038 9.413 37.455-.222.27 29.008-45.71-.348-5.573 3.148.371 6.24-13.775-.006-1.114-24.416.055-32.259Z"
          />
          <text>Jackson</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-097">
          <path {...pathProps} d="m527.074 284.278 17.142.357-.074 47.3-38.546-.46-.139-28.42-9.081-.03-.036-18.773Z" />
          <text>Portage</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-035">
          <path {...pathProps} d="m357.957 265.655 55.354-.167-.007 28.353-56.11-.033-.01-28.139Z" />
          <text>Eau Claire</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-091">
          <path
            {...pathProps}
            d="m320.598 284.315 36.597.08v9.413l-28.68.66-4.713 19.794-11.524-4.148-4.623-4.535-1.783-5.754 13.938.165.01-15.683Z"
          />
          <text>Pepin</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-115">
          <path
            {...pathProps}
            d="m559.743 246.794 3.136.064.02 9.37 18.922-.03-.023 9.439 37.609.394.245 29.07-27.825-.628.07-9.5-47.681-.338-.001-37.835Z"
          />
          <text>Shawano</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-019">
          <path
            {...pathProps}
            d="m416.422 246.577 43.693-.26-.082 66.098-37.455.222.038-9.413-9.354-.041-.016-56.57Z"
          />
          <text>Clark</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-073">
          <path {...pathProps} d="m544.18 238.899.036 45.736-84.2-.405.1-37.914 9.057.017-.025-9.488 75.037.213Z" />
          <text>Marathon</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-067">
          <path
            {...pathProps}
            d="m536.603 198.613 30.787.48-.224 9.499 19.129.005-.172 19.015 3.223.015-.244 9.576-26.263-.084.04 9.74-17.118-.05-1.546-.01-.03-9.741-15.549-.058.058-38.147Z"
          />
          <text>Langlade</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-TODOSaint Croix">
          <path
            {...pathProps}
            d="m272.169 227.108 46.023.018-.053 9.606 1.609.011-.01 28.74-48.79-.454-.416-3.99 1.852-4.15-1.528-4.675.667-4.721-3.184-4.452 4.893-5.593-2.17-8.266Z"
          />
          <text>Saint Croix</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-017">
          <path
            {...pathProps}
            d="m367.238 218.089 45.845-.01.228 47.41-56.127.18-.084-28.85-1.15.002.069-9.528 9.504.16.1-9.376Z"
          />
          <text>Chippewa</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-119">
          <path {...pathProps} d="m413.769 208.516 67.382-.26-.134 28.63-11.87-.04.026 9.487-55.927.28Z" />
          <text>Taylor</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-107">
          <path {...pathProps} d="m366.347 180.119 65.73-.089v28.645l-19.003-.168.009 9.572-47.46-.002Z" />
          <text>Rusk</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-005">
          <path {...pathProps} d="m321.485 179.845 44.184.264-.146 47.343-47.331-.326.106-47.247Z" />
          <text>Barron</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-085">
          <path
            {...pathProps}
            d="m538.309 151.22-.033 4.247 9.678.461-.221-4.733 10.07.448.072 47.493-29.18-.283-.232-9.685-47.421.02.02-37.753Z"
          />
          <text>Oneida</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-099">
          <path {...pathProps} d="m433.76 142.091 47.223-.045.168 66.21-49.074.42-.05-62.608.176-3.983Z" />
          <text>Price</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-113">
          <path
            {...pathProps}
            d="m368.044 122.624 45.09.225-.024 19.288 19.093-.052-.127 37.945-66.407.08-.841-57.514Z"
          />
          <text>Sawyer</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-129">
          <path
            {...pathProps}
            d="m328.092 122.514 36.736.082.84 57.513-37.83-.248-.174-38.032-1.314-.012-.012-11.263.095-8.036Z"
          />
          <text>Washburn</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-125">
          <path
            {...pathProps}
            d="m489.877 106.676 64.533 17.988 12.248 7.207-.064 10.117-8.794-.001.002 9.656-10.069-.448.22 4.733-9.677-.46.034-4.516-57.248.483-.08-9.389 8.922-.02Z"
          />
          <text>Vilas</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-003">
          <path
            {...pathProps}
            d="M427.863 62.97 442 74.93l-.173 38.275 9.758.056-.043 9.655 9.464-.1.08 19.265-47.976.056-.211-67.417 11.387-5.117 2.961-2.57-1.715-.667.74-1.019 3.672.505-4.08-4.449Zm9.287-20.69 3.383 3.028-8.07 3.085 1.26 3.509-4.647.38-3.392 3.318-2.046.293-.162-3.717 4.453-1.611Zm6.63-10.598 1.466 1.263-2.85 2.913.41 2.365-2.197-1.683-5.02 2.047-1.652-1.318 1.515-2.767Zm8.572-12.281 1.721.089-.811 5.796-5.053 4.149 1.558-8.817Zm-24.079 13.372 1.126.124 1.835 4.45-3.62.429-2.155-3.57Zm-.253 9.61.514 1.727-2.994 2.926.964-3.225Zm-1.982-18.118 1.382 2.078-.69 1.758-2.03-1.73Zm22.464 17.044-1.887 1.264-2.075-.522 5.158-2.606Zm-7.473-17.799 1.303 3.293-1.448 1.783-.856-4.302Zm-5.805 6.673-1.347 2.768-1.776.05 1.833-2.295Zm-4.278-3.061 1.806.973-3.1 1.669.542-2.178Zm3.597-5.233-2.465 3.974-1.06-.413.334-2.335Zm-1.986 18.073-.409 1.414-1.949-.255.656-.761Zm4.796-12.824.602 1.01-1.185 1.067-.721-1.481Zm-2.431-3.673.379.534-.528 1.225-.631-1.022Zm-6.732-4.54.59.819-.074 1.2-.624-.39Zm-5.385 39.466 1.328.275.789.9.483 1.013-3.507-1.934Zm16.158-36.996-.091-.972.298-.93.248.736Zm-7.74-2.226-.188.645-.519-.39.24-.157Zm-5.49 41.964.131.057-.013.12-.168-.165Zm24.595-22.54-.132.002-.063.027.135-.12Zm-24.794 22.244h-.049l-.052-.05.16.01Zm-.138-.126-.059.02.125-.094-.004.015Zm-.082.183-.021-.074.03-.074.006.008Zm-.21-.32-.05-.02.03-.082.02.036Zm.08.155h-.045l-.042-.073.05.002Zm.41.183-.031-.011.06-.034v.005Zm.04.068-.029.006.064-.061-.006.021Zm-.408-.306h.032l.01.006-.023.04Zm.197-.05-.023.013-.01-.006.059-.037Zm-.31 0-.024.003-.019-.01.027-.008Zm19.354-26.509-.026.006-.013-.008.03-.01Zm-.333.378-.013-.004-.001-.013.016.006Z"
          />
          <text>Ashland</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-031">
          <path
            {...pathProps}
            d="m323.305 56.3 4.276 4.507 7.042 3.309 11.305-1.523 18.82-7.005.08 67.008-57.183-.08.08-57.002 1.675 1.905 4.89-.152 2.396-3.899-2.296-1.432 1.092-1.931 3.304.133.82-2.75Z"
          />
          <text>Douglas</text>
        </Link>
        <Link {...linkProps} href="/region/US-WI-007">
          <path
            {...pathProps}
            d="m417.905 32.278 2.196.735.768 2.64 2.169-.434 3.507 5.164-1.645.791-3.12 8.53-5.607 5.816 2.418 7.085-4.442 3.376-.763 3.94-2.34 3.09 1.883 2.2.206 47.638-48.307-.253-.08-67.008 14.073-4.248 4.316-3.822 4.357-1.022 5.407-5.606-1.37 3.015 1.459 1.486 1.397.166 2.203-3.203.288 1.594 2.14.244 1.268-2.91 3.194-.034 6.038-6.738 3.965 1.278Zm-5.745-4.613 1.045 1.672-.796 2.965-3.77-1.558Zm11.39 2.561-.015 1.219-1.237-.06.65-1.06Zm-6.166-.536 1.037-.133.366.198-.602 1.021-1.264-1.065-.205-.645Zm-12.774 4.46-.115.558-.167-.088.066-.34Zm-.142.581-.009.003-.005-.007.012-.004Z"
          />
          <text>Bayfield</text>
        </Link>
      </svg>
    </>
  );
}
