import React from "react";
import Link from "next/link";
import Head from "next/head";
import Regions from "data/regions.json";
import EbirdDescription from "components/EbirdDescription";
import Title from "components/Title";
import Banner from "components/Banner";
import Heading from "components/Heading";
import Hotspot from "models/Hotspot";
import { getRegion } from "lib/localData";
import connect from "lib/mongo";
import { Hotspot as HotspotType, Region } from "lib/types";
import HotspotGrid from "components/HotspotGrid";
import clsx from "clsx";

type Props = {
  northAmericaRegions: Region[];
  featured: HotspotType[];
};

export default function Home({ featured, northAmericaRegions }: Props) {
  return (
    <>
      <Title />
      <Head>
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_DOMAIN}/social-banner.jpg`} />
      </Head>
      <Banner />
      <div className="container pb-16 mt-12">
        <div className="sm:grid grid-cols-2 gap-16">
          <section>
            {northAmericaRegions.map((country) => (
              <React.Fragment key={country.code}>
                <Link href={`/region/${country.code}`} className="text-gray-700">
                  <h3 className="text-lg mb-4 font-bold">{country.name}</h3>
                </Link>
                {!!country.subregions?.length && (
                  <div className={clsx("columns-2 mb-12", country.name !== "Canada" && "lg:columns-3")}>
                    {country.subregions.map(({ name, code }) => (
                      <Link
                        key={code}
                        href={`/region/${code}`}
                        className="font-bold px-2 py-1 text-base mb-1 block break-inside-avoid"
                      >
                        {name}
                      </Link>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
            <h3 className="text-lg mb-4 font-bold">Worldwide</h3>
            <div className="columns-2 mb-12">
              <Link href="/region/AQ" className="font-bold px-2 py-1 text-base mb-1 block">
                Antarctica
              </Link>
              <Link href="/region/FO" className="font-bold px-2 py-1 text-base mb-1 block">
                Faroe Islands
              </Link>
              <Link href="/region/NA" className="font-bold px-2 py-1 text-base mb-1 block">
                Namibia
              </Link>
              <Link href="/region/ZA" className="font-bold px-2 py-1 text-base mb-1 block">
                South Africa
              </Link>
              <Link href="/region/GS" className="font-bold px-2 py-1 text-base mb-1 block">
                South Georgia and South Sandwich Islands
              </Link>
              <Link href="/region/SE" className="font-bold px-2 py-1 text-base mb-1 block">
                Sweden
              </Link>
              <Link href="/region/TJ" className="font-bold px-2 py-1 text-base mb-1 block">
                Tajikistan
              </Link>
              <Link href="/region/RS" className="font-bold px-2 py-1 text-base mb-1 block">
                Serbia
              </Link>
              <Link href="/region/TR" className="font-bold px-2 py-1 text-base mb-1 block">
                Türkiye
              </Link>
              <Link href="/region/AE" className="font-bold px-2 py-1 text-base mb-1 block">
                United Arab Emirates
              </Link>
            </div>
          </section>
          <section>
            <div className="bg-gray-100 p-4 mt-10">
              <h3 className="text-lg mb-4 font-bold">Want to see your state, province, or country on this site?</h3>
              <p className="mb-4">
                Volunteer editors are needed for many of the regions we have open. We can also open new regions if we
                have interested volunteers.
              </p>
              <p className="mb-4">
                Get in touch using our <Link href="/contact">contact form</Link>.
              </p>
            </div>
          </section>
        </div>

        <Heading className="mb-16 mt-24">Featured Hotspots</Heading>
        <div className="mt-12 grid xs:grid-cols-2 md:grid-cols-4 gap-6">
          <HotspotGrid hotspots={featured} loading={false} />
        </div>
        <Heading className="mb-16 mt-12" color="yellow">
          More Information
        </Heading>
        <div className="sm:grid grid-cols-2 gap-16">
          <div>
            <p className="mb-4">
              This website collects tips for birding from local birders and descriptions and maps of eBird hotspots from
              eBird and other websites. In eBird, hotspots are shared locations where birders may report their bird
              sightings to eBird. Hotspots provide birders with information about birding locations where birds are
              being seen.
            </p>
            <EbirdDescription />
            <h3 className="text-lg font-bold mb-1.5">eBird can help you</h3>
            <p className="mb-4">
              + Record the birds you see
              <br />+ Keep track of your bird lists
              <br />+ Explore dynamic maps and graphs
              <br />+ Share your sightings and join the eBird community
              <br />+ Contribute to science and conservation
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1.5">Links to eBird website</h3>
            <p className="mb-4">
              <a href="https://ebird.org/about" target="_blank" rel="noreferrer">
                About eBird
              </a>
              <br />
              <a href="https://ebird.org/hotspots" target="_blank" rel="noreferrer">
                eBird Hotspot Explorer
              </a>
              <br />
              <a href="https://support.ebird.org/en/support/home" target="_blank" rel="noreferrer">
                eBird Help Documents
              </a>
              <br />
              <a
                href="https://confluence.cornell.edu/display/CLOISAPI/eBird-1.1-HotSpotsByRegion"
                target="_blank"
                rel="noreferrer"
              >
                Lists of all eBird Hotspots worldwide
              </a>
              <br />
              <a href="https://www.facebook.com/ebird/" target="_blank" rel="noreferrer">
                eBird Facebook page
              </a>
            </p>
            <h3 className="text-lg font-bold mb-1.5">Tips on Managing Your eBird Records</h3>
            <p className="mb-4">
              <a
                href="https://support.ebird.org/en/support/solutions/articles/48001158707-get-started-with-ebird"
                target="_blank"
                rel="noreferrer"
              >
                Get started with eBird
              </a>
              <br />
              <a
                href="https://support.ebird.org/en/support/solutions/articles/48000960317-ebird-alerts-and-targets-faqs"
                target="_blank"
                rel="noreferrer"
              >
                eBird Alerts and Targets
              </a>
              <br />
              <a
                href="https://support.ebird.org/en/support/solutions/articles/48000625567-checklist-sharing-and-group-accounts#anchorEditChecklists"
                target="_blank"
                rel="noreferrer"
              >
                Edit an eBird checklist
              </a>
              <br />
              <a
                href="https://support.ebird.org/en/support/solutions/articles/48000625567-checklist-sharing-and-group-accounts#anchorShareChecklists"
                target="_blank"
                rel="noreferrer"
              >
                Sharing eBird checklists
              </a>
              <br />
              <a href="https://support.ebird.org/en/support/solutions/articles/48001009443-ebird-hotspot-faqs#anchorMergeWithHotspot">
                How do I merge a personal location with an existing Hotspot?
              </a>
              <br />
              <a href="https://support.ebird.org/en/support/solutions/articles/48001009443-ebird-hotspot-faqs#anchorSuggestHotspot">
                How do I suggest a new Hotspot?
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticProps = async () => {
  await connect();

  const results = await Hotspot.aggregate([
    {
      $match: {
        "featuredImg.smUrl": { $exists: true },
        noContent: { $ne: true },
        species: { $gt: 150 },
      },
    },
    { $sample: { size: 8 } },
    {
      $project: {
        stateCode: 1,
        countyCode: 1,
        name: 1,
        featuredImg: 1,
        url: 1,
        species: 1,
      },
    },
  ]);

  const formatted = results.map((hotspot) => {
    const regionCode = hotspot.countyCode || hotspot.stateCode;
    const region = getRegion(regionCode);
    const locationLine = region ? `${region.detailedName}` : regionCode;
    return {
      ...hotspot,
      _id: hotspot._id.toString(),
      locationLine,
    };
  });

  const northAmericaRegions = Regions.filter(({ code }) => ["US", "CA", "MX"].includes(code));

  return {
    props: { featured: formatted, northAmericaRegions },
    revalidate: 3600, // 1 hour
  };
};
