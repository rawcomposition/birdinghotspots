import * as React from "react";
import PageHeading from "components/PageHeading";
import Title from "components/Title";

export default function Sentry() {
  const handleClick = () => {
    throw new Error("Sentry Test");
  };
  return (
    <div className="container pb-16 mt-12">
      <Title>Sentry Test</Title>
      <PageHeading breadcrumbs={false}>Sentry Test</PageHeading>
      <button onClick={handleClick}>Throw Error</button>
    </div>
  );
}
