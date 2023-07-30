import * as React from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { getArticleByArticleId } from "lib/mongo";
import { Hotspot, Article as ArticleType, Region } from "lib/types";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import EditorActions from "components/EditorActions";
import DeleteBtn from "components/DeleteBtn";
import MapList from "components/MapList";
import parse from "html-react-parser";
import HotspotGrid from "components/HotspotGrid";
import { getRegion } from "lib/localData";

interface Props extends ArticleType {
  region: Region;
  formattedHotspots: Hotspot[];
}

export default function Article({ region, name, content, formattedHotspots, images, _id, articleId }: Props) {
  return (
    <div className="container pb-16">
      <Title>{`${name} - ${region.detailedName}`}</Title>
      <PageHeading region={region}>{name}</PageHeading>
      <EditorActions className="-mt-12" requireRegion={region.code}>
        <Link href={`/article/${articleId}/edit`}>Edit Article</Link>
        <DeleteBtn url={`/api/article/delete?id=${_id}`} entity="article" className="ml-auto">
          Delete Article
        </DeleteBtn>
      </EditorActions>
      <div className="overflow-auto">
        <div className="formatted">
          <div className="float-right max-w-[50%] ml-12 -mt-6 mb-6">
            {!!images?.length && <MapList images={images} />}
          </div>
          {parse(content || "")}
        </div>
        <div className="grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
          {formattedHotspots?.length > 0 && <HotspotGrid hotspots={formattedHotspots} loading={false} />}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const articleId = query.articleId as string;

  const data = await getArticleByArticleId(articleId);
  if (!data) return { notFound: true };

  const region = getRegion(data.stateCode || data.countryCode);
  if (!region) return { notFound: true };

  const formattedHotspots = data.hotspots?.map((hotspot) => {
    const regionCode = hotspot.countyCode || hotspot.stateCode;
    const region = getRegion(regionCode);
    const locationLine = region ? `${region.detailedName}` : regionCode;
    return {
      ...hotspot,
      _id: hotspot._id?.toString(),
      locationLine,
    };
  });

  const sortBy = data.sortHotspotsBy || "none";
  const sortedHotspots = formattedHotspots?.sort((a, b) =>
    sortBy === "region"
      ? `${a.locationLine} ${a.name}`.localeCompare(`${b.locationLine} ${b.name}`)
      : sortBy === "species" && a.species && b.species
      ? b.species - a.species
      : 0
  );

  return {
    props: {
      ...data,
      region,
      formattedHotspots: sortedHotspots,
    },
  };
};
