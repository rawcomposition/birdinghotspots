import Link from "next/link";

type Props = {
  items: {
    label: string;
    value: string | number;
    percent?: number;
    url?: string;
  }[];
};

export default function Stat({ items }: Props) {
  return (
    <dl className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
      {items.map(({ label, value, percent, url }) => (
        <Wrapper key={label} url={url}>
          <div key={label} className="overflow-hidden rounded-lg bg-white shadow py-3 px-4">
            <dt className="truncate text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-xl font-semibold tracking-tight text-gray-700 flex items-center gap-2">
              {value}
              {!!percent && <span className="text-gray-400 font-normal text-base"> ({percent}%)</span>}
            </dd>
          </div>
        </Wrapper>
      ))}
    </dl>
  );
}

type WrapperProps = {
  url?: string;
  children: React.ReactNode;
};

function Wrapper({ url, children }: WrapperProps) {
  if (!url) return <>{children}</>;
  return (
    <Link href={url}>
      <a>{children}</a>
    </Link>
  );
}
