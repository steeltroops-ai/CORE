"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ChatSidebar } from "./ChatSidebar";
import { ChatProvider, useChatContext } from "../contexts/ChatContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isTablet, setIsTablet] = useState(false);
  const { isChatOpen, isMobile, closeChat, setIsMobile } = useChatContext();

  // Enhanced responsive breakpoint handling
  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // md breakpoint
      setIsTablet(width >= 768 && width < 1024); // md to lg breakpoint
    };
    
    checkBreakpoints();
    window.addEventListener('resize', checkBreakpoints);
    return () => window.removeEventListener('resize', checkBreakpoints);
  }, [setIsMobile]);

  // Auto-collapse sidebar on mobile and tablet
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  // Handle escape key to close chat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isChatOpen) {
        closeChat();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isChatOpen, closeChat]);

  // Responsive layout calculations
  const chatSidebarWidth = isMobile ? '100vw' : isTablet ? '320px' : '384px';
  const mainContentMargin = (() => {
    if (isMobile) return '0';
    return sidebarCollapsed ? '64px' : '256px';
  })();

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar 
        onSidebarStateChange={setSidebarCollapsed} 
        isMobile={isMobile}
        isTablet={isTablet}
      />
      
      {/* Header */}
      <Header 
        sidebarCollapsed={sidebarCollapsed} 
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Layout Container */}
      <div className="flex h-screen pt-14 md:pt-16">
        {/* Dashboard Content Area */}
        <main
          className={`flex-1 chat-content-transition overflow-auto transition-all duration-300 ease-in-out`}
          style={{
            marginLeft: mainContentMargin,
            marginRight: isChatOpen ? (isMobile ? '0' : chatSidebarWidth) : '0',
          }}
        >
          <div className="px-3 py-3 xs:px-4 xs:py-4 sm:px-6 sm:py-4 lg:px-8 lg:py-6 h-full">
            {children}
          </div>
        </main>

        {/* Chat Sidebar */}
        <ChatSidebar />
      </div>

      {/* Overlay for mobile when chat is open */}
      {isMobile && isChatOpen && (
        <div 
          className="fixed inset-0 mobile-chat-overlay z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={closeChat}
          onTouchStart={closeChat}
          aria-label="Close chat overlay"
        />
      )}
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ChatProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </ChatProvider>
  );
}
