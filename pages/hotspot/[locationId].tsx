import * as React from "react";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import { getHotspotByLocationId } from "lib/mongo";
import AboutSection from "components/AboutSection";
import { getCountyByCode, getStateByCode } from "lib/localData";
import { County, State, Marker, Hotspot as HotspotType, Image, Link as LinkType, Group, Citation } from "lib/types";
import EditorActions from "components/EditorActions";
import PageHeading from "components/PageHeading";
import DeleteBtn from "components/DeleteBtn";
import Title from "components/Title";
import MapList from "components/MapList";
import Feather from "icons/Feather";
import Directions from "icons/Directions";
import { formatMarker } from "lib/helpers";
import MapBox from "components/MapBox";
import NearbyHotspots from "components/NearbyHotspots";
import FeaturedImage from "components/FeaturedImage";
import { useUser } from "providers/user";
import { CameraIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import EbirdHotspotBtn from "components/EbirdHotspotBtn";
import Citations from "components/Citations";

interface Props extends HotspotType {
  county: County;
  state: State;
  marker: Marker;
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
  citations,
  about,
  tips,
  birds,
  hikes,
  restrooms,
  roadside,
  accessible,
  fee,
  locationId,
  iba,
  drives,
  images,
  marker,
  countryCode,
  needsDeleting,
  species,
  groups,
  noContent,
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

  groups?.forEach((it) => {
    extraLinks.push({
      label: it.name,
      url: it.url,
    });
  });

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

  const photos = images?.filter((it) => !it.isMap && !it.hideFromChildren) || [];
  const groupMaps: Image[] = [];
  groups?.forEach(({ images }) => {
    if (!images) return;
    const filtered = images.filter((it) => !it.hideFromChildren);
    groupMaps.push(...filtered);
  });

  const mapImages = [...(images?.filter((item) => item.smUrl && item.isMap) || []), ...groupMaps];

  const canEdit = user?.role === "admin" || user?.regions?.includes(state.code);

  return (
    <div className="container pb-16">
      <Title>{`${name} - ${state.label}, ${state.country}`}</Title>
      <PageHeading countrySlug={countryCode.toLowerCase()} state={state} county={county}>
        {name}
      </PageHeading>
      {photos?.length > 0 && <FeaturedImage key={locationId} photos={photos} />}
      <EditorActions className={`${photos?.length > 0 ? "-mt-2" : "-mt-12"} font-medium`} allowPublic>
        {canEdit && <Link href={`/edit/${locationId}`}>Edit Hotspot</Link>}
        <Link href={`/hotspot/upload/${locationId}`}>
          <a className="flex gap-1">
            <CameraIcon className="h-4 w-4" />
            Upload Photos
          </a>
        </Link>
        <Link href={`/hotspot/suggest/${locationId}`}>
          <a className="flex gap-1">
            <PencilSquareIcon className="h-4 w-4" />
            Suggest Edit
          </a>
        </Link>
        {canEdit && needsDeleting && (
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
            <div className="flex gap-2 mt-2 mb-4 flex-wrap">
              {species && (
                <a
                  href={`https://ebird.org/hotspot/${locationId}`}
                  className="text-[13px] rounded text-gray-600 bg-gray-100 px-2 inline-block font-medium whitespace-nowrap"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Feather className="mr-1 -mt-[3px] text-[#92ad39]" /> {species} species
                </a>
              )}
              <EbirdHotspotBtn {...{ state, locationId }} />
              {lat && lng && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  className="text-[13px] rounded text-gray-600 bg-gray-100 px-2 inline-block font-medium whitespace-nowrap"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Directions className="mr-1 -mt-[3px] text-[#c2410d]" /> Get Directions
                </a>
              )}
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
            {extraLinks.length > 0 && (
              <p className="mt-4">
                Also, see all the hotspots at:
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

          {tips && <AboutSection heading="Tips for Birding" text={tips} />}

          {birds && <AboutSection heading="Birds of Interest" text={birds} />}

          {about && <AboutSection heading="About this Location" text={about} />}

          {groups?.map(({ _id, name, about }) => (
            <AboutSection key={_id} heading={`About ${name}`} text={about || ""} />
          ))}

          {hikes && <AboutSection heading="Notable Trails" text={hikes} />}

          {noContent && !groups?.length && !name.startsWith("stakeout ") && (
            <div className="mb-6 formatted">
              <h3 className="font-bold text-lg mb-1.5">About this location</h3>
              <div className="p-4 bg-gray-100 rounded-lg mb-6">
                If you are familiar with birding this location, please help other birders with a description, tips for
                birding, or photos - <Link href={`/hotspot/suggest/${locationId}`}>suggest content</Link> -{" "}
                <Link href={`/hotspot/upload/${locationId}`}>upload photos</Link>.
              </div>
            </div>
          )}

          {name.startsWith("stakeout ") && (
            <div className="p-4 bg-gray-100 rounded-lg mb-6">
              Stakeouts are a special kind of hotspot used for rare birds in certain situations. They are often created
              if a bird is consistently observed in a particular area that is not covered by an existing hotspot, and
              it&apos;s rare enough that many birders come to see it.
            </div>
          )}

          <div className="space-y-1">
            {accessible === "Yes" && <p>Accessible parking and trails.</p>}
            {roadside === "Yes" && <p>Roadside accessible.</p>}
            {restrooms === "Yes" && <p>Restrooms on site.</p>}
            {restrooms === "No" && <p>No restroom facilities.</p>}
            {fee === "Yes" && <p>Entrance fee may apply.</p>}
            {fee === "No" && <p>No entrance fee.</p>}
          </div>

          <Citations citations={citations} links={links} />
        </div>
        <div>
          {lat && lng && marker && <MapBox key={_id} markers={[marker]} lat={lat} lng={lng} zoom={zoom} />}
          {!!mapImages?.length && <MapList images={mapImages} />}
          {lat && lng && <NearbyHotspots lat={lat} lng={lng} limit={4} exclude={[locationId]} />}
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

  if (locationId.startsWith("G")) {
    return {
      redirect: {
        destination: `/group/${locationId}`,
        permanent: true,
      },
    };
  }

  const data = await getHotspotByLocationId(locationId, true);
  if (!data) return { notFound: true };

  const state = getStateByCode(data.stateCode);
  if (!state) return { notFound: true };

  const county = getCountyByCode(data.countyCode);
  const marker = formatMarker(data);

  const groupLinks: LinkType[] = [];
  data?.groups?.forEach(({ links }: Group) => {
    if (links) groupLinks.push(...links);
  });

  const groupCitations: Citation[] = [];
  data?.groups?.forEach(({ citations }: Group) => {
    if (citations) groupCitations.push(...citations);
  });

  return {
    props: {
      state,
      county,
      marker,
      ...data,
      citations: [...(data.citations || []), ...groupCitations],
      links: [...(data.links || []), ...groupLinks],
    },
  };
};
