import { Menu } from "@headlessui/react";
import EbirdLogo from "components/EbirdLogo";

type Props = {
  code: string;
};

export default function EbirdRegionBtn({ code }: Props) {
  const getUrl = (bMonth: number, eMonth: number) => {
    return `https://ebird.org/barchart?yr=all&bmo=${bMonth}&emo=${eMonth}&r=${code}`;
  };

  return (
    <div className="relative inline-block">
      <Menu>
        <Menu.Button className="text-[13px] rounded text-gray-600 bg-gray-100 px-2 inline-flex items-center gap-1 font-medium whitespace-nowrap">
          <EbirdLogo className="w-8" /> Links
        </Menu.Button>
        <Menu.Items className="absolute sm:left-0 right-0 sm:right-[unset] top-8 rounded bg-white shadow-lg px-4 py-2 w-[170px] ring-1 ring-black ring-opacity-5 flex flex-col gap-1 z-10">
          <Menu.Item>
            <h4 className="font-bold">Explore in eBird</h4>
          </Menu.Item>
          <Menu.Item>
            <a href={`https://ebird.org/region/${code}/hotspots?yr=all&m=`} target="_blank" rel="noreferrer">
              Hotspots
            </a>
          </Menu.Item>
          <Menu.Item>
            <a href={`https://ebird.org/region/${code}/ebirders?yr=all`} target="_blank" rel="noreferrer">
              Recent Visits
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
            <a href={`https://ebird.org/top100?locInfo.regionCode=${code}&year=AAAA`} target="_blank" rel="noreferrer">
              All Time
            </a>
          </Menu.Item>
          <Menu.Item>
            <a
              href={`https://ebird.org/top100?year=${new Date().getFullYear()}&locInfo.regionCode=${code}`}
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
              href={`https://ebird.org/MyEBird?cmd=lifeList&listType=${code}&listCategory=allCounties&time=life`}
              target="_blank"
              rel="noreferrer"
            >
              Life List
            </a>
          </Menu.Item>
          <Menu.Item>
            <a
              href={`https://ebird.org/MyEBird?cmd=lifeList&listType=${code}&listCategory=allCounties&time=year`}
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
