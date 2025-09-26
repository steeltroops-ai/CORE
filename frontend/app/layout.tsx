import "../styles/globals.css";

import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { AppLayout } from "../components/AppLayout";
import { SettingsProvider } from "../components/SettingsProvider";

export const metadata = {
  title: "CORE – Commercialization & Research Evaluator",

  description:
    "From research to revenue: evaluate, analyze, and generate breakthrough products.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Check if we have valid Clerk keys (not placeholders)
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasValidKeys = publishableKey && 
    !publishableKey.includes('placeholder') && 
    !publishableKey.includes('YOUR_PUBLISHABLE_KEY') &&
    publishableKey.startsWith('pk_');

  const content = (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <SettingsProvider>
          <AppLayout>{children}</AppLayout>
        </SettingsProvider>
      </body>
    </html>
  );

  // Only wrap with ClerkProvider if we have valid keys
  if (hasValidKeys) {
    return (
      <ClerkProvider>
        {content}
      </ClerkProvider>
    );
  }

  // Return without ClerkProvider if keys are not valid (development/build mode)
  return content;
}
