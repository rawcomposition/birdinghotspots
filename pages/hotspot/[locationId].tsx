import * as React from "react";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import EbirdHotspotSummary from "components/EbirdHotspotSummary";
import EbirdBarcharts from "components/EbirdBarcharts";
import Link from "next/link";
import { getHotspotByLocationId, getChildHotspots } from "lib/mongo";
import AboutSection from "components/AboutSection";
import { getCountyByCode, getStateByCode } from "lib/localData";
import { County, State, HotspotsByCounty, Marker, Hotspot as HotspotType } from "lib/types";
import EditorActions from "components/EditorActions";
import HotspotList from "components/HotspotList";
import ListHotspotsByCounty from "components/ListHotspotsByCounty";
import PageHeading from "components/PageHeading";
import DeleteBtn from "components/DeleteBtn";
import Title from "components/Title";
import MapList from "components/MapList";
import Feather from "icons/Feather";
import Directions from "icons/Directions";
import {
  accessibleOptions,
  restroomOptions,
  formatMarkerArray,
  restructureHotspotsByCounty,
  stripHotspotSuffix,
} from "lib/helpers";
import MapBox from "components/MapBox";
import NearbyHotspots from "components/NearbyHotspots";
import FeaturedImage from "components/FeaturedImage";
import { useUser } from "providers/user";
import { CameraIcon } from "@heroicons/react/24/outline";

interface Props extends HotspotType {
  county: County;
  state: State;
  childLocations: HotspotType[];
  childLocationsByCounty: HotspotsByCounty;
  locationIds: string[];
  countySlugs: string[];
  markers: Marker[];
}

export default function Hotspot({
  state,
  county,
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
  roadside,
  accessible,
  locationId,
  parent,
  childLocations,
  childLocationsByCounty,
  locationIds,
  slug,
  iba,
  drives,
  images,
  isGroup,
  markers,
  countryCode,
  needsDeleting,
  species,
}: Props) {
  const { user } = useUser();
  const countrySlug = countryCode?.toLowerCase();
  let extraLinks = [];
  if (roadside === "Yes") {
    extraLinks.push({
      label: "Roadside Birding",
      url: `/${countrySlug}/${state.slug}/roadside-birding`,
    });
  }
  if (parent) {
    extraLinks.push({
      label: parent.name,
      url: parent.url,
    });
  }
  if (iba) {
    extraLinks.push({
      label: `${iba.label} Important Bird Area`,
      url: `/${countrySlug}/${state.slug}/important-bird-areas/${iba.value}`,
    });
  }
  drives?.forEach((drive) => {
    extraLinks.push({
      label: drive.name,
      url: `/${countrySlug}/${state.slug}/drive/${drive.slug}`,
    });
  });

  const photos = images?.filter((it) => !it.isMap) || [];
  const mapImages = images?.filter((item) => item.smUrl && item.isMap) || [];

  const canEdit = user?.role === "admin" || user?.regions?.includes(state.code);

  return (
    <div className="container pb-16">
      <Title>{`${name} - ${state.label}, ${state.country}`}</Title>
      <PageHeading countrySlug={countryCode.toLowerCase()} state={state} county={county}>
        {name}
      </PageHeading>
      {photos?.length > 0 && <FeaturedImage key={locationId} photos={photos} />}
      <EditorActions className={`${photos?.length > 0 ? "-mt-2" : "-mt-12"} font-medium`} allowPublic>
        {canEdit && <Link href={isGroup ? `/edit/group/${_id}` : `/edit/${locationId}`}>Edit Hotspot</Link>}
        {canEdit && !isGroup && (
          <>
            {state.code === "US-OH" ? (
              <a
                href={`https://old.birding-in-ohio.com/${county.slug}-county/${slug}`}
                target="_blank"
                rel="noreferrer"
              >
                Old Website
              </a>
            ) : (
              <a
                href={`https://ebirdhotspots.com/birding-in-${state.slug}/${state.code
                  .replace("-", "")
                  .toLowerCase()}-${county.slug}-county/${state.code.replace("-", "").toLowerCase()}-${slug}`}
                target="_blank"
                rel="noreferrer"
              >
                Old Website
              </a>
            )}
          </>
        )}
        <Link href={`/hotspot/upload/${locationId}`}>
          <a className="flex gap-1">
            <CameraIcon className="h-4 w-4" />
            Upload Photos
          </a>
        </Link>
        {canEdit && (needsDeleting || isGroup) && (
          <DeleteBtn url={`/api/hotspot/delete?id=${_id}`} entity="hotspot" className="ml-auto">
            Delete Hotspot
          </DeleteBtn>
        )}
      </EditorActions>
      {user && needsDeleting && (
        <div className="border border-red-700 text-red-700 px-4 py-2 rounded relative mb-6">
          This hotspot has been removed from eBird and should be deleted.
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="mb-6">
            <h3 className="font-bold text-lg">{name}</h3>
            {species && (
              <a
                href={`https://ebird.org/hotspot/${locationId}`}
                className="text-[12px] rounded text-gray-500 bg-gray-100 px-2 mr-2 inline-block my-2 font-medium"
                target="_blank"
                rel="noreferrer"
              >
                <Feather className="mr-1 -mt-[3px] text-[#92ad39]" /> {species} species
              </a>
            )}
            {lat && lng && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                className="text-[12px] rounded text-gray-500 bg-gray-100 px-2 inline-block my-2 font-medium"
                target="_blank"
                rel="noreferrer"
              >
                <Directions className="mr-1 -mt-[3px] text-[#c2410d]" /> Get Directions
              </a>
            )}
            {address && <p className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: address }} />}
            {links?.map(({ url, label }, index) => (
              <React.Fragment key={label}>
                <a key={index} href={url} target="_blank" rel="noreferrer">
                  {label}
                </a>
                <br />
              </React.Fragment>
            ))}
            {extraLinks.length > 0 && (
              <p className="mt-4">
                Also, see:
                <br />
                {extraLinks?.map(({ url, label }) => (
                  <React.Fragment key={label}>
                    <Link href={url}>{label}</Link>
                    <br />
                  </React.Fragment>
                ))}
              </p>
            )}
          </div>
          {isGroup ? (
            <EbirdBarcharts portal={state.portal} region={locationIds.join(",")} />
          ) : (
            <EbirdHotspotSummary {...{ state, county, name, locationId, locationIds, lat, lng }} />
          )}

          {childLocations.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-1.5 font-bold text-lg">Locations</h3>
              <HotspotList hotspots={childLocations} />
            </div>
          )}

          {childLocationsByCounty.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-1.5 font-bold text-lg">Locations</h3>
              <ListHotspotsByCounty
                countrySlug={countryCode.toLowerCase()}
                stateSlug={state.slug}
                hotspots={childLocationsByCounty}
              />
            </div>
          )}

          {tips && <AboutSection heading="Tips for Birding" text={tips} />}

          {birds && <AboutSection heading="Birds of Interest" text={birds} />}

          {about && <AboutSection heading="About this Location" text={about} />}

          {hikes && <AboutSection heading="Notable Trails" text={hikes} />}

          {parent?.about && parent?.name && (
            <AboutSection heading={`About ${stripHotspotSuffix(parent.name)}`} text={parent.about} />
          )}

          <div className="space-y-1">
            {restrooms !== null && <p>{restroomOptions.find((it) => it.value === restrooms)?.label}</p>}
            {accessible?.map((option) => (
              <p key={option}>{accessibleOptions.find((it) => it.value === option)?.label}</p>
            ))}
            {roadside === "Yes" && <p>Roadside accessible.</p>}
          </div>
        </div>
        <div>
          {lat && lng && markers.length > 0 && <MapBox key={_id} markers={markers} lat={lat} lng={lng} zoom={zoom} />}
          {!!images?.length && <MapList images={mapImages} />}
          {lat && lng && !isGroup && (
            <NearbyHotspots lat={lat} lng={lng} limit={4} exclude={[locationId, ...locationIds]} />
          )}
        </div>
      </div>
    </div>
  );
}

const getChildren = async (id: string) => {
  if (!id) return null;
  const data = await getChildHotspots(id);
  return data || [];
};

interface Params extends ParsedUrlQuery {
  locationId: string;
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { locationId } = query as Params;

  const data = await getHotspotByLocationId(locationId, true);
  if (!data) return { notFound: true };

  const state = getStateByCode(data.stateCode);
  if (!state) return { notFound: true };

  const county = getCountyByCode(data.countyCode);

  const childLocations = await getChildren(data._id);
  const childLocationsByCounty = data?.isGroup ? restructureHotspotsByCounty(childLocations as any) : [];
  const childIds = childLocations?.map((item: HotspotType) => item.locationId) || [];
  let locationIds = childIds?.length > 0 ? childIds : [];
  if (!data?.isGroup) {
    locationIds = [data?.locationId, ...locationIds];
  }

  const markers = formatMarkerArray(data, childLocations);

  const countySlugs =
    data.multiCounties?.map((item: string) => {
      const county = getCountyByCode(item);
      return county?.slug;
    }) || [];

  return {
    props: {
      state,
      county,
      childLocations: data?.isGroup ? [] : childLocations,
      childLocationsByCounty,
      locationIds,
      markers,
      countySlugs,
      ...data,
    },
  };
};
