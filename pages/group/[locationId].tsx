import * as React from "react";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import { getGroupByLocationId } from "lib/mongo";
import AboutSection from "components/AboutSection";
import { getRegion } from "lib/localData";
import { Region, Marker, Group as GroupType } from "lib/types";
import EditorActions from "components/EditorActions";
import PageHeading from "components/PageHeading";
import DeleteBtn from "components/DeleteBtn";
import Title from "components/Title";
import MapList from "components/MapList";
import { formatMarker, getShortName, canEdit } from "lib/helpers";
import MapBox from "components/MapBox";
import { useUser } from "providers/user";
import BarChartBtn from "components/BarChartBtn";
import HotspotGrid from "components/HotspotGrid";
import Citations from "components/Citations";
import Features from "components/Features";
import useLogPageview from "hooks/useLogPageview";
import dayjs from "dayjs";

interface Props extends GroupType {
  region: Region;
  locationIds: string[];
  markers: Marker[];
}

export default function Group({
  region,
  stateCodes,
  countyCodes,
  countryCode,
  name,
  _id,
  address,
  links,
  citations,
  about,
  tips,
  birds,
  hikes,
  restrooms,
  locationId,
  images,
  markers,
  hotspots,
  updatedAt,
}: Props) {
  const stateCode = (stateCodes || []).length === 1 ? stateCodes[0] : undefined;
  const countyCode = (countyCodes || []).length === 1 ? countyCodes[0] : undefined;
  useLogPageview({ locationId, stateCode, countyCode, countryCode, entity: "group" });
  const [showMore, setShowMore] = React.useState(false);
  const { user } = useUser();
  const canEditGroup =
    user?.role === "admin" ||
    stateCodes?.filter((it: string) => !!user?.regions?.some((region: string) => region.startsWith(it))).length > 0;

  const locationIds = hotspots.map((it) => it.locationId);
  hotspots.sort((a, b) => (a.species || 0) - (b.species || 0)).reverse();

  const filteredHotspots = showMore ? hotspots : hotspots.slice(0, 12);
  const moreCount = hotspots.length - 12;

  return (
    <div className="container pb-16">
      <Title>{name}</Title>
      <PageHeading region={region}>{name}</PageHeading>
      <EditorActions className="font-medium -mt-10">
        {canEditGroup && <Link href={`/edit/group/${locationId}`}>Edit Group</Link>}
        {canEditGroup && (
          <DeleteBtn url={`/api/group/delete?id=${_id}`} entity="group" className="ml-auto">
            Delete Group
          </DeleteBtn>
        )}
      </EditorActions>
      <div className="mb-12">
        <div className="grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <HotspotGrid hotspots={filteredHotspots} loading={false} />
        </div>
        {!showMore && hotspots.length > 12 && (
          <button type="button" onClick={() => setShowMore(true)} className="text-primary font-bold block mx-auto mt-2">
            View {moreCount} more {moreCount === 1 ? "hotspot" : "hotspots"}
          </button>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="mb-6">
            <h3 className="font-bold text-lg">{name}</h3>
            <div className="flex gap-2 mt-2 mb-4">
              <BarChartBtn locationIds={locationIds} locationId={locationId} portal={region?.portal} />
            </div>
            {address && <p className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: address }} />}
            {links?.map(({ url, label }, index) => (
              <React.Fragment key={label}>
                <a key={index} href={url} target="_blank" rel="noreferrer">
                  {label}
                </a>
                <br />
              </React.Fragment>
            ))}
          </div>

          {tips && <AboutSection heading="Tips for Birding" text={tips} />}

          {birds && <AboutSection heading="Birds of Interest" text={birds} />}

          {about && <AboutSection heading="About this Location" text={about} />}

          {hikes && <AboutSection heading="Notable Trails" text={hikes} />}

          <Features {...{ restrooms }} />

          <Citations citations={citations} links={links} />

          {updatedAt && <p className="my-6 text-xs">Last updated {dayjs(updatedAt).format("MMMM D, YYYY")}</p>}
        </div>
        <div>
          {markers.length > 0 && <MapBox key={_id} markers={markers} zoom={12} />}
          {!!images?.length && <MapList images={images} />}
        </div>
      </div>
    </div>
  );
}

interface Params extends ParsedUrlQuery {
  locationId: string;
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { locationId } = query as Params;

  const data = (await getGroupByLocationId(locationId)) as GroupType;
  if (!data?._id) return { notFound: true };

  const region = getRegion(
    data.countyCodes.length === 1
      ? data.countyCodes[0]
      : data.stateCodes.length === 1
      ? data.stateCodes[0]
      : data.countryCode
  );

  const markers = data?.hotspots?.map((it) => formatMarker(it, true)) || [];

  const hotspots = data?.hotspots?.map((it) => ({
    ...it,
    locationLine: getRegion(it.countyCode || it.stateCode || it.countryCode)?.detailedName || "",
    name: getShortName(it.name),
  }));

  return {
    props: {
      region,
      markers,
      ...data,
      hotspots,
    },
  };
};
