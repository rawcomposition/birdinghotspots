import React from "react";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import { getGroupByLocationId } from "lib/sqlite";
import AboutSection from "components/AboutSection";
import { Region, Marker, Group as GroupType, Link as LinkType } from "lib/types";
import EditorActions from "components/EditorActions";
import PageHeading from "components/PageHeading";
import DeleteBtn from "components/DeleteBtn";
import Title from "components/Title";
import MapList from "components/MapList";
import { canEdit as checkCanEdit } from "lib/helpers";
import MapKit from "components/MapKit";
import { useUser } from "providers/user";
import BarChartBtn from "components/BarChartBtn";
import HotspotGrid from "components/HotspotGrid";
import Citations from "components/Citations";
import Features from "components/Features";
import useLogPageview from "hooks/useLogPageview";
import dayjs from "dayjs";
import { isbot } from "isbot";

type Props = GroupType & {
  region: Region;
  locationIds: string[];
  markers: Marker[];
  isBot: boolean;
};

export default function Group({
  region,
  stateCodes,
  countyCodes,
  countryCode,
  name,
  address,
  links: additionalLinks,
  webpage,
  citeWebpage,
  trailMap,
  citations,
  plan,
  birding,
  about,
  restrooms,
  locationId,
  images,
  markers,
  hotspots,
  updatedAt,
  isBot,
}: Props) {
  const stateCode = (stateCodes || []).length === 1 ? stateCodes[0] : undefined;
  const countyCode = (countyCodes || []).length === 1 ? countyCodes[0] : undefined;
  useLogPageview({ locationId, stateCode, countyCode, countryCode, entity: "group", isBot });
  const [showMore, setShowMore] = React.useState(false);
  const { user } = useUser();

  const canEditGroup = checkCanEdit(
    { uid: "", role: user?.role, regions: user?.regions },
    stateCodes?.length ? stateCodes : countryCode
  );

  const locationIds = hotspots.map((it) => it.locationId);
  hotspots.sort((a, b) => (b.species || 0) - (a.species || 0));

  const filteredHotspots = showMore ? hotspots : hotspots.slice(0, 12);
  const moreCount = hotspots.length - 12;

  const links: LinkType[] = [
    { url: webpage || "", label: "Official Website", cite: citeWebpage },
    { url: trailMap || "", label: "Trail Map", cite: false },
    ...(additionalLinks || []),
  ].filter((it) => it.url);

  return (
    <div className="container pb-16">
      <Title>{name}</Title>
      <PageHeading region={region}>{name}</PageHeading>
      {canEditGroup && (
        <EditorActions className="font-medium -mt-10">
          <Link href={`/edit/group/${locationId}`}>Edit Group</Link>
          <DeleteBtn url={`/api/group/delete?id=${locationId}`} entity="group" className="ml-auto">
            Delete Group
          </DeleteBtn>
        </EditorActions>
      )}
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
              <BarChartBtn locationIds={locationIds} locationId={locationId} />
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

          {plan && <AboutSection heading="Plan Your Visit" text={plan} />}

          {birding && <AboutSection heading="How to Bird Here" text={birding} />}

          {about && <AboutSection heading="About this Place" text={about} />}

          <Features {...{ restrooms }} />

          <Citations citations={citations} links={links} />

          {updatedAt && <p className="my-6 text-xs">Last updated {dayjs(updatedAt).format("MMMM D, YYYY")}</p>}
        </div>
        <div>
          {markers.length > 0 && !isBot && <MapKit key={locationId} markers={markers} zoom={12} />}
          {!!images?.length && <MapList images={images} />}
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

  const data = getGroupByLocationId(locationId);
  if (!data) return { notFound: true };

  const isBot = isbot(req.headers["user-agent"] || "");

  return {
    props: {
      ...data,
      isBot,
    },
  };
};
