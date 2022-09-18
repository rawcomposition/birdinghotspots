import * as React from "react";
import Title from "components/Title";
import ErrorBoundary from "components/ErrorBoundary";
import {
  UserCircleIcon,
  UsersIcon,
  ChartBarIcon,
  PhotoIcon,
  InformationCircleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import DashboardNavItem from "components/DashboardNavItem";
import { useUser } from "providers/user";

type PropTypes = {
  title?: string;
  children: React.ReactNode;
};

export default function DashboardPage({ title, children }: PropTypes) {
  const { user } = useUser();

  const nav = [
    { name: "Dashboard", href: "/admin", icon: ChartBarIcon },
    { name: "Image Review", href: "/admin/image-review", icon: PhotoIcon },
    { name: "Suggestion Review", href: "/admin/revision-review", icon: PencilSquareIcon },
  ];

  if (user?.role === "admin") {
    nav.push({ name: "Users", href: "/admin/user/list", icon: UsersIcon });
  }

  nav.push({ name: "My Account", href: "/admin/account", icon: UserCircleIcon });

  React.useEffect(() => {
    document.body.classList.add("bg-gray-100");
    return () => {
      document.body.classList.remove("bg-gray-100");
    };
  }, []);

  return (
    <div className="container flex flex-col md:flex-row mt-12 gap-8">
      <aside className="lg:col-span-3 xl:col-span-2 min-w-[190px]">
        <nav aria-label="Sidebar" className="sticky top-4 divide-y divide-gray-300">
          <div className="space-y-1 pb-8">
            {nav.map(({ name, href, icon }) => (
              <DashboardNavItem key={name} label={name} href={href} Icon={icon} />
            ))}
            <DashboardNavItem
              label="Tips for Editors"
              href="https://docs.google.com/document/d/16_uDmcHD6U3TXKydu41zMzoHwNrwsvZJ/edit?usp=sharing&ouid=112975085636010215798&rtpof=true&sd=true"
              Icon={InformationCircleIcon}
              target="blank"
            />
          </div>
        </nav>
      </aside>
      <main className="min-h-[600px] grow">
        <Title>{title}</Title>
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
