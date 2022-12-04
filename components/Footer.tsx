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
  const { stateSlug } = router.query;
  return (
    <footer id="footer">
      {stateSlug === "ohio" ? <OhioFooter /> : <GeneralFooter />}
      <div className="bg-[#325a79] py-3 text-xs text-gray-300 text-center">
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
        <Link href="/license">
          <a className="text-[#81b5e0]">learn More</a>
        </Link>
        <p className="mt-2">
          {user ? (
            <>
              <Link href="/admin">
                <a className="text-[#81b5e0]">Editor Dashboard</a>
              </Link>
              &nbsp;-&nbsp;
              <button type="button" onClick={logout} className="text-[#81b5e0]">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login">
              <a className="text-[#81b5e0]">
                <PencilSquareIcon className="h-3 w-3 inline" /> Editor Login
              </a>
            </Link>
          )}
        </p>
      </div>
    </footer>
  );
}
