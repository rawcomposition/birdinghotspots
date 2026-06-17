import Title from "components/Title";
import PageHeading from "components/PageHeading";

type Props = {
  title?: string;
};

export default function Unavailable({ title = "Page No Longer Available" }: Props) {
  return (
    <div className="container pb-16 mt-12">
      <Title>{title}</Title>
      <PageHeading>{title}</PageHeading>
      <div className="max-w-lg text-center mx-auto my-16">
        <p className="text-lg text-gray-600">
          This page is no longer available. This site is now a read-only archive, and interactive
          features have been retired.
        </p>
      </div>
    </div>
  );
}
