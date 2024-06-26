import PageHeading from "components/PageHeading";
import Title from "components/Title";

export default function License() {
  return (
    <div className="container pb-16 mt-12">
      <Title>License & Copyright</Title>
      <PageHeading>License & Copyright</PageHeading>
      <div className="max-w-2xl mx-auto text-lg">
        <p className="mb-4">
          Most photos and content are released into the public domain{" "}
          <a
            href="https://creativecommons.org/share-your-work/public-domain/cc0/"
            target="_blank"
            className="text-[#81b5e0]"
            rel="noreferrer"
          >
            CC0
          </a>
          . However, content in the following scenarios belongs to the respective owner:
        </p>
        <p className="mb-2 ml-6">
          - Content sourced from external websites
          <br />
          - All maps
          <br />
          - Images with a copyright or license notice
          <br />
        </p>
        <p className="mb-4">
          Note that if you contribute images or text to this site, you agree to release your content into the public
          domain.
        </p>
      </div>
    </div>
  );
}
