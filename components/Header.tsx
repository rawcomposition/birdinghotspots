import * as React from "react";
import Link from "next/link";
import SearchModal from "components/SearchModal";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Logo from "components/Logo";
import { useRouter } from "next/router";

const links = [
  {
    label: "Explore Hotspots",
    href: "/explore",
  },
];

export default function Header() {
  const [showSearch, setShowSearch] = React.useState<boolean>(false);
  const router = useRouter();

  const isHome = router.pathname === "/";

  return (
    <>
      <header className={`bg-white border-b static sm:pr-4 pr-6 pl-3  shadow-sm z-[10000]`}>
        <div>
          <div className="flex py-2 items-center">
            <Link href="/">
              <a className="flex gap-2 items-center">
                <Logo className={`w-[50px] ${isHome ? "md:w-[85px]" : ""} transition-all duration-300 h-auto`} />
                <div className="flex flex-col justify-center">
                  <h1 className={`text-lg ${isHome ? "md:text-3xl" : ""} text-gray-900 transition-all duration-300`}>
                    Birding Hotspots
                  </h1>
                  <em className="text-[0.8em] leading-4 text-[#92ad39] font-medium">Where to Go Birding</em>
                </div>
              </a>
            </Link>
            <button type="button" onClick={() => setShowSearch(true)} className="ml-auto mr-6 sm:mr-4">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <nav>
              <ul className="flex gap-7">
                <li>
                  <Link href="/explore">
                    <a className="text-xs font-bold text-gray-700 hover:text-gray-600 cursor-pointer uppercase">
                      <span className="hidden sm:inline">Explore Hotspots</span>
                      <span className="sm:hidden">Explore</span>
                    </a>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </>
  );
}
