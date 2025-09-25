"use client";

import { ReactNode } from "react";
import { ViewHeader } from "./ViewHeader";

type ViewContainerProps = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function ViewContainer({
  icon,
  title,
  subtitle,
  children,
  className = "",
}: ViewContainerProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <ViewHeader icon={icon} title={title} subtitle={subtitle} />
      {children}
    </div>
  );
}
