import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import LegacyRegionSlugs from "data/legacy-region-slugs.json";

export const config = {
  matcher: ["/us/:path*", "/ca/:path*"],
};

type KeyValue = {
  [key: string]: string;
};

export default function middleware(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.pathname;

    const region = (LegacyRegionSlugs as KeyValue)[path];

    return NextResponse.redirect(region ? `${process.env.NEXT_PUBLIC_DOMAIN}${region}` : "/", {
      status: 301,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_DOMAIN}/`, {
      status: 307,
    });
  }
}
