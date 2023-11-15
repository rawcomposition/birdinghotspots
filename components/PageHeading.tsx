import Link from "next/link";
import { Region } from "lib/types";
import clsx from "clsx";
import React from "react";

type Props = {
  region?: Region;
  children: React.ReactNode;
  className?: string;
  hideCurrent?: boolean;
  extraCrumb?: {
    href: string;
    label: string;
  };
};

type Breadcrumb = {
  url: string;
  name: string;
};

export default function PageHeading({ region, children, className, extraCrumb, hideCurrent = false, ...props }: Props) {
  const breadcrumbs: Breadcrumb[] = [];

  if (extraCrumb) {
    breadcrumbs.push({ url: extraCrumb.href, name: extraCrumb.label });
  }

  if (region && !hideCurrent) {
    breadcrumbs.push({ url: `/region/${region.code}`, name: region.name });
  }

  if (region?.parents?.length) {
    breadcrumbs.push(...region.parents.map(({ code, name }) => ({ url: `/region/${code}`, name })));
  }

  return (
    <header
      className={`font-bold text-white text-2xl header-gradient my-16 rounded-md ${className || ""}`}
      style={{ "--color": "#4a84b2" } as React.CSSProperties}
      {...props}
    >
      <h1 className="p-3">{children}</h1>
      {breadcrumbs.length > 0 && (
        <nav className="text-xs sm:text-[13px] leading-4 sm:leading-5 flex items-stretch">
          {breadcrumbs.map(({ url, name }, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={url}>
                <Link
                  href={url}
                  className={clsx(
                    "text-white/90 px-5 py-1.5 flex items-center",
                    isLast ? "breadcrumb-gradient pr-8" : "bg-white/10"
                  )}
                >
                  {name}
                </Link>
                {!isLast && <Icon />}
              </React.Fragment>
            );
          })}
        </nav>
      )}
    </header>
  );
}

const Icon = () => (
  <div className="bg-white/10">
    <svg
      className="flex-shrink-0 w-[16px] h-full text-white/30"
      viewBox="0 0 24 44"
      preserveAspectRatio="none"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z"></path>
    </svg>
  </div>
);
