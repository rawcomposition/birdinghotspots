import { useRouter } from "next/router";
import Title from "components/Title";
import Link from "next/link";

export default function Add() {
  const router = useRouter();
  const { state, country } = router.query;

  return (
    <div className="container pb-16 my-12">
      <Title>Add Hotspot</Title>
      <div className="max-w-xl mx-auto">
        <div className="bg-gray-100 rounded-md p-6">
          <p className="font-bold mb-1">Hotspots are automatically imported from eBird about once a day.</p>
          {state && country && (
            <p>
              If you need to add a location that is not in eBid, you can{" "}
              <Link href={`/edit/group/new?state=${state}&country=${country}`}>
                <a className="font-medium">add custom location</a>
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
