import "../styles/globals.css";

import type { ReactNode } from "react";

export const metadata = {
  title: "CORE – Commercialization & Research Evaluator",

  description:
    "From research to revenue: evaluate, analyze, and generate breakthrough products.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
