import React from "react";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import Head from "next/head";
import { getHotspotByLocationId } from "lib/mongo";
import AboutSection from "components/AboutSection";
import { getRegion } from "lib/localData";
import { Region, Marker, Hotspot as HotspotType, Image, Link as LinkType, Group, Citation } from "lib/types";
import EditorActions from "components/EditorActions";
import PageHeading from "components/PageHeading";
import DeleteBtn from "components/DeleteBtn";
import Title from "components/Title";
import MapList from "components/MapList";
import Feather from "icons/Feather";
import Directions from "icons/Directions";
import { formatMarker, canEdit as checkCanEdit } from "lib/helpers";
import MapBox from "components/MapBox";
import NearbyHotspots from "components/NearbyHotspots";
import FeaturedImage from "components/FeaturedImage";
import { useUser } from "providers/user";
import { CameraIcon, PencilSquareIcon, MapIcon } from "@heroicons/react/24/outline";
import EbirdHotspotBtn from "components/EbirdHotspotBtn";
import Citations from "components/Citations";
import Features from "components/Features";
import ExternalLinkButton from "components/ExternalLinkButton";
import useLogPageview from "hooks/useLogPageview";
import { useModal } from "providers/modals";
import { useReloadProps } from "hooks/useReloadProps";
import dayjs from "dayjs";
import { isbot } from "isbot";
import useHotspotImages from "hooks/useHotspotImages";
import { ENABLE_LEGACY_UPLOADS } from "lib/config";

type Props = HotspotType & {
  region: Region;
  marker: Marker;
  isBot: boolean;
};

export default function Hotspot({
  region,
  name,
  _id,
  lat,
  lng,
  zoom,
  address,
  links,
  citations,
  plan,
  birding,
  about,
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
  stateCode,
  countyCode,
  needsDeleting,
  species,
  groups,
  noContent,
  featuredImg,
  updatedAt,
  isBot,
}: Props) {
  const { user } = useUser();
  useLogPageview({ locationId, stateCode, countyCode, countryCode, entity: "hotspot", isBot });
  const { open } = useModal();
  const reload = useReloadProps();

  const { images: combinedPhotos, isFetching: isLoadingImages } = useHotspotImages({
    locationId,
    featuredImg,
  });

  let extraLinks = [];

  if (iba) {
    extraLinks.push({
      label: `${iba.label} Important Bird Area`,
      url: `/iba/${iba.value}`,
    });
  }
  drives?.forEach((drive) => {
    extraLinks.push({
      label: drive.name,
      url: `/drive/${drive.locationId}`,
    });
  });

  const groupMaps: Image[] = [];
  groups?.forEach(({ images }) => {
    if (!images) return;
    const filtered = images.filter((it) => !it.hideFromChildren);
    groupMaps.push(...filtered);
  });

  const mapImages = [...(images?.filter((item) => item.smUrl && item.isMap) || []), ...groupMaps];

  const canEdit = checkCanEdit({ uid: "", role: user?.role, regions: user?.regions }, region.code);

  return (
    <div className="container pb-16">
      <Title>{`${name} - ${region.detailedName}`}</Title>
      {featuredImg && (
        <Head>
          <meta property="og:image" content={featuredImg.smUrl} />
        </Head>
      )}
      <PageHeading region={region}>{name}</PageHeading>
      {combinedPhotos?.length > 0 && (
        <FeaturedImage
          key={`${locationId}-${isLoadingImages}`}
          photos={combinedPhotos}
          isLoading={isLoadingImages}
          locationId={locationId}
        />
      )}
      <EditorActions className={`${combinedPhotos?.length > 0 ? "-mt-2" : "-mt-12"} font-medium`} allowPublic>
        {canEdit && (
          <Link href={`/edit/${locationId}`} className="flex gap-1">
            <PencilSquareIcon className="h-4 w-4" />
            Edit Hotspot
          </Link>
        )}
        {!isBot && ENABLE_LEGACY_UPLOADS && (
          <Link href={`/hotspot/upload/${locationId}`} className="flex gap-1">
            <CameraIcon className="h-4 w-4" />
            Upload Photos
          </Link>
        )}
        {!isBot && !ENABLE_LEGACY_UPLOADS && (
          <button onClick={() => open("uploadMessage", { locationId })} className="text-[#4a84b2] flex gap-1">
            <CameraIcon className="h-4 w-4" />
            Upload Photos
          </button>
        )}
        {!isBot && (
          <Link href={`/hotspot/suggest/${locationId}`} className="flex gap-1">
            <PencilSquareIcon className="h-4 w-4" />
            Suggest Content
          </Link>
        )}
        {canEdit && !featuredImg && ENABLE_LEGACY_UPLOADS && (
          <button
            type="button"
            onClick={() => open("addStreetView", { locationId, onSuccess: reload })}
            className="flex gap-1 text-primary"
          >
            <MapIcon className="h-4 w-4" />
            Add Google Street View
          </button>
        )}
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
              {!!species && (
                <ExternalLinkButton href={`https://ebird.org/hotspot/${locationId}/bird-list`}>
                  <Feather className="mr-1 -mt-[3px] text-[#92ad39]" /> {species} species
                </ExternalLinkButton>
              )}
              {lat && lng && (
                <ExternalLinkButton href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}>
                  <Directions className="mr-1 -mt-[3px] text-[#c2410d]" />{" "}
                  <span className="hidden sm:inline">Get Directions</span>
                  <span className="inline sm:hidden">Directions</span>
                </ExternalLinkButton>
              )}
              <EbirdHotspotBtn locationId={locationId} />
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

          {plan && <AboutSection heading="Plan Your Visit" text={plan} />}

          {birding && <AboutSection heading="How to Bird Here" text={birding} />}

          {noContent && (
            <div className="mb-6 formatted">
              <h3 className="font-bold text-lg mb-1.5">About this Place</h3>
              {isBot ? (
                <div className="p-4 bg-gray-100 rounded-lg mb-6">
                  This location has no content yet. If you are familiar with birding this location, please help other
                  birders with a description, tips for birding, or photos.
                </div>
              ) : (
                <div className="p-4 bg-gray-100 rounded-lg mb-6">
                  If you are familiar with birding this location, please help other birders with a description, tips for
                  birding, or photos - <Link href={`/hotspot/suggest/${locationId}`}>suggest content</Link> -{" "}
                  {ENABLE_LEGACY_UPLOADS ? (
                    <Link href={`/hotspot/upload/${locationId}`}>upload photos</Link>
                  ) : (
                    <button onClick={() => open("uploadMessage", { locationId })} className="text-[#4a84b2]">
                      upload photos
                    </button>
                  )}
                  .
                </div>
              )}
            </div>
          )}

          {about && <AboutSection heading="About this Place" text={about} />}

          {groups?.map(({ name, about, locationId }) => (
            <div className="mb-6 formatted" key={locationId}>
              <h3 className="font-bold text-lg">About {name}</h3>
              <p className="mb-1.5">
                See all hotspots at <Link href={`/group/${locationId}`}>{name}</Link>
              </p>
              <div dangerouslySetInnerHTML={{ __html: about || "" }} />
            </div>
          ))}

          <Features {...{ fee, accessible, roadside, restrooms }} />

          <Citations citations={citations} links={links} />

          {updatedAt && <p className="my-6 text-xs">Last updated {dayjs(updatedAt).format("MMMM D, YYYY")}</p>}
        </div>
        <div>
          {lat && lng && marker && !isBot && <MapBox key={_id} markers={[marker]} zoom={zoom} lgMarkers />}
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

export const getServerSideProps: GetServerSideProps = async ({ query, req }) => {
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

  const links: LinkType[] = [
    { url: data.webpage || "", label: "Official Website", cite: data.citeWebpage },
    { url: data.trailMap || "", label: "Trail Map", cite: false },
    ...(data.links || []),
  ].filter((it) => it.url);

  const region = getRegion(data.countyCode || data.stateCode || data.countryCode);
  if (!region) return { notFound: true };

  const marker = formatMarker(data);

  const groupLinks: LinkType[] = [];
  const uniqueCitations: Citation[] = [...(data.citations || [])];

  data?.groups?.forEach(({ name, links, webpage, citeWebpage, trailMap, citations }: Group) => {
    if (webpage)
      groupLinks?.push({
        url: webpage,
        label: `${name} Official Website`,
        cite: citeWebpage,
      });
    if (trailMap)
      groupLinks?.push({
        url: trailMap,
        label: `${name} Trail Map`,
        cite: false,
      });
    if (links) groupLinks.push(...links);
    if (citations) {
      citations.forEach((citation) => {
        if (!uniqueCitations.some((uniqueCitation) => uniqueCitation.label === citation.label)) {
          uniqueCitations.push(citation);
        }
      });
    }
  });

  const isBot = isbot(req.headers["user-agent"] || "");

  return {
    props: JSON.parse(
      JSON.stringify({
        region,
        marker,
        ...data,
        citations: uniqueCitations,
        links: [...(links || []), ...groupLinks],
        isBot,
      })
    ),
  };
};
