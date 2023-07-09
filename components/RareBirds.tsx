import Heading from "components/Heading";
import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { NotableReport } from "lib/types";
import Timeago from "components/Timeago";
import NotableObservationList from "components/NotableObservationList";
import { useInView } from "react-intersection-observer";

type Report = {
  name: string;
  code: string;
  reports: NotableReport[];
  isExpanded?: boolean;
};

type EbirdReport = {
  speciesCode: string;
  comName: string;
  sciName: string;
  locId: string;
  locName: string;
  obsDt: string;
  howMany: number;
  lat: number;
  lng: number;
  obsValid: boolean;
  obsReviewed: boolean;
  locationPrivate: boolean;
  subId: string;
  subnational2Code: string;
  subnational2Name: string;
  subnational1Code: string;
  subnational1Name: string;
  countryCode: string;
  countryName: string;
  userDisplayName: string;
  obsId: string;
  checklistId: string;
  presenceNoted: boolean;
  hasComments: boolean;
  firstName: string;
  lastName: string;
  hasRichMedia: boolean;
};

type Props = {
  region: string;
  className?: string;
};

export default function RareBirds({ region, className }: Props) {
  const [viewAll, setViewAll] = React.useState(false);
  const [notable, setNotable] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [lastUpdate, setLastUpdate] = React.useState<Dayjs | null>();

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const back = region.split("-").length <= 2 && region.startsWith("US-") ? 3 : 7;

  const call = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.ebird.org/v2/data/obs/${region}/recent/notable?detail=full&back=${back}`,
        {
          headers: {
            "X-eBirdApiToken": process.env.NEXT_PUBLIC_EBIRD_API || "",
          },
        }
      );
      let reports: EbirdReport[] = await response.json();

      if (!reports?.length) {
        return;
      }

      reports = reports
        //Remove duplicates. For unknown reasons, eBird sometimes returns duplicates
        .filter((value, index, array) => array.findIndex((searchItem) => searchItem.obsId === value.obsId) === index)
        .filter(({ comName }) => !comName.includes("(hybrid)"));

      const reportsBySpecies: any = {};

      reports.forEach((item) => {
        if (!reportsBySpecies[item.speciesCode]) {
          reportsBySpecies[item.speciesCode] = {
            name: item.comName,
            code: item.speciesCode,
            reports: [],
          };
        }
        reportsBySpecies[item.speciesCode].reports.push({
          id: item.obsId,
          location: item.locName,
          date: item.obsDt,
          checklistId: item.subId,
          lat: item.lat,
          lng: item.lng,
          hasRichMedia: item.hasRichMedia,
          countyName: item.subnational2Name,
          userDisplayName: item.userDisplayName,
          approved: item.obsValid,
        });
      });

      const species = Object.entries(reportsBySpecies).map(([key, value]) => value);

      setNotable(species as Report[]);
      setLastUpdate(dayjs());
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [region]);

  React.useEffect(() => {
    if (inView) call();
  }, [call, inView]);

  const handleOpen = (code: string) => {
    setNotable((items) =>
      items.map((item) => {
        if (item.code === code) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        return item;
      })
    );
  };

  const filtered = viewAll ? notable : notable.slice(0, 5);
  const showViewAll = !viewAll && notable.length > 5;

  return (
    <div className={`${className || ""}`} ref={ref}>
      <Heading className="text-lg font-bold mb-6" color="turquoise" id="notable">
        Notable Sightings <br />
        <span className="text-sm text-gray-100 mb-3">Birds reported to eBird in the last {back} days</span>
      </Heading>
      <div>
        {filtered?.map(({ name, code, reports, isExpanded }) => {
          const date = reports[0]?.date;
          return (
            <article key={code} className="mb-3 border border-gray-200 bg-white shadow-sm rounded-md w-full">
              <header className="xs:flex px-3 py-2">
                <div className="flex flex-col">
                  <h4 className="font-bold">{name}</h4>
                  <button
                    type="button"
                    className="whitespace-nowrap text-left text-sky-700 block text-[13px]"
                    onClick={() => handleOpen(code)}
                  >
                    {isExpanded ? "Hide" : "Show"}&nbsp;
                    {reports.length} {reports.length === 1 ? "Report" : "Reports"}
                  </button>
                </div>
                <div className="whitespace-nowrap ml-auto">
                  <span className="bg-gray-200/75 text-gray-600 rounded-full px-2 py-[3px] text-[11px] whitespace-nowrap font-medium">
                    {dayjs(date).format("MMM D [at] h:mm a ")}
                  </span>
                </div>
              </header>
              {isExpanded && (
                <ul className="pl-4 pr-4 pb-4 flex flex-col gap-4">
                  <NotableObservationList items={reports} />
                </ul>
              )}
            </article>
          );
        })}
      </div>
      {!lastUpdate && loading && <p className="text-gra-700">Loading...</p>}
      {!loading && notable.length === 0 && <p className="text-gra-700">No notable reports in the last 7 days.</p>}
      <div className="flex items-center">
        {showViewAll && (
          <button
            type="button"
            className="whitespace-nowrap text-left text-sky-700 block font-bold"
            onClick={() => setViewAll(true)}
          >
            View All Reports
          </button>
        )}
        {lastUpdate && (
          <span className="text-xs text-gray-500 ml-auto">
            Updated <Timeago datetime={lastUpdate.toString()} />
            &nbsp;-&nbsp;
            <button type="button" className="text-blue-900" onClick={call}>
              {loading ? "loading..." : "Reload"}
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
