import * as React from "react";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import { getGroupByLocationId } from "lib/mongo";
import AboutSection from "components/AboutSection";
import { getCountyByCode, getStateByCode } from "lib/localData";
import { County, State, Marker, Group as GroupType } from "lib/types";
import EditorActions from "components/EditorActions";
import PageHeading from "components/PageHeading";
import DeleteBtn from "components/DeleteBtn";
import Title from "components/Title";
import MapList from "components/MapList";
import { restroomOptions, formatMarkerArray } from "lib/helpers";
import MapBox from "components/MapBox";
import { useUser } from "providers/user";
import EbirdHotspotBtn from "components/EbirdHotspotBtn";
import HotspotGrid from "components/HotspotGrid";

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
  about,
  tips,
  birds,
  hikes,
  restrooms,
  locationId,
  maps,
  markers,
  hotspots,
}: Props) {
  const { user } = useUser();
  const canEdit = user?.role === "admin" || stateCodes.filter((it) => user?.regions?.includes(it)).length > 0;
  let title = name;
  if (state && county) {
    title = `${name} - ${county.name}, ${state.label}`;
  } else if (state) {
    title = `${name} - ${state.label}`;
  }
  const locationIds = hotspots.map((it) => it.locationId);

  return (
    <div className="container pb-16">
      <Title>{title}</Title>
      <PageHeading countrySlug={countryCode.toLowerCase()} state={state} county={county}>
        {name}
      </PageHeading>
      <EditorActions className="font-medium">
        {canEdit && <Link href={`/edit/group/${locationId}`}>Edit Group</Link>}
        {canEdit && (
          <DeleteBtn url={`/api/group/delete?id=${_id}`} entity="group" className="ml-auto">
            Delete Group
          </DeleteBtn>
        )}
      </EditorActions>
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
        </div>
        <div>
          {lat && lng && markers.length > 0 && <MapBox key={_id} markers={markers} lat={lat} lng={lng} zoom={zoom} />}
          {!!maps?.length && <MapList images={maps} />}
        </div>
      </div>
      <h3 className="text-lg mb-2 mt-8 font-bold">Hotspots</h3>
      <div className="grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <HotspotGrid hotspots={hotspots} loading={false} smallTitle />
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

  const markers = formatMarkerArray(data?.hotspots);
  console.log(data.stateCodes);

  return {
    props: {
      state,
      county,
      markers,
      ...data,
    },
  };
};
