import * as React from "react";
import Title from "components/Title";
import ErrorBoundary from "components/ErrorBoundary";
import { UserIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import DashboardNavItem from "components/DashboardNavItem";
import { useUser } from "providers/user";

type PropTypes = {
  title?: string;
  children: React.ReactNode;
};

export default function DashboardPage({ title, children }: PropTypes) {
  const { user } = useUser();

  const nav = [{ name: "Dashboard", href: "/admin", icon: ChartBarIcon }];

  if (user?.role === "admin") {
    nav.push({ name: "Users", href: "/admin/user/list", icon: UserIcon });
  }

  React.useEffect(() => {
    document.body.classList.add("bg-gray-100");
    return () => {
      document.body.classList.remove("bg-gray-100");
    };
  }, []);

  return (
    <div className="container flex mt-12 gap-8">
      <aside className="hidden lg:col-span-3 lg:block xl:col-span-2 min-w-[190px]">
        <nav aria-label="Sidebar" className="sticky top-4 divide-y divide-gray-300">
          <div className="space-y-1 pb-8">
            {nav.map(({ name, href, icon }) => (
              <DashboardNavItem key={name} label={name} href={href} Icon={icon} />
            ))}
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
