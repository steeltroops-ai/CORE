"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { UserButton, SignedOut, SignedIn, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { MessageSquare, X, Menu, MenuIcon } from "lucide-react";
import { useChatContext } from "../contexts/ChatContext";

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
  sidebarCollapsed: boolean;
  isMobile?: boolean;
  isTablet?: boolean;
}

export function Header({ sidebarCollapsed, isMobile = false, isTablet = false }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isChatOpen, toggleChat } = useChatContext();

  // Get page configuration based on current pathname
  const pageConfig = PAGE_CONFIGS[pathname] || PAGE_CONFIGS["/"];

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-14 md:h-16 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 transition-all duration-300 ${
        isMobile ? "left-0" : sidebarCollapsed ? "left-16" : "left-64"
      }`}
    >
      <div className="flex items-center justify-between h-full px-3 xs:px-4 sm:px-6">
        {/* Mobile Menu Button & Title */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white min-h-touch"
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <h1 className="text-lg sm:text-xl font-semibold text-white truncate">
              {pageConfig.title}
            </h1>
            {pageConfig.subheading && !isMobile && (
              <span className="text-sm text-slate-400 hidden sm:inline">
                {pageConfig.subheading}
              </span>
            )}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Chat Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleChat}
            className={`p-2 hover:bg-slate-800 transition-colors min-h-touch ${
              isChatOpen 
                ? "text-emerald-400 hover:text-emerald-300" 
                : "text-slate-400 hover:text-white"
            }`}
            aria-label={isChatOpen ? "Close chat" : "Open chat"}
          >
            {isChatOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <MessageSquare className="h-5 w-5" />
            )}
          </Button>

          {/* User Authentication */}
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
                  avatarBox: "w-8 h-8 sm:w-9 sm:h-9 min-h-touch min-w-touch",
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
