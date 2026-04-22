import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

type Props = {
  href: string;
  label?: string;
  className?: string;
};

export default function ViewOnEbirdBtn({ href, label = "View on eBird", className }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white rounded-full py-1.5 px-4 text-sm font-bold ${
        className || ""
      }`}
    >
      <span>{label}</span>
      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
    </a>
  );
}
