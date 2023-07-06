import * as React from "react";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import { getArticleBySlug } from "lib/mongo";
import { State, HotspotsByCounty, Article as ArticleType, Region } from "lib/types";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import EditorActions from "components/EditorActions";
import DeleteBtn from "components/DeleteBtn";
import MapList from "components/MapList";
import parse from "html-react-parser";
import ListHotspotsByCounty from "components/ListHotspotsByCounty";
import { restructureHotspotsByCounty, getRegion } from "lib/data";

interface Props extends ArticleType {
  region: Region;
  hotspotsByCounty: HotspotsByCounty;
}

export default function Article({ region, name, content, hotspotsByCounty, images, _id }: Props) {
  return (
    <div className="container pb-16">
      <Title>{`${name} - ${region.detailedName}`}</Title>
      <PageHeading region={region}>{name}</PageHeading>
      <EditorActions className="-mt-12" requireRegion={region.code}>
        <Link href={`/region/${region.code}/articles/edit/${_id}`}>Edit Article</Link>
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
        {hotspotsByCounty.length > 0 && <ListHotspotsByCounty hotspots={hotspotsByCounty} />}
      </div>
    </div>
  );
}

type Params = ParsedUrlQuery & {
  region: string;
  slug: string;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { slug, region: regionCode } = query as Params;
  const region = await getRegion(regionCode);
  if (!region) return { notFound: true };

  const data = await getArticleBySlug(region.code, slug);
  if (!data) return { notFound: true };
  const hotspotsByCounty = !!data.hotspots?.length ? await restructureHotspotsByCounty(data.hotspots, regionCode) : [];

  return {
    props: {
      region,
      hotspotsByCounty,
      ...data,
    },
  };
};
