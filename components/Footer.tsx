import Link from "next/link";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import useFirebaseLogout from "hooks/useFirebaseLogout";
import { useUser } from "providers/user";
import OhioFooter from "./OhioFooter";
import GeneralFooter from "./GeneralFooter";
import { useRouter } from "next/router";

export default function Footer() {
  const { logout } = useFirebaseLogout();
  const { user } = useUser();
  const router = useRouter();
  const region = router.query.region as string;
  return (
    <footer id="footer">
      {region?.startsWith("US-OH") ? <OhioFooter /> : <GeneralFooter />}
      <div className="bg-secondary py-3 text-xs text-gray-300 text-center">
        Most content is released into the public domain&nbsp;
        <a
          href="https://creativecommons.org/share-your-work/public-domain/cc0/"
          target="_blank"
          className="text-[#81b5e0]"
          rel="noreferrer"
        >
          CC0
        </a>
        &nbsp;with some exceptions -{" "}
        <Link href="/license" className="text-[#81b5e0]">
          learn More
        </Link>
        <p className="mt-2">
          {user ? (
            <>
              <Link href="/admin" className="text-[#81b5e0]">
                Editor Dashboard
              </Link>
              &nbsp;-&nbsp;
              <button type="button" onClick={logout} className="text-[#81b5e0]">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="text-[#81b5e0] inline-flex items-center gap-0.5">
              <PencilSquareIcon className="h-3 w-3 inline-block" />
              Editor Login
            </Link>
          )}
        </p>
      </div>
    </footer>
  );
}
