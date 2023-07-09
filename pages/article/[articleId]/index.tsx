import * as React from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { getArticleByArticleId } from "lib/mongo";
import { HotspotsByCounty, Article as ArticleType, Region } from "lib/types";
import PageHeading from "components/PageHeading";
import Title from "components/Title";
import EditorActions from "components/EditorActions";
import DeleteBtn from "components/DeleteBtn";
import MapList from "components/MapList";
import parse from "html-react-parser";
import ListHotspotsByCounty from "components/ListHotspotsByCounty";
import { restructureHotspotsByCounty, getRegion } from "lib/localData";

interface Props extends ArticleType {
  region: Region;
  hotspotsByCounty: HotspotsByCounty;
}

export default function Article({ region, name, content, hotspotsByCounty, images, _id, articleId }: Props) {
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
        <div className="mt-8">
          {hotspotsByCounty.length > 0 && <ListHotspotsByCounty hotspots={hotspotsByCounty} />}
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

  const hotspotsByCounty = !!data.hotspots?.length ? await restructureHotspotsByCounty(data.hotspots, region.code) : [];

  return {
    props: {
      region,
      hotspotsByCounty,
      ...data,
    },
  };
};
