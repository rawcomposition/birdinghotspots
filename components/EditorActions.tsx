import * as React from "react";
import { useUser } from "providers/user";

type PropTypes = {
  children: React.ReactNode;
  className?: string;
  allowPublic?: boolean;
  requireAdmin?: boolean;
  requireRegion?: string;
};

export default function EditorActions({ children, className, allowPublic, requireAdmin, requireRegion }: PropTypes) {
  const { user } = useUser();
  if (!user && !allowPublic) return <></>;
  if (requireAdmin && user?.role !== "admin") return <></>;
  if (requireRegion && user?.role !== "admin" && !user?.regions?.includes(requireRegion)) return <></>;
  return (
    <div className={`mb-6 bg-slate-100 rounded-sm ${className || ""}`}>
      <div className="py-2 px-2.5 flex gap-6 text-xs">{children}</div>
    </div>
  );
}
