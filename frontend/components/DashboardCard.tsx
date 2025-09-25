"use client";

import type { ReactNode } from "react";

type DashboardCardProps = {
  title: string;

  description?: string;

  children: ReactNode;
};

export function DashboardCard({
  title,
  description,
  children,
}: DashboardCardProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-md">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>

        {description && <p className="text-xs text-slate-400">{description}</p>}
      </header>

      <div className="mt-4 text-sm text-slate-200">{children}</div>
    </section>
  );
}
