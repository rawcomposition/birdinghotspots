import Link from "next/link";

export default function OhioFooter() {
  return (
    <div className="bg-primary py-16 text-white">
      <div className="container grid md:grid-cols-4 gap-8">
        <div className="flex gap-2 flex-col">
          <a href="https://ohiobirds.org/" className="text-white" target="_blank" rel="noreferrer">
            <img src="/oh-logo.jpg" width={200} className="px-2 py-1 rounded bg-white" />
          </a>
          <p>
            The Ohio section of this site is provided by the&nbsp;
            <a href="https://ohiobirds.org/" className="text-white" target="_blank" rel="noreferrer">
              <strong>Ohio Ornithological Society</strong>
            </a>
          </p>
        </div>
        <div />
        <section>
          <h3 className="text-lg font-bold mb-2">The Ohio Ornithological Society</h3>
          <a href="https://ohiobirds.org" target="_blank" rel="noreferrer" className="text-white">
            Visit the OOS
          </a>
          <br />
          <a
            href="https://ohiobirds.org/membership/membership-renewals/"
            target="_blank"
            rel="noreferrer"
            className="text-white"
          >
            Become a Member
          </a>
          <br />
          <a
            href="https://ohiobirds.org/membership/donate-now/"
            target="_blank"
            rel="noreferrer"
            className="text-white"
          >
            Donate!
          </a>
          <br />
        </section>

        <section>
          <h3 className="text-lg font-bold mb-2">Learn More</h3>
          <Link href="/about" className="text-white">
            About this Website
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
