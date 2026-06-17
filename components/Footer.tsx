import Link from "next/link";
import OhioFooter from "./OhioFooter";
import GeneralFooter from "./GeneralFooter";
import { useRouter } from "next/router";

export default function Footer() {
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
      </div>
    </footer>
  );
}
