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

  // Use only the collapsed state, no hover functionality
  const actuallyCollapsed = isCollapsed;

  // Notify parent component of sidebar state changes
  useEffect(() => {
    onSidebarStateChange?.(actuallyCollapsed);
  }, [actuallyCollapsed, onSidebarStateChange]);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-full transition-all duration-300 ease-in-out ${
        actuallyCollapsed ? "w-16" : "w-64"
      } flex flex-col gap-4 border-r border-slate-800 bg-slate-950/95 backdrop-blur-sm`}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-between p-4">
        {!actuallyCollapsed && (
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-emerald-300">CORE Control</h2>
            <p className="text-xs text-slate-400">
              Commercialization & Research Evaluator
            </p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-emerald-300"
          aria-label={actuallyCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className={`h-5 w-5 transition-transform duration-300 ${
              actuallyCollapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`group relative w-full rounded-lg px-3 py-3 text-left font-medium transition-all duration-200 ${
              activeView === item.key
                ? "bg-emerald-500 text-slate-950 shadow-lg"
                : "bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-emerald-300"
            }`}
            title={actuallyCollapsed ? item.label : undefined}
          >
            <div
              className={`flex items-center ${
                actuallyCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              <item.icon className="text-lg flex-shrink-0" size={18} />
              {!actuallyCollapsed && (
                <span className="text-sm truncate">{item.label}</span>
              )}
            </div>

            {/* Tooltip for collapsed state */}
            {actuallyCollapsed && (
              <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Account Section */}
      <div className="border-t border-slate-800 p-4 space-y-3">
        {!actuallyCollapsed ? (
          <>
            {/* User Profile */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 hover:bg-slate-800 transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-semibold text-sm">
                <FiUser size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  John Doe
                </p>
                <p className="text-xs text-slate-400 truncate">
                  john@example.com
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-1">
              <button
                onClick={() => onNavigate("settings")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-slate-300 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <FiSettings size={16} />
                Settings
              </button>
              <button
                onClick={() => onNavigate("help")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-slate-300 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <FiHelpCircle size={16} />
                Help & Support
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                <FiLogOut size={16} />
                Sign Out
              </button>
            </div>
          </>
        ) : (
          /* Collapsed Account Section */
          <div className="space-y-2">
            <button
              className="group relative w-full p-3 rounded-lg bg-slate-900/50 hover:bg-slate-800 transition-colors flex items-center justify-center"
              title="Account"
            >
              <FiUser
                className="text-slate-300 group-hover:text-emerald-300"
                size={18}
              />
              {/* Tooltip */}
              <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                Account
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
              </div>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
