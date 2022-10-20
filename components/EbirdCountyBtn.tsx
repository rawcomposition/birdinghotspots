import { Menu } from "@headlessui/react";
import { State, County } from "lib/types";

type Props = {
  state?: State;
  county?: County;
};

export default function EbirdCountyBtn({ state, county }: Props) {
  const { ebirdCode } = county || ({} as County);
  const { portal } = state || ({} as State);

  const getUrl = (bMonth: number, eMonth: number) => {
    return `${base}/barchart?yr=all&bmo=${bMonth}&emo=${eMonth}&r=${ebirdCode}`;
  };

  const base = portal ? `https://ebird.org/${portal}` : "https://ebird.org";

  return (
    <div className="relative inline-block">
      <Menu>
        <Menu.Button className="text-[13px] rounded-md text-gray-600 bg-gray-100 px-2 inline-block font-medium">
          Explore in
          <img src="/ebird.png" className="h-[18px] -mt-[1px] -mr-1.5 inline-block" alt="eBird" />
        </Menu.Button>
        <Menu.Items className="absolute left-0 top-8 rounded bg-white shadow-lg px-4 py-2 w-[170px] ring-1 ring-black ring-opacity-5 flex flex-col gap-1 z-10">
          <Menu.Item>
            <a href={`${base}/region/${ebirdCode}`} target="_blank" rel="noreferrer">
              Overview
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={`${base}/region/${ebirdCode}/hotspots?yr=all&m=`} target="_blank" rel="noreferrer">
              Hotspots
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={`${base}/region/${ebirdCode}/activity?yr=all&m=`} target="_blank" rel="noreferrer">
              Recent Visits
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={`${base}/region/${ebirdCode}/media?yr=all&m=`} target="_blank" rel="noreferrer">
              Illustrated Checklist
            </a>
          </Menu.Item>

          <Menu.Item>
            <h4 className="font-bold">Bar Charts</h4>
          </Menu.Item>
          <Menu.Item>
            <a href={getUrl(1, 12)} target="_blank" rel="noreferrer">
              Entire Year
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={getUrl(3, 5)} target="_blank" rel="noreferrer">
              Spring
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={getUrl(6, 7)} target="_blank" rel="noreferrer">
              Summer
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={getUrl(8, 11)} target="_blank" rel="noreferrer">
              Fall
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={getUrl(12, 2)} target="_blank" rel="noreferrer">
              Winter
            </a>
          </Menu.Item>
          <Menu.Item>
            <h4 className="font-bold">Top eBirders</h4>
          </Menu.Item>
          <Menu.Item>
            <a
              href={`${base}/top100?locInfo.regionCode=${ebirdCode}&year=AAAA&locInfo.regionType=subnational2`}
              target="_blank"
              rel="noreferrer"
            >
              All Time
            </a>
          </Menu.Item>
          <Menu.Item>
            <a
              href={`${base}/top100?year=${new Date().getFullYear()}&locInfo.regionType=subnational2&locInfo.regionCode=${ebirdCode}`}
              target="_blank"
              rel="noreferrer"
            >
              Current Year
            </a>
          </Menu.Item>
          <Menu.Item>
            <h4 className="font-bold">My eBird</h4>
          </Menu.Item>
          <Menu.Item>
            <a
              href={`${base}/MyEBird?cmd=lifeList&listType=${ebirdCode}&listCategory=allCounties&time=life`}
              target="_blank"
              rel="noreferrer"
            >
              Life List
            </a>
          </Menu.Item>
          <Menu.Item>
            <a
              href={`${base}/MyEBird?cmd=lifeList&listType=${ebirdCode}&listCategory=allCounties&time=year`}
              target="_blank"
              rel="noreferrer"
            >
              Year List
            </a>
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </div>
  );
}
