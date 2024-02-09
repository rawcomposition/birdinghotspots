import Link from "next/link";
import MapTooltip from "components/MapTooltip";
import useHoverMap from "hooks/useHoverMap";

export default function KansasMap() {
  const { linkProps, pathProps, tooltipProps, svgRef } = useHoverMap();

  return (
    <>
      <MapTooltip {...tooltipProps} />
      <svg
        className="state-map hover-map max-w-[500px]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMinYMin meet"
        ref={svgRef}
        viewBox="44 68 880 460"
      >
        <Link href="/region/US-KS-053" {...linkProps}>
          <path {...pathProps} d="m464.924 257.376.08-13.074 65.242-.046.507 52.348-65.223.137Z" stroke="#FFF" />
          <text>Ellsworth</text>
        </Link>
        <Link href="/region/US-KS-095" {...linkProps}>
          <path {...pathProps} d="m467.345 427.356.011-12.95 77.055-.175.09 51.424-77.162.325Z" stroke="#FFF" />
          <text>Kingman</text>
        </Link>
        <Link href="/region/US-KS-135" {...linkProps}>
          <path {...pathProps} d="m258.242 276.85.064-6.574 77.656.244.104 65.077-77.431-.016Z" stroke="#FFF" />
          <text>Ness</text>
        </Link>
        <Link href="/region/US-KS-199" {...linkProps}>
          <path {...pathProps} d="m47.192 204.706 66.735-.244-.726 65.513-65.777.39Z" stroke="#FFF" />
          <text>Wallace</text>
        </Link>
        <Link href="/region/US-KS-069" {...linkProps}>
          <path
            {...pathProps}
            d="m209.31 394.306.091-19.993 51.32.226 1.217 77.986-51.185.05.105-52.42-1.575-.018Z"
            stroke="#FFF"
          />
          <text>Gray</text>
        </Link>
        <Link href="/region/US-KS-143" {...linkProps}>
          <path {...pathProps} d="m529.892 182.919.295-4.441 65.593.059-.208 52.642-65.322-.082Z" stroke="#FFF" />
          <text>Ottawa</text>
        </Link>
        <Link href="/region/US-KS-181" {...linkProps}>
          <path {...pathProps} d="m46.89 138.723 77.49-.029-.31 65.715-76.878.297Z" stroke="#FFF" />
          <text>Sherman</text>
        </Link>
        <Link href="/region/US-KS-033" {...linkProps}>
          <path {...pathProps} d="m340.703 483.065.173-16.648 63.557-.468.116 56.653-63.43-.01Z" stroke="#FFF" />
          <text>Comanche</text>
        </Link>
        <Link href="/region/US-KS-149" {...linkProps}>
          <path
            {...pathProps}
            d="m671.02 160.161 2.222-4.929 2.492-.215.782-3.335 1.605 1.16 2.745-6.628 6.519-4.146.99-3.064 63.852.036.006 66.175-6.469-3.77 4.015-.98-5.881-6.028-1.852 2.105-6.332-.226-.566-2.681-6.262-.878-4.037 5.02-4.919-2.563-4.143 6.353-1.288-2.892-2.365 1.345-7.963-4.012-3.21 3.93-1.373-2.213-3.746 1.237-.045-2.496-4.555 1.196-.548-2.724 4.91-1.192-3.334-.513-1.733-4.889-2.945.426 1.649-2.12-2.114.43-5.23-5.846-2.471-4.394 1.185-1.361-2.86-1 1.082-1.533-7.618-9.212 1.351-2.534Z"
            stroke="#FFF"
          />
          <text>Pottawatomie</text>
        </Link>
        <Link href="/region/US-KS-083" {...linkProps}>
          <path {...pathProps} d="m260.659 335.589 77.015.015.072 52.025-77.082-.15Z" stroke="#FFF" />
          <text>Hodgeman</text>
        </Link>
        <Link href="/region/US-KS-203" {...linkProps}>
          <path {...pathProps} d="m103.5 270.05 51.456-.14.345 65.34-51.846.203Z" stroke="#FFF" />
          <text>Wichita</text>
        </Link>
        <Link href="/region/US-KS-065" {...linkProps}>
          <path {...pathProps} d="m268.114 187.36.224-48.5 65.62-.007-.353 65.954-65.488.087Z" stroke="#FFF" />
          <text>Graham</text>
        </Link>
        <Link href="/region/US-KS-067" {...linkProps}>
          <path {...pathProps} d="m108.196 413.866 51.3-.003.002 51.58-51.155-.098Z" stroke="#FFF" />
          <text>Grant</text>
        </Link>
        <Link href="/region/US-KS-195" {...linkProps}>
          <path {...pathProps} d="m269.5 248.59.448-43.737 65.23-.027-.768 65.698-65.152-.124Z" stroke="#FFF" />
          <text>Trego</text>
        </Link>
        <Link href="/region/US-KS-105" {...linkProps}>
          <path {...pathProps} d="m464.383 191.6 65.728.076.135 52.58-65.242.046Z" stroke="#FFF" />
          <text>Lincoln</text>
        </Link>
        <Link href="/region/US-KS-109" {...linkProps}>
          <path {...pathProps} d="m113.338 261.203.59-56.74 78.151.211-.802 65.347-78.076-.046Z" stroke="#FFF" />
          <text>Logan</text>
        </Link>
        <Link href="/region/US-KS-111" {...linkProps}>
          <path {...pathProps} d="m714.569 348.549.518-84.415 47.699-.014-1.518 85.098Z" stroke="#FFF" />
          <text>Lyon</text>
        </Link>
        <Link href="/region/US-KS-113" {...linkProps}>
          <path {...pathProps} d="m530.693 327.154-.001-43.619 64.845.08.02 65.195-64.553-.006Z" stroke="#FFF" />
          <text>McPherson</text>
        </Link>
        <Link href="/region/US-KS-049" {...linkProps}>
          <path {...pathProps} d="m694.713 448.854.12-15.829 66.184.482-.398 44.991-65.736-.515Z" stroke="#FFF" />
          <text>Elk</text>
        </Link>
        <Link href="/region/US-KS-057" {...linkProps}>
          <path
            {...pathProps}
            d="m260.637 396.116.027-8.636 77.082.149 1.614 66-77.422-1.104.187-52.088-1.499-.005Z"
            stroke="#FFF"
          />
          <text>Ford</text>
        </Link>
        <Link href="/region/US-KS-091" {...linkProps}>
          <path
            {...pathProps}
            d="m867.12 227.717 2.707.799 2.254-3.826 6.745 2.85 3.894-3.118.686 2.769 5.835-11.46 7.556 2.519 22.965-.086-.233 46.108-52.416-.073Z"
            stroke="#FFF"
          />
          <text>Johnson</text>
        </Link>
        <Link href="/region/US-KS-097" {...linkProps}>
          <path {...pathProps} d="m338.954 414.078 64.042.284.24 51.592-63.836.465Z" stroke="#FFF" />
          <text>Kiowa</text>
        </Link>
        <Link href="/region/US-KS-101" {...linkProps}>
          <path {...pathProps} d="m206.605 269.997 51.7.279.33 65.305-51.642-.276Z" stroke="#FFF" />
          <text>Lane</text>
        </Link>
        <Link href="/region/US-KS-063" {...linkProps}>
          <path {...pathProps} d="m191.266 267.296.813-62.622 77.869.179-.69 65.547-77.981-.38Z" stroke="#FFF" />
          <text>Gove</text>
        </Link>
        <Link href="/region/US-KS-073" {...linkProps}>
          <path
            {...pathProps}
            d="m694.77 416.964.358-55.137 19.315.082.097-12.948 46.728.257-.25 84.289-66.185-.482Z"
            stroke="#FFF"
          />
          <text>Greenwood</text>
        </Link>
        <Link href="/region/US-KS-077" {...linkProps}>
          <path {...pathProps} d="m480.844 465.985 63.949-.331.264 57.065-63.902.11Z" stroke="#FFF" />
          <text>Harper</text>
        </Link>
        <Link href="/region/US-KS-085" {...linkProps}>
          <path
            {...pathProps}
            d="m752.243 140.827-.016-1.787 28.952.023.019-13.253 26.367.02-.73 35.559-2.222-.006-.02 30.776-52.322-.066Z"
            stroke="#FFF"
          />
          <text>Jackson</text>
        </Link>
        <Link href="/region/US-KS-001" {...linkProps}>
          <path {...pathProps} d="m812.128 412.231.734-43.233 51.734.078-1.197 45.36-51.303-.043Z" stroke="#FFF" />
          <text>Allen</text>
        </Link>
        <Link href="/region/US-KS-009" {...linkProps}>
          <path {...pathProps} d="m400.75 309.75-.032-39.263 64.86-.024.014 65.342-64.796-.065Z" stroke="#FFF" />
          <text>Barton</text>
        </Link>
        <Link href="/region/US-KS-015" {...linkProps}>
          <path {...pathProps} d="m621.16 400.68.063-39.052 73.905.2-.34 90.517-73.614.127Z" stroke="#FFF" />
          <text>Butler</text>
        </Link>
        <Link href="/region/US-KS-025" {...linkProps}>
          <path
            {...pathProps}
            d="m274.72 452.577 64.64 1.051.04 12.791 1.476-.002.244 56.176-64.316-.37-.24-56.657-1.864-.03Z"
            stroke="#FFF"
          />
          <text>Clark</text>
        </Link>
        <Link href="/region/US-KS-029" {...linkProps}>
          <path {...pathProps} d="m529.852 134.83.055-9.137 66.01-.042-.137 52.886-65.593-.059Z" stroke="#FFF" />
          <text>Cloud</text>
        </Link>
        <Link href="/region/US-KS-043" {...linkProps}>
          <path
            {...pathProps}
            d="M833.864 72.816h3.707l6.807 7.86 5.375 1.483.292 5.337 6.132-.29 1.474 4.219 5.504 2.324 6.145-.367 2.887-5.26 9.226 1.008-.619 6.332 6.197 2.877 1.289 3.024-.955 2.91-6.007 2.843 2.698 2.482 5.002-2.068.786 4.562-4.266 2.89-7.127-2.901-1.317 8.638-6.25 2.732-3.376 8.097-5.233-.845-2.016-4.824-26.336-.066Z"
            stroke="#FFF"
          />
          <text>Doniphan</text>
        </Link>
        <Link href="/region/US-KS-087" {...linkProps}>
          <path
            {...pathProps}
            d="m803.552 213.72 1.061-52.337 47.9-.02-.728 56.798-10.847-.467-.685 2.27-1.469-1.53-5.017 1.599-10.549-5.677-7.407 2.318-5.75-2.288-4.632 2.281Z"
            stroke="#FFF"
          />
          <text>Jefferson</text>
        </Link>
        <Link href="/region/US-KS-089" {...linkProps}>
          <path {...pathProps} d="m462.622 138.654.084-66.194 67.161.042-.002 66.413Z" stroke="#FFF" />
          <text>Jewell</text>
        </Link>
        <Link href="/region/US-KS-023" {...linkProps}>
          <path {...pathProps} d="m46.658 72.345 75.145.11-.336 66.24-74.577.028Z" stroke="#FFF" />
          <text>Cheyenne</text>
        </Link>
        <Link href="/region/US-KS-013" {...linkProps}>
          <path {...pathProps} d="m781.193 108.038.102-35.29 52.57.068.018 52.997-52.685-.003Z" stroke="#FFF" />
          <text>Brown</text>
        </Link>
        <Link href="/region/US-KS-045" {...linkProps}>
          <path
            {...pathProps}
            d="m814.922 220.365.135-4.1 8.161-1.909 10.549 5.677 5.017-1.599 1.47 1.53.684-2.27 10.847.467.107 12.009 2.588-2.578 9.253 4.193 1.264-1.59-1.435-2.39 3.047-.816.504 37.21-52.113-.033Z"
            stroke="#FFF"
          />
          <text>Douglas</text>
        </Link>
        <Link href="/region/US-KS-051" {...linkProps}>
          <path {...pathProps} d="m334.482 266.178.696-61.352 65.009-.116-.601 65.77-65.176.044Z" stroke="#FFF" />
          <text>Ellis</text>
        </Link>
        <Link href="/region/US-KS-055" {...linkProps}>
          <path
            {...pathProps}
            d="m157.933 378.046-.032-42.804 102.758.347.062 38.95-51.32-.226 1.398 39.559-51.303-.01Z"
            stroke="#FFF"
          />
          <text>Finney</text>
        </Link>
        <Link href="/region/US-KS-173" {...linkProps}>
          <path
            {...pathProps}
            d="m544.35 427.135.06-12.904 12.8-.178-.369-26.341 64.433-.041-.1 64.801-76.737.201Z"
            stroke="#FFF"
          />
          <text>Sedgwick</text>
        </Link>
        <Link href="/region/US-KS-177" {...linkProps}>
          <path
            {...pathProps}
            d="m751.87 205.219.401-13.126 52.322.066-.855 22.896 11.319 1.21-.055 28.184-52.294-.024-.02-34.51-7.322-2.639 1.893-2.606-2.81 1.974Z"
            stroke="#FFF"
          />
          <text>Shawnee</text>
        </Link>
        <Link href="/region/US-KS-185" {...linkProps}>
          <path
            {...pathProps}
            d="m401.965 389.787.024-15.132 12.784-.032.065-38.863 51.623.052.021 64.968-64.55-.128Z"
            stroke="#FFF"
          />
          <text>Stafford</text>
        </Link>
        <Link href="/region/US-KS-059" {...linkProps}>
          <path {...pathProps} d="m814.03 276.165.97-11.999 52.113.033-1.105 52.297-51.898-.05Z" stroke="#FFF" />
          <text>Franklin</text>
        </Link>
        <Link href="/region/US-KS-175" {...linkProps}>
          <path {...pathProps} d="m162.025 465.431 50.934.034.06 57.074-50.8.296Z" stroke="#FFF" />
          <text>Seward</text>
        </Link>
        <Link href="/region/US-KS-017" {...linkProps}>
          <path
            {...pathProps}
            d="m657.788 336.82.41-14.145 2.132.02-.004-26.045 54.624.119-.507 65.14-56.61.03Z"
            stroke="#FFF"
          />
          <text>Chase</text>
        </Link>
        <Link href="/region/US-KS-183" {...linkProps}>
          <path {...pathProps} d="m396.714 83.464.01-10.98 65.982-.024-.096 66.35-65.792-.079Z" stroke="#FFF" />
          <text>Smith</text>
        </Link>
        <Link href="/region/US-KS-189" {...linkProps}>
          <path {...pathProps} d="m104.73 465.331 57.295.1.194 57.404-57.33.368Z" stroke="#FFF" />
          <text>Stevens</text>
        </Link>
        <Link href="/region/US-KS-037" {...linkProps}>
          <path
            {...pathProps}
            d="m863.352 440.241.055-17.214 55.157.21.012 49.482-53.662-.224.022-6.476-1.55-.002Z"
            stroke="#FFF"
          />
          <text>Crawford</text>
        </Link>
        <Link href="/region/US-KS-027" {...linkProps}>
          <path {...pathProps} d="m595.647 201.107.282-62.207 48.07.094-.312 65.837-48.06.055Z" stroke="#FFF" />
          <text>Clay</text>
        </Link>
        <Link href="/region/US-KS-031" {...linkProps}>
          <path {...pathProps} d="m761.262 357.89 1.013-48.004 51.842.026-1.255 59.086-51.615-.292Z" stroke="#FFF" />
          <text>Coffey</text>
        </Link>
        <Link href="/region/US-KS-159" {...linkProps}>
          <path
            {...pathProps}
            d="m465.499 309.8.03-13.059 65.224-.137.25 52.2-25.818-.03.01 2.145-8.649.117-.012-2.2-30.115.11Z"
            stroke="#FFF"
          />
          <text>Rice</text>
        </Link>
        <Link href="/region/US-KS-169" {...linkProps}>
          <path {...pathProps} d="m530.24 242.376.01-11.28 65.322.083-.035 52.435-64.845-.079Z" stroke="#FFF" />
          <text>Saline</text>
        </Link>
        <Link href="/region/US-KS-125" {...linkProps}>
          <path {...pathProps} d="m760.599 512.6-.011-47 52.02.394-.15 56.641-51.824.028Z" stroke="#FFF" />
          <text>Montgomery</text>
        </Link>
        <Link href="/region/US-KS-209" {...linkProps}>
          <path
            {...pathProps}
            d="m884.423 218.265 1.013-24.112 14.42.289 4.14 4.66 7.226-2.133 2.879 4.33 7.902.879-2.331 4.827.09 11.16-22.965.085-7.556-2.518-4.81 10.385Z"
            stroke="#FFF"
          />
          <text>Wyandotte</text>
        </Link>
        <Link href="/region/US-KS-131" {...linkProps}>
          <path {...pathProps} d="m728.33 125.76.058-53.05 52.907.037-.116 66.316-52.763-.042Z" stroke="#FFF" />
          <text>Nemaha</text>
        </Link>
        <Link href="/region/US-KS-141" {...linkProps}>
          <path {...pathProps} d="m398.88 178.397.498-39.652 65.33.083-.307 65.946-65.409-.047Z" stroke="#FFF" />
          <text>Osborne</text>
        </Link>
        <Link href="/region/US-KS-193" {...linkProps}>
          <path {...pathProps} d="m124.065 204.245.315-65.55 78.448.05-.127 65.926Z" stroke="#FFF" />
          <text>Thomas</text>
        </Link>
        <Link href="/region/US-KS-021" {...linkProps}>
          <path {...pathProps} d="m864.914 472.495 53.662.224-.039 49.972-53.43-.09Z" stroke="#FFF" />
          <text>Cherokee</text>
        </Link>
        <Link href="/region/US-KS-147" {...linkProps}>
          <path {...pathProps} d="m330.917 119.559.326-47.028 65.481-.047.094 66.247-65.883.105Z" stroke="#FFF" />
          <text>Phillips</text>
        </Link>
        <Link href="/region/US-KS-151" {...linkProps}>
          <path {...pathProps} d="m402.785 427.569.238-26.913 64.322.122.028 52.364-64.266.087Z" stroke="#FFF" />
          <text>Pratt</text>
        </Link>
        <Link href="/region/US-KS-153" {...linkProps}>
          <path {...pathProps} d="m121.932 101.113-.129-28.659 78.842.021-.24 66.269-78.938-.048Z" stroke="#FFF" />
          <text>Rawlins</text>
        </Link>
        <Link href="/region/US-KS-061" {...linkProps}>
          <path
            {...pathProps}
            d="m643.443 225.658.207-34.104 13.114.161.025 12.064 2.191.008-2.395 7.717 41.103 2.341-.07 30.62-49.865-.096.059-16.371-4.37 2.118Z"
            stroke="#FFF"
          />
          <text>Geary</text>
        </Link>
        <Link href="/region/US-KS-171" {...linkProps}>
          <path {...pathProps} d="m154.956 269.91 51.65.087.387 65.308-51.692-.056Z" stroke="#FFF" />
          <text>Scott</text>
        </Link>
        <Link href="/region/US-KS-071" {...linkProps}>
          <path {...pathProps} d="m47.418 299.206.006-28.84 56.077-.316-.046 65.403-55.949.11Z" stroke="#FFF" />
          <text>Greeley</text>
        </Link>
        <Link href="/region/US-KS-123" {...linkProps}>
          <path {...pathProps} d="m464.393 188.285.315-49.457 65.554.088-.151 52.76-65.728-.077Z" stroke="#FFF" />
          <text>Mitchell</text>
        </Link>
        <Link href="/region/US-KS-139" {...linkProps}>
          <path {...pathProps} d="m762.283 308.786.425-64.36 52.294.023-.885 65.463Z" stroke="#FFF" />
          <text>Osage</text>
        </Link>
        <Link href="/region/US-KS-191" {...linkProps}>
          <path {...pathProps} d="m544.437 452.673 76.737-.2.658 70.187-76.775.059Z" stroke="#FFF" />
          <text>Sumner</text>
        </Link>
        <Link href="/region/US-KS-145" {...linkProps}>
          <path
            {...pathProps}
            d="m335.997 322.563 64.787.158.012 13.019 14.042.02-.065 38.863-51.272-.044-.008-12.934-25.706.033Z"
            stroke="#FFF"
          />
          <text>Pawnee</text>
        </Link>
        <Link href="/region/US-KS-081" {...linkProps}>
          <path {...pathProps} d="m159.404 431.075.092-17.212 51.303.009-.056 51.586-51.245-.014Z" stroke="#FFF" />
          <text>Haskell</text>
        </Link>
        <Link href="/region/US-KS-093" {...linkProps}>
          <path
            {...pathProps}
            d="m106.453 387.397-.046-51.953 51.494-.202-.06 64.864 1.63-.012.025 13.769-51.3.003Z"
            stroke="#FFF"
          />
          <text>Kearny</text>
        </Link>
        <Link href="/region/US-KS-163" {...linkProps}>
          <path {...pathProps} d="m333.57 191.552.388-52.7 65.42-.107-.386 65.982-65.387.08Z" stroke="#FFF" />
          <text>Rooks</text>
        </Link>
        <Link href="/region/US-KS-201" {...linkProps}>
          <path {...pathProps} d="M595.855 84.712V72.5l66.083.105-.091 66.384-65.918-.09Z" stroke="#FFF" />
          <text>Washington</text>
        </Link>
        <Link href="/region/US-KS-205" {...linkProps}>
          <path {...pathProps} d="m760.83 461.007.202-46.843 51.064.23-.007 51.602-51.142-.392Z" stroke="#FFF" />
          <text>Wilson</text>
        </Link>
        <Link href="/region/US-KS-167" {...linkProps}>
          <path {...pathProps} d="m399.62 268.226.567-63.516 64.947.068-.277 65.691-65.271.01Z" stroke="#FFF" />
          <text>Russell</text>
        </Link>
        <Link href="/region/US-KS-127" {...linkProps}>
          <path
            {...pathProps}
            d="m647.013 276.331.679-23.2 4.347-.001-.009-8.719 45.588.055.018 6.553 13.02.05.075 13.07 4.356-.005-.137 32.635-67.58-.113Z"
            stroke="#FFF"
          />
          <text>Morris</text>
        </Link>
        <Link href="/region/US-KS-129" {...linkProps}>
          <path {...pathProps} d="m47.786 503.905.063-38.678 56.882.104.157 57.872-57.098.352Z" stroke="#FFF" />
          <text>Morton</text>
        </Link>
        <Link href="/region/US-KS-133" {...linkProps}>
          <path {...pathProps} d="m812.048 427.31.048-12.917 51.303.042-.013 51.582-51.297-.02Z" stroke="#FFF" />
          <text>Neosho</text>
        </Link>
        <Link href="/region/US-KS-187" {...linkProps}>
          <path {...pathProps} d="m47.812 442.767-.01-29.231 60.394.33.147 51.479-60.494-.118Z" stroke="#FFF" />
          <text>Stanton</text>
        </Link>
        <Link href="/region/US-KS-003" {...linkProps}>
          <path {...pathProps} d="m812.89 359.242 1.22-42.796 51.898.05-1.412 52.58-51.734-.078Z" stroke="#FFF" />
          <text>Anderson</text>
        </Link>
        <Link href="/region/US-KS-047" {...linkProps}>
          <path
            {...pathProps}
            d="m337.746 387.629.04-25.951 25.707-.033.008 12.934 38.488.076 1.007 39.707-64.042-.284Z"
            stroke="#FFF"
          />
          <text>Edwards</text>
        </Link>
        <Link href="/region/US-KS-119" {...linkProps}>
          <path
            {...pathProps}
            d="M210.753 461.167v-8.592l63.967.002-.02 12.96 1.864.03.24 56.656-63.786.316-.059-57.074-2.216-.007Z"
            stroke="#FFF"
          />
          <text>Meade</text>
        </Link>
        <Link href="/region/US-KS-157" {...linkProps}>
          <path {...pathProps} d="m529.68 99.204.187-26.702 65.988-.001.062 53.15-66.01.042Z" stroke="#FFF" />
          <text>Republic</text>
        </Link>
        <Link href="/region/US-KS-121" {...linkProps}>
          <path {...pathProps} d="m865.995 314.501 1.118-50.302 52.416.073-.442 52.407-53.079-.183Z" stroke="#FFF" />
          <text>Miami</text>
        </Link>
        <Link href="/region/US-KS-041" {...linkProps}>
          <path
            {...pathProps}
            d="m594.447 237.305 1.18-32.42 47.85-.05-.035 25.28 4.37-2.117-.059 16.37 4.277.043.009 8.719h-4.347l-.358 30.483-51.797.001Z"
            stroke="#FFF"
          />
          <text>Dickinson</text>
        </Link>
        <Link href="/region/US-KS-137" {...linkProps}>
          <path {...pathProps} d="m266.138 137.82.308-65.248 64.797-.041-.308 66.305Z" stroke="#FFF" />
          <text>Norton</text>
        </Link>
        <Link href="/region/US-KS-179" {...linkProps}>
          <path {...pathProps} d="m202.68 195.913.148-57.168 65.51.115-.297 66.01-65.34-.199Z" stroke="#FFF" />
          <text>Sheridan</text>
        </Link>
        <Link href="/region/US-KS-007" {...linkProps}>
          <path
            {...pathProps}
            d="m403.107 453.23 64.266-.088-.034 12.838 13.505.005.311 56.844-76.606-.227Z"
            stroke="#FFF"
          />
          <text>Barber</text>
        </Link>
        <Link href="/region/US-KS-117" {...linkProps}>
          <path {...pathProps} d="m661.837 116.929.101-44.323 66.45.105.028 66.31-66.569-.03Z" stroke="#FFF" />
          <text>Marshall</text>
        </Link>
        <Link href="/region/US-KS-207" {...linkProps}>
          <path {...pathProps} d="m760.97 401.153.277-32.447 51.615.292-.766 45.395-51.064-.229Z" stroke="#FFF" />
          <text>Woodson</text>
        </Link>
        <Link href="/region/US-KS-075" {...linkProps}>
          <path
            {...pathProps}
            d="m47.49 367.91.016-32.347 58.901-.12-.052 64.877 1.852-.004-.011 13.55-60.394-.33Z"
            stroke="#FFF"
          />
          <text>Hamilton</text>
        </Link>
        <Link href="/region/US-KS-039" {...linkProps}>
          <path {...pathProps} d="m200.378 125.47.267-52.995 65.801.097-.3 66.347-65.741-.175Z" stroke="#FFF" />
          <text>Decatur</text>
        </Link>
        <Link href="/region/US-KS-011" {...linkProps}>
          <path {...pathProps} d="m863.399 414.435 1.197-45.359 54.408.097-.44 54.063-55.157-.21Z" stroke="#FFF" />
          <text>Bourbon</text>
        </Link>
        <Link href="/region/US-KS-005" {...linkProps}>
          <path
            {...pathProps}
            d="m806.846 152.586.72-26.757 52.653.05 1.94 4.755 5.309.914.814 2.088-1.533 3.42-5.5.591-.022 5.719 6.383 5.726 1.337 5.107 5.935 3.068 2.501 4.118-70.548.004Z"
            stroke="#FFF"
          />
          <text>Atchison</text>
        </Link>
        <Link href="/region/US-KS-099" {...linkProps}>
          <path {...pathProps} d="m812.43 513.2.178-47.206 52.328.025.172 56.583-52.65.033Z" stroke="#FFF" />
          <text>Labette</text>
        </Link>
        <Link href="/region/US-KS-103" {...linkProps}>
          <path
            {...pathProps}
            d="m851.684 205.347.83-43.984 24.87.022 3.716 4.94 5.652-.896.892 3.346-3.434 3.344 1.242 7.3 8.044 6.654-.025 6.108 6.585 2.321-14.62-.35-1.596 32.707-1.12-2.437-3.894 3.118-7.575-2.72-1.424 3.696-6.04-1.035 1.21 2.715-1.264 1.589-9.253-4.193-2.588 2.578Z"
            stroke="#FFF"
          />
          <text>Leavenworth</text>
        </Link>
        <Link href="/region/US-KS-197" {...linkProps}>
          <path
            {...pathProps}
            d="m697.603 237.893.06-19.665 12.945.061.206-19.592 3.685-.022 1.288 2.892 4.143-6.353 4.919 2.563 4.188-5.042 6.111.9.566 2.681 6.332.226 1.852-2.105 5.833 5.808-3.635 1.56 7.962 4.854 3.2-1.989-1.892 2.606 7.322 2.64.098 54.204-52.055.02-.076-13.071-13.019-.05Z"
            stroke="#FFF"
          />
          <text>Wabaunsee</text>
        </Link>
        <Link href="/region/US-KS-161" {...linkProps}>
          <path
            {...pathProps}
            d="m643.738 181.464.261-42.47 44.376.01-.99 3.064-6.519 4.146-2.745 6.627-1.605-1.16-.782 3.336-2.492.215-2.027 8.502 7.618 9.212-1.081 1.532 2.859 1-1.185 1.362 2.47 4.394 5.231 5.847 2.347-.082-1.882 1.77 2.945-.425 1.733 4.889 3.335.513-4.911 1.192.548 2.724 4.555-1.196.045 2.496 3.746-1.237 1.372 2.213 2.465-4.01 7.303 2.636-.12 19.725-12.944-.061.024-4.383-41.103-2.34 2.395-7.718-2.191-.008-.025-12.064-13.114-.16Z"
            stroke="#FFF"
          />
          <text>Riley</text>
        </Link>
        <Link href="/region/US-KS-019" {...linkProps}>
          <path {...pathProps} d="m694.805 512.165.078-34.182 65.736.515.015 44.165-65.834.056Z" stroke="#FFF" />
          <text>Chautauqua</text>
        </Link>
        <Link href="/region/US-KS-079" {...linkProps}>
          <path {...pathProps} d="m556.797 363.722.044-14.933 64.36-.122.073 39.004-64.448.21Z" stroke="#FFF" />
          <text>Harvey</text>
        </Link>
        <Link href="/region/US-KS-107" {...linkProps}>
          <path {...pathProps} d="m864.69 360.408 1.318-43.912 53.079.183-.083 52.494-54.408-.097Z" stroke="#FFF" />
          <text>Linn</text>
        </Link>
        <Link href="/region/US-KS-035" {...linkProps}>
          <path {...pathProps} d="m621.174 452.472 73.613-.127.013 70.374-72.968-.059Z" stroke="#FFF" />
          <text>Cowley</text>
        </Link>
        <Link href="/region/US-KS-155" {...linkProps}>
          <path
            {...pathProps}
            d="m466.419 348.947 30.115-.111.012 2.2 8.65-.117-.01-2.146 51.655.016.37 65.264-89.855.353Z"
            stroke="#FFF"
          />
          <text>Reno</text>
        </Link>
        <Link href="/region/US-KS-115" {...linkProps}>
          <path
            {...pathProps}
            d="m595.535 296.693.002-13.079 25.94-.03 25.857.029.037 13.043 12.955-.006-2.493 65.289-36.61-.31-.021-12.962-25.646.143Z"
            stroke="#FFF"
          />
          <text>Marion</text>
        </Link>
        <Link href="/region/US-KS-165" {...linkProps}>
          <path {...pathProps} d="m335.804 292.075.158-21.555 64.756-.033.066 52.234-64.787-.158Z" stroke="#FFF" />
          <text>Rush</text>
        </Link>
      </svg>
    </>
  );
}
