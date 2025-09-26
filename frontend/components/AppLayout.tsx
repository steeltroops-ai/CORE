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
  const { isChatOpen, isMobile, closeChat, setIsMobile } = useChatContext();

  // Handle responsive breakpoints
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

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

  const chatSidebarWidth = isMobile ? '100vw' : '384px'; // w-96 = 384px
  const mainContentMargin = sidebarCollapsed ? (isMobile ? '0' : '64px') : (isMobile ? '0' : '256px');

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar onSidebarStateChange={setSidebarCollapsed} />
      
      {/* Header */}
      <Header sidebarCollapsed={sidebarCollapsed} />

      {/* Main Layout Container */}
      <div className="flex h-screen pt-[56px]">
        {/* Dashboard Content Area */}
        <main
          className={`flex-1 chat-content-transition overflow-auto`}
          style={{
            marginLeft: mainContentMargin,
            marginRight: isChatOpen ? (isMobile ? '0' : chatSidebarWidth) : '0',
          }}
        >
          <div className="px-6 py-4 h-full">{children}</div>
        </main>

        {/* Chat Sidebar */}
        <ChatSidebar />
      </div>

      {/* Overlay for mobile when chat is open */}
      {isMobile && isChatOpen && (
        <div 
          className="fixed inset-0 mobile-chat-overlay z-40 md:hidden"
          onClick={closeChat}
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
