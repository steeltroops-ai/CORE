"use client";

import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

// Check if Clerk is available by checking environment variables
const isClerkAvailable = () => {
  if (typeof window === "undefined") {
    // Server-side: check environment variables
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    return (
      publishableKey &&
      !publishableKey.includes("placeholder") &&
      !publishableKey.includes("YOUR_PUBLISHABLE_KEY") &&
      publishableKey.startsWith("pk_")
    );
  }
  // Client-side: assume available if we reach here
  return true;
};

// Safe wrapper components that handle when Clerk is not available
const SafeSignedOut = ({ children }: { children: React.ReactNode }) => {
  if (!isClerkAvailable()) {
    return <>{children}</>; // Show signed out UI when Clerk is not available
  }
  return <SignedOut>{children}</SignedOut>;
};

const SafeSignedIn = ({ children }: { children: React.ReactNode }) => {
  if (!isClerkAvailable()) {
    return null; // Hide signed in UI when Clerk is not available
  }
  return <SignedIn>{children}</SignedIn>;
};

const SafeSignInButton = ({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode?: string;
}) => {
  if (!isClerkAvailable()) {
    return <>{children}</>; // Render button without Clerk functionality
  }
  return <SignInButton mode={mode as any}>{children}</SignInButton>;
};

const SafeSignUpButton = ({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode?: string;
}) => {
  if (!isClerkAvailable()) {
    return <>{children}</>; // Render button without Clerk functionality
  }
  return <SignUpButton mode={mode as any}>{children}</SignUpButton>;
};

const SafeUserButton = ({ appearance }: { appearance?: any }) => {
  if (!isClerkAvailable()) {
    // Fallback user avatar when Clerk is not available
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
        <span className="text-sm font-medium">U</span>
      </div>
    );
  }
  return <UserButton appearance={appearance} />;
};

interface PageConfig {
  title: string;
  subheading: string;
}

const PAGE_CONFIGS: Record<string, PageConfig> = {
  "/": {
    title: "Dashboard",
    subheading: "Overview & Analytics",
  },
  "/insights": {
    title: "Insights",
    subheading: "Research Analysis",
  },
  "/vc-lens": {
    title: "VC Lens",
    subheading: "Startup Evaluation",
  },
  "/gtm-lab": {
    title: "GTM Lab",
    subheading: "Go-to-Market Strategy",
  },
  "/assistant": {
    title: "Assistant",
    subheading: "AI-Powered Support",
  },
  "/research-papers": {
    title: "Research Papers",
    subheading: "Document Upload",
  },
  "/settings": {
    title: "Settings",
    subheading: "Configuration",
  },
  "/help": {
    title: "Help",
    subheading: "Documentation & Support",
  },
};

interface HeaderProps {
  sidebarCollapsed?: boolean;
}

export function Header({ sidebarCollapsed = true }: HeaderProps) {
  const pathname = usePathname();

  // Get page configuration based on current pathname
  const pageConfig = PAGE_CONFIGS[pathname] || PAGE_CONFIGS["/"];

  return (
    <header
      className={`fixed top-0 right-0 z-30 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? "left-16" : "left-64"
      } py-3 bg-slate-950/80 backdrop-blur-xl border-b border-emerald-500/20 shadow-lg shadow-slate-900/20`}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderImage: 'linear-gradient(90deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1)) 1',
      }}
    >
      <div className="flex items-center justify-between px-6">
        {/* Page Title and Subheading */}
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-white tracking-tight">
            {pageConfig.title}
          </h1>
          <p className="text-xs text-slate-400 font-normal">
            {pageConfig.subheading}
          </p>
        </div>

        {/* Authentication Section */}
        <div className="flex items-center gap-4">
          <SafeSignedOut>
            <div className="flex items-center gap-3">
              <SafeSignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors duration-200">
                  Sign In
                </button>
              </SafeSignInButton>
              <SafeSignUpButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-200">
                  Sign Up
                </button>
              </SafeSignUpButton>
            </div>
          </SafeSignedOut>

          <SafeSignedIn>
            <SafeUserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard:
                    "bg-slate-900/95 border border-slate-700/50 backdrop-blur-sm",
                  userButtonPopoverActions: "bg-slate-900/95",
                  userButtonPopoverActionButton:
                    "text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10",
                  userButtonPopoverActionButtonText: "text-sm",
                  userButtonPopoverFooter: "hidden",
                },
              }}
            />
          </SafeSignedIn>
        </div>
      </div>
    </header>
  );
}
