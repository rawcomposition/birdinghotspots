import React from "react";
import Link from "next/link";
import Logo from "components/Logo";
import { useRouter } from "next/router";

export default function Header() {
  const router = useRouter();

  const isHome = router.pathname === "/";

  return (
    <header className={`bg-white border-b static pr-8 pl-3  shadow-sm z-[10000]`}>
      <div>
        <div className="flex py-2 items-center">
          <Link href="/" className="flex gap-2 items-center">
            <Logo className={`w-[50px] ${isHome ? "md:w-[85px]" : ""} transition-all duration-300 h-auto`} />
            <div className="flex flex-col justify-center">
              <h1 className={`text-lg ${isHome ? "md:text-3xl" : ""} text-gray-900 transition-all duration-300`}>
                Birding Hotspots
              </h1>
              <em className="text-[0.8em] leading-4 text-[#92ad39] font-medium">Where to Go Birding</em>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
