import React from "react";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import Head from "next/head";
import { getHotspotByLocationId } from "lib/sqlite";
import AboutSection from "components/AboutSection";
import { Region, Marker, Hotspot as HotspotType, Image, Link as LinkType, Group, Citation } from "lib/types";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import MapList from "components/MapList";
import Feather from "icons/Feather";
import Directions from "icons/Directions";
import MapKit from "components/MapKit";
import HotspotGrid from "components/HotspotGrid";
import FeaturedImage from "components/FeaturedImage";
import EbirdHotspotBtn from "components/EbirdHotspotBtn";
import PublicAnnouncement from "components/PublicAnnouncement";
import Citations from "components/Citations";
import Features from "components/Features";
import ExternalLinkButton from "components/ExternalLinkButton";
import dayjs from "dayjs";
import { isbot } from "isbot";

type Props = HotspotType & {
  region: Region;
  marker: Marker;
  combinedImages: Image[];
  nearby: any[];
  isBot: boolean;
};

export default function Hotspot({
  region,
  name,
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
  combinedImages,
  nearby,
  isBot,
}: Props) {

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

  return (
    <div className="container pb-16">
      <Title>{`${name} - ${region.detailedName}`}</Title>
      {featuredImg && (
        <Head>
          <meta property="og:image" content={featuredImg.smUrl} />
        </Head>
      )}
      <PageHeading region={region}>{name}</PageHeading>
      {combinedImages?.length > 0 && (
        <FeaturedImage
          key={locationId}
          photos={combinedImages}
          isLoading={false}
          locationId={locationId}
        />
      )}
      <PublicAnnouncement ebirdHref={`https://ebird.org/hotspot/${locationId}`} />
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
              <div className="p-4 bg-gray-100 rounded-lg mb-6">This location has no content yet.</div>
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
          {lat && lng && marker && !isBot && <MapKit key={locationId} markers={[marker]} zoom={zoom} lgMarkers />}
          {!!mapImages?.length && <MapList images={mapImages} />}
          {nearby?.length > 0 && (
            <div className="mt-12">
              <h3 className="mb-4 font-bold text-lg">Nearby Hotspots</h3>
              <div className="grid xs:grid-cols-2 gap-6">
                <HotspotGrid hotspots={nearby} loading={false} lat={lat} lng={lng} />
              </div>
            </div>
          )}
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

  const data = getHotspotByLocationId(locationId);
  if (!data) return { notFound: true };

  const isBot = isbot(req.headers["user-agent"] || "");

  return {
    props: {
      ...data,
      isBot,
    },
  };
};
