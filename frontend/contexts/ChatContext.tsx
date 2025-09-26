"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ChatContextType {
  isChatOpen: boolean;
  currentPage: string;
  uploadedResearch: string[];
  isMobile: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setCurrentPage: (page: string) => void;
  setUploadedResearch: (research: string[]) => void;
  setIsMobile: (mobile: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [uploadedResearch, setUploadedResearch] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const openChat = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  const value: ChatContextType = {
    isChatOpen,
    currentPage,
    uploadedResearch,
    isMobile,
    openChat,
    closeChat,
    toggleChat,
    setCurrentPage,
    setUploadedResearch,
    setIsMobile,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

// Hook for components that need to trigger chat with specific context
export function useChatTrigger() {
  const { openChat, setCurrentPage, setUploadedResearch } = useChatContext();
  
  const openChatWithContext = useCallback((page?: string, research?: string[]) => {
    if (page) setCurrentPage(page);
    if (research) setUploadedResearch(research);
    openChat();
  }, [openChat, setCurrentPage, setUploadedResearch]);

  return { openChatWithContext };
}

// Hook for getting chat state without triggering re-renders
export function useChatState() {
  const { isChatOpen, currentPage, uploadedResearch, isMobile } = useChatContext();
  return { isChatOpen, currentPage, uploadedResearch, isMobile };
}