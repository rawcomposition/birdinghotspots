import React from "react";
import { Article } from "lib/types";
import Link from "next/link";
import clsx from "clsx";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

type Props = {
  articles: Article[];
  className?: string;
};

export default function ArticleGrid({ articles, className }: Props) {
  const [viewMore, setViewMore] = React.useState<boolean>(false);

  const limit = 4;
  const visibleArticles = viewMore ? articles : articles.slice(0, limit);

  return (
    <div className={clsx(className)}>
      <h3 className="text-lg mb-3 font-bold">Articles</h3>
      <div className="grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {visibleArticles.map(({ name, articleId, images }) => {
          const featuredImg = images?.[0];
          const url = `/article/${articleId}`;
          return (
            <article key={articleId} className="flex flex-col gap-3">
              <Link href={url}>
                <img
                  src={featuredImg?.xsUrl || featuredImg?.smUrl || "/placeholder.png"}
                  alt={featuredImg?.caption || ""}
                  className="object-cover rounded-md bg-gray-100 w-full aspect-[1.55]"
                />
              </Link>
              <div className="flex-1">
                <div className="leading-5 flex items-start">
                  <div>
                    <h2 className="font-bold">
                      <Link href={url} className="text-gray-700 text-[13px] leading-3">
                        {name}
                      </Link>
                    </h2>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {articles.length > limit && !viewMore && (
        <button
          type="button"
          className="mt-2 flex gap-1 items-center text-sm text-gray-600 font-medium"
          onClick={() => setViewMore(!viewMore)}
        >
          View {articles.length - limit} more
          <ChevronDownIcon className="h-4 w-4 inline-block" />
        </button>
      )}
    </div>
  );
}
