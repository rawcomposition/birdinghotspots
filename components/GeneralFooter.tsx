import Logo from "components/Logo";
import Link from "next/link";

export default function OhioFooter() {
  return (
    <div className="bg-primary py-16 text-white">
      <div className="container grid md:grid-cols-4 gap-8">
        <div className="flex gap-2 flex-col">
          <Link href="/" className="flex gap-4 px-2 py-2 rounded bg-white items-center">
            <Logo className="w-12" />
            <div className="leading-3 pb-0.5">
              <strong className="text-lg text-gray-700 font-normal">Birding Hotspots</strong>
              <br />
              <em className="text-[0.8em] text-[#92ad39] font-medium">Where to Go Birding</em>
            </div>
          </Link>
          <p>This website is managed by Ken Ostermiller, Adam Jackson, and other volunteers.</p>
        </div>
        <div />

        <section />

        <section>
          <h3 className="text-lg font-bold mb-2">Learn More</h3>
          <Link href="/about" className="text-white">
            About This Website
          </Link>
          <br />
          <Link href="/about-ebird" className="text-white">
            About eBird
          </Link>
          <br />
          <Link href="/contact" className="text-white">
            Contact
          </Link>
          <br />
          <Link href="/license" className="text-white">
            License & Copyright
          </Link>
        </section>
      </div>
    </div>
  );
}
