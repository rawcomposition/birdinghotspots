import { useRouter } from "next/router";
import Link from "next/link";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type PropTypes = {
  label: string;
  href: string;
  Icon: any;
  target?: string;
};

export default function NavItem({ label, href, Icon, target }: PropTypes) {
  const { pathname } = useRouter();
  return (
    <Link
      href={href}
      className={classNames(
        pathname === href ? "bg-gray-200 text-gray-900" : "text-gray-700 hover:bg-gray-50",
        "group flex items-center px-3 py-2 text-sm font-medium rounded-md"
      )}
      target={target || "_self"}
      aria-current={pathname === href ? "page" : undefined}
    >
      <Icon className="text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" aria-hidden="true" />
      {label}
    </Link>
  );
}
