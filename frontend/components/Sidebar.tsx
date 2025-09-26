"use client";

import { useState, useEffect } from "react";
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
import { LuLightbulb } from "react-icons/lu";

type SidebarProps = {
  activeView: string;
  onNavigate: (view: string) => void;
  onSidebarStateChange?: (isCollapsed: boolean) => void;
};

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: FiHome,
    description: "Display overview, recent uploads, and quick statistics",
  },
  {
    key: "insights",
    label: "Insights",
    icon: FiEye,
    description: "Analyze novelty, competitors, and licensing data",
  },
  {
    key: "vc-lens",
    label: "VC Lens",
    icon: FiTrendingUp,
    description: "Startup evaluation dashboard",
  },
  {
    key: "gtm-lab",
    label: "GTM Lab",
    icon: FiTarget,
    description: "Product development and go-to-market strategy generation",
  },
  {
    key: "assistant",
    label: "Assistant",
    icon: FiMessageSquare,
    description: "Direct access to AI chat assistant",
  },
  {
    key: "research-papers",
    label: "Research Papers",
    icon: FiUpload,
    description: "Manage uploaded research papers and studies",
  },
];

export function Sidebar({
  activeView,
  onNavigate,
  onSidebarStateChange,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  // Use only the collapsed state
  const actuallyCollapsed = isCollapsed;

  // Notify parent component of sidebar state changes
  useEffect(() => {
    onSidebarStateChange?.(actuallyCollapsed);
    // Reset hover state when sidebar expands
    if (!actuallyCollapsed) {
      setIsLogoHovered(false);
    }
  }, [actuallyCollapsed, onSidebarStateChange]);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-full transition-all duration-300 ease-in-out ${
        actuallyCollapsed ? "w-20" : "w-72"
      } flex flex-col border-r border-slate-800/50 bg-gradient-to-b from-slate-950/98 to-slate-900/98 backdrop-blur-xl shadow-2xl`}
    >
      {/* Logo and Toggle Section */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/50">
        {!actuallyCollapsed ? (
          /* Expanded State - Inline Logo with Subheading */
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-emerald-300 tracking-tight">
              CORE
            </h1>
            <span className="text-xs text-slate-400 font-medium tracking-wide">
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
            {/* Logo Text - Disappears on hover */}
            <div 
              className={`text-emerald-300 font-bold text-xl tracking-tight transition-all duration-200 ${
                isLogoHovered ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
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
                className="absolute inset-0 flex items-center justify-center text-emerald-300"
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
            className="rounded-lg p-2 bg-slate-800/50 text-slate-400 transition-all duration-200 hover:bg-emerald-500/20 hover:text-emerald-300 hover:scale-105"
            aria-label="Collapse sidebar"
          >
            <FiChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`group relative w-full rounded-xl transition-all duration-200 ${
                actuallyCollapsed ? "px-3 py-4" : "px-4 py-3"
              } ${
                activeView === item.key
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-emerald-300 hover:scale-[1.01]"
              }`}
              title={actuallyCollapsed ? item.label : undefined}
            >
              <div
                className={`flex items-center ${
                  actuallyCollapsed ? "justify-center" : "gap-4"
                }`}
              >
                <item.icon 
                  className={`flex-shrink-0 transition-all duration-200 ${
                    activeView === item.key ? "text-white" : "text-current"
                  }`} 
                  size={actuallyCollapsed ? 20 : 18} 
                />
                {!actuallyCollapsed && (
                  <span className="font-medium text-sm tracking-wide truncate">
                    {item.label}
                  </span>
                )}
              </div>

              {/* Tooltip for collapsed state */}
              {actuallyCollapsed && (
                <div className="absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-200 opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1 backdrop-blur-sm">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-slate-400 mt-1 max-w-48">
                    {item.description}
                  </div>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Account Section */}
      <div className="border-t border-slate-800/50 px-4 py-4 mt-auto">
        {!actuallyCollapsed ? (
          <>
            {/* User Profile */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 transition-all duration-200 cursor-pointer group border border-slate-800/30 hover:border-slate-700/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-lg">
                <FiUser size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">
                  John Doe
                </p>
                <p className="text-xs text-slate-400 truncate font-medium">
                  john@example.com
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-1 mt-4">
              <button
                onClick={() => onNavigate("settings")}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-300 hover:text-emerald-300 hover:bg-slate-800/60 rounded-xl transition-all duration-200 hover:scale-[1.01]"
              >
                <FiSettings size={16} className="flex-shrink-0" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => onNavigate("help")}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-300 hover:text-emerald-300 hover:bg-slate-800/60 rounded-xl transition-all duration-200 hover:scale-[1.01]"
              >
                <FiHelpCircle size={16} className="flex-shrink-0" />
                <span>Help & Support</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 hover:scale-[1.01] border border-transparent hover:border-red-500/20">
                <FiLogOut size={16} className="flex-shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </>
        ) : (
          /* Collapsed Account Section */
          <div className="flex flex-col items-center space-y-3">
            <button
              className="group relative w-full p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 transition-all duration-200 flex items-center justify-center border border-slate-800/30 hover:border-slate-700/50 hover:scale-105"
              title="Account Menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white">
                <FiUser size={16} />
              </div>
              {/* Enhanced Tooltip */}
              <div className="absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-sm text-slate-200 opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1 backdrop-blur-sm min-w-48">
                <div className="font-semibold text-emerald-300 mb-2">Account Menu</div>
                <div className="space-y-1 text-xs">
                  <div className="text-slate-300">John Doe</div>
                  <div className="text-slate-400">john@example.com</div>
                </div>
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
              </div>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
