import React from "react";
import Title from "components/Title";
import ErrorBoundary from "components/ErrorBoundary";

type PropTypes = {
  title?: string;
  children: React.ReactNode;
};

export default function AdminPage({ title, children }: PropTypes) {
  return (
    <div className="min-h-[600px]">
      <Title>{title}</Title>
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  );
}
