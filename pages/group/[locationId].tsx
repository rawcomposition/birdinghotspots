import * as React from "react";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import { getGroupByLocationId } from "lib/mongo";
import AboutSection from "components/AboutSection";
import { getCountyByCode, getStateByCode, getLocationText } from "lib/localData";
import { County, State, Marker, Group as GroupType } from "lib/types";
import EditorActions from "components/EditorActions";
import PageHeading from "components/PageHeading";
import DeleteBtn from "components/DeleteBtn";
import Title from "components/Title";
import MapList from "components/MapList";
import { restroomOptions, formatMarker, getShortName } from "lib/helpers";
import MapBox from "components/MapBox";
import { useUser } from "providers/user";
import EbirdHotspotBtn from "components/EbirdHotspotBtn";
import HotspotGrid from "components/HotspotGrid";
import Citations from "components/Citations";

interface Props extends GroupType {
  county?: County;
  state?: State;
  locationIds: string[];
  markers: Marker[];
}

export default function Group({
  state,
  county,
  stateCodes,
  countryCode,
  name,
  _id,
  lat,
  lng,
  zoom,
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
}: Props) {
  const [showMore, setShowMore] = React.useState(false);
  const { user } = useUser();
  const canEdit = user?.role === "admin" || stateCodes.filter((it) => user?.regions?.includes(it)).length > 0;
  let title = name;
  if (state && county) {
    title = `${name} - ${county.name}, ${state.label}`;
  } else if (state) {
    title = `${name} - ${state.label}`;
  }
  const locationIds = hotspots.map((it) => it.locationId);
  hotspots.sort((a, b) => (a.species || 0) - (b.species || 0)).reverse();

  const filteredHotspots = showMore ? hotspots : hotspots.slice(0, 12);
  const moreCount = hotspots.length - 12;

  return (
    <div className="container pb-16">
      <Title>{title}</Title>
      <PageHeading countrySlug={countryCode.toLowerCase()} state={state} county={county}>
        {name}
      </PageHeading>
      <EditorActions className="font-medium -mt-10">
        {canEdit && <Link href={`/edit/group/${locationId}`}>Edit Group</Link>}
        {canEdit && (
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
          <button
            type="button"
            onClick={() => setShowMore(true)}
            className="text-[#4a84b2] font-bold block mx-auto mt-2"
          >
            View {moreCount} more {moreCount === 1 ? "hotspot" : "hotspots"}
          </button>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="mb-6">
            <h3 className="font-bold text-lg">{name}</h3>
            <div className="flex gap-2 mt-2 mb-4">
              <EbirdHotspotBtn {...{ state, locationId, locationIds }} isGroup />
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

          <div className="space-y-1">
            {restrooms !== null && <p>{restroomOptions.find((it) => it.value === restrooms)?.label}</p>}
          </div>

          <Citations citations={citations} links={links} />
        </div>
        <div>
          {lat && lng && markers.length > 0 && <MapBox key={_id} markers={markers} lat={lat} lng={lng} zoom={zoom} />}
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

  const state = data.stateCodes.length === 1 ? getStateByCode(data.stateCodes[0]) : null;
  const county = data.countyCodes.length === 1 ? getCountyByCode(data.countyCodes[0]) : null;

  const markers = data?.hotspots?.map((it) => formatMarker(it, true)) || [];

  const hotspots = data?.hotspots?.map((it) => ({
    ...it,
    locationLine: it.countyCode
      ? getLocationText(it.countyCode, !!state, true)
      : `${getStateByCode(it.stateCode)?.label}`,
    name: getShortName(it.name),
  }));

  return {
    props: {
      state,
      county,
      markers,
      ...data,
      hotspots,
    },
  };
};
