"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  FiHome,
  FiEye,
  FiTrendingUp,
  FiTarget,
  FiMessageSquare,
  FiUpload,
  FiSettings,
  FiHelpCircle,
  FiUser,
  FiLogOut,
  FiChevronRight,
  FiChevronsLeft,
} from "react-icons/fi";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@clerk/nextjs";
import { X } from "lucide-react";

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

// Component that uses Clerk hooks when available
function ClerkUserInfo({ actuallyCollapsed }: { actuallyCollapsed: boolean }) {
  const { user } = useUser();

  if (actuallyCollapsed || !user) return null;

  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white truncate">
        {user.fullName || user.firstName || "User"}
      </p>
      <p className="text-xs text-slate-400 truncate">
        {user.primaryEmailAddress?.emailAddress || ""}
      </p>
    </div>
  );
}

// Fallback component when Clerk is not available
function FallbackUserInfo({
  actuallyCollapsed,
}: {
  actuallyCollapsed: boolean;
}) {
  if (actuallyCollapsed) return null;

  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white truncate">Guest User</p>
      <p className="text-xs text-slate-400 truncate">Not signed in</p>
    </div>
  );
}

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
        <FiUser size={16} />
      </div>
    );
  }
  return <UserButton appearance={appearance} />;
};
import { LuLightbulb } from "react-icons/lu";

type SidebarProps = {
  activeView?: string;
  onNavigate?: (view: string) => void;
  onSidebarStateChange?: (isCollapsed: boolean) => void;
  isMobile?: boolean;
  isTablet?: boolean;
  onToggle?: () => void;
};

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: FiHome,
    href: "/",
    description: "Display overview, recent uploads, and quick statistics",
  },
  {
    key: "insights",
    label: "Insights",
    icon: FiEye,
    href: "/insights",
    description: "Analyze novelty, competitors, and licensing data",
  },
  {
    key: "vc-lens",
    label: "VC Lens",
    icon: FiTrendingUp,
    href: "/vc-lens",
    description: "Startup evaluation dashboard",
  },
  {
    key: "gtm-lab",
    label: "GTM Lab",
    icon: FiTarget,
    href: "/gtm-lab",
    description: "Product development and go-to-market strategy generation",
  },
  {
    key: "assistant",
    label: "Assistant",
    icon: FiMessageSquare,
    href: "/assistant",
    description: "Direct access to AI chat assistant",
  },
  {
    key: "research-papers",
    label: "Research Papers",
    icon: FiUpload,
    href: "/research-papers",
    description: "Manage uploaded research papers and studies",
  },
];

const BOTTOM_NAV_ITEMS = [
  {
    key: "settings",
    label: "Settings",
    icon: FiSettings,
    href: "/settings",
    description: "Accessibility settings, developer tools, and preferences",
  },
  {
    key: "help",
    label: "Help",
    icon: FiHelpCircle,
    href: "/help",
    description: "Documentation, tutorials, and support",
  },
];

// Component to display authenticated user info
function AuthenticatedUserInfo({
  actuallyCollapsed,
}: {
  actuallyCollapsed: boolean;
}) {
  const clerkAvailable = isClerkAvailable();

  if (clerkAvailable) {
    return <ClerkUserInfo actuallyCollapsed={actuallyCollapsed} />;
  }

  return <FallbackUserInfo actuallyCollapsed={actuallyCollapsed} />;
}

// Mobile toggle button component
export function MobileToggleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-50 p-2 bg-slate-950/95 backdrop-blur-md border border-slate-200/10 rounded-lg text-white hover:bg-slate-800 transition-all duration-200 md:hidden"
      aria-label="Toggle sidebar"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}

export function Sidebar({
  activeView,
  onNavigate,
  onSidebarStateChange,
  isMobile = false,
  isTablet = false,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  // Auto-collapse on mobile and tablet
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      const newCollapsedState = !isCollapsed;
      setIsCollapsed(newCollapsedState);
      onSidebarStateChange?.(newCollapsedState);
    }
  };

  const closeMobileSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  }, [isMobile]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  // Use only the collapsed state
  const actuallyCollapsed = isCollapsed;

  // Determine active view from pathname if not provided
  const currentActiveView =
    activeView ||
    (() => {
      if (pathname === "/") return "dashboard";
      if (pathname.startsWith("/insights")) return "insights";
      if (pathname.startsWith("/vc-lens")) return "vc-lens";
      if (pathname.startsWith("/gtm-lab")) return "gtm-lab";
      if (pathname.startsWith("/assistant")) return "assistant";
      if (pathname.startsWith("/research-papers")) return "research-papers";
      if (pathname.startsWith("/settings")) return "settings";
      if (pathname.startsWith("/help")) return "help";
      return "dashboard";
    })();

  // Notify parent component of sidebar state changes
  useEffect(() => {
    onSidebarStateChange?.(actuallyCollapsed);
    // Reset hover state when sidebar expands
    if (!actuallyCollapsed) {
      setIsLogoHovered(false);
    }
  }, [actuallyCollapsed, onSidebarStateChange]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={closeMobileSidebar}
        />
      )}
      
      <aside
        className={`fixed left-0 top-0 z-40 h-full transition-all duration-300 ease-in-out ${
          isMobile
            ? isMobileOpen
              ? "w-64 translate-x-0"
              : "w-64 -translate-x-full"
            : actuallyCollapsed
            ? "w-16"
            : "w-64"
        } flex flex-col border-r border-slate-200/10 bg-slate-950/95 backdrop-blur-md`}
      >
      {/* Logo and Toggle Section */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-200/5">
        {/* Mobile close button */}
        {isMobile && isMobileOpen && (
          <button
            onClick={closeMobileSidebar}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {!actuallyCollapsed ? (
          /* Expanded State - Inline Logo with Subheading */
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-white tracking-tight relative logo-shine flex-shrink-0">
              CORE
            </h1>
            <span className="text-xs text-slate-400 font-normal truncate">
              Commercialization & Research Evaluator
            </span>
          </div>
        ) : (
          /* Collapsed State - Logo that disappears on hover, replaced by expand button */
          <div
            className="relative cursor-pointer flex items-center justify-center w-full"
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            onClick={() => setIsCollapsed(false)}
          >
            {/* Logo Text - Disappears on hover with shining effect */}
            <div
              className={`text-white font-semibold text-lg tracking-tight transition-all duration-200 relative logo-shine ${
                isLogoHovered ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              CORE
            </div>

            {/* Expand Button - Replaces logo completely on hover */}
            {actuallyCollapsed && isLogoHovered && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed(false);
                }}
                className="absolute inset-0 flex items-center justify-center text-white"
                aria-label="Expand sidebar"
              >
                <FiChevronRight className="h-8 w-8" />
              </button>
            )}
          </div>
        )}

        {/* Collapse Button - Only show in expanded state */}
        {!actuallyCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="rounded-lg p-2 text-slate-400 transition-all duration-200 hover:text-white hover:bg-slate-800/50"
            aria-label="Collapse sidebar"
          >
            <FiChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col">
        {/* Main Navigation Items */}
        <div className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`group relative w-full rounded-lg transition-all duration-200 block ${
                actuallyCollapsed ? "px-3 py-3" : "px-3 py-2.5"
              } ${
                currentActiveView === item.key
                  ? "bg-emerald-500 text-white font-medium"
                  : "text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400"
              }`}
              title={actuallyCollapsed ? item.label : undefined}
              onClick={() => {
                // Call onNavigate if provided (for backward compatibility)
                onNavigate?.(item.key);
                // Close mobile sidebar on navigation
                closeMobileSidebar();
              }}
            >
              <div
                className={`flex items-center ${
                  actuallyCollapsed ? "justify-center" : "gap-4"
                }`}
              >
                <item.icon
                  className={`flex-shrink-0 transition-all duration-200 ${
                    currentActiveView === item.key
                      ? "text-white"
                      : "text-current"
                  }`}
                  size={actuallyCollapsed ? 18 : 16}
                />
                {!actuallyCollapsed && (
                  <span className="font-normal text-sm truncate">
                    {item.label}
                  </span>
                )}
              </div>

              {/* Tooltip for collapsed state */}
              {actuallyCollapsed && (
                <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-md bg-slate-900/95 border border-slate-700/50 px-3 py-2 text-sm text-slate-200 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 backdrop-blur-sm">
                  <div className="font-medium text-white">{item.label}</div>
                  <div className="text-xs text-slate-400 mt-1 max-w-44">
                    {item.description}
                  </div>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900/95"></div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Bottom Navigation Items */}
        <div className="mt-auto pt-4 border-t border-slate-200/5">
          <div className="space-y-2">
            {BOTTOM_NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`group relative w-full rounded-lg transition-all duration-200 block ${
                  actuallyCollapsed ? "px-3 py-3" : "px-3 py-2.5"
                } ${
                  currentActiveView === item.key
                    ? "bg-emerald-500 text-white font-medium"
                    : "text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400"
                }`}
                title={actuallyCollapsed ? item.label : undefined}
                onClick={() => {
                  // Call onNavigate if provided (for backward compatibility)
                  onNavigate?.(item.key);
                  // Close mobile sidebar on navigation
                  closeMobileSidebar();
                }}
              >
                <div
                  className={`flex items-center ${
                    actuallyCollapsed ? "justify-center" : "gap-4"
                  }`}
                >
                  <item.icon
                    className={`flex-shrink-0 transition-all duration-200 ${
                      currentActiveView === item.key
                        ? "text-white"
                        : "text-current"
                    }`}
                    size={actuallyCollapsed ? 18 : 16}
                  />
                  {!actuallyCollapsed && (
                    <span className="font-normal text-sm truncate">
                      {item.label}
                    </span>
                  )}
                </div>

                {/* Tooltip for collapsed state */}
                {actuallyCollapsed && (
                  <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-md bg-slate-900/95 border border-slate-700/50 px-3 py-2 text-sm text-slate-200 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 backdrop-blur-sm">
                    <div className="font-medium text-white">{item.label}</div>
                    <div className="text-xs text-slate-400 mt-1 max-w-44">
                      {item.description}
                    </div>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900/95"></div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Account Section */}
      <div className="border-t border-slate-200/5 px-3 py-4 mt-auto">
        <SafeSignedOut>
          <div className="space-y-2">
            {actuallyCollapsed ? (
              <div className="flex flex-col gap-2">
                <SafeSignInButton mode="modal">
                  <button
                    className="group relative w-full rounded-lg transition-all duration-200 flex items-center p-3 justify-center bg-emerald-500 hover:bg-emerald-600 text-white"
                    title="Sign In"
                  >
                    <FiUser size={14} />
                    {/* Tooltip for collapsed state */}
                    <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-md bg-slate-900/95 border border-slate-700/50 px-3 py-2 text-sm text-slate-200 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 backdrop-blur-sm">
                      <div className="font-medium text-white">Sign In</div>
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900/95"></div>
                    </div>
                  </button>
                </SafeSignInButton>
              </div>
            ) : (
              <div className="space-y-2">
                <SafeSignInButton mode="modal">
                  <button className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-medium transition-all duration-200">
                    Sign In
                  </button>
                </SafeSignInButton>
                <SafeSignUpButton mode="modal">
                  <button className="w-full rounded-lg border border-slate-600 hover:border-emerald-500 text-slate-300 hover:text-emerald-400 px-4 py-2 text-sm font-medium transition-all duration-200">
                    Sign Up
                  </button>
                </SafeSignUpButton>
              </div>
            )}
          </div>
        </SafeSignedOut>

        <SafeSignedIn>
          <div className="relative">
            {actuallyCollapsed ? (
              <div className="flex justify-center">
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
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
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
                <AuthenticatedUserInfo actuallyCollapsed={actuallyCollapsed} />
              </div>
            )}
          </div>
        </SafeSignedIn>
      </div>
    </aside>
    </>
  );
}
