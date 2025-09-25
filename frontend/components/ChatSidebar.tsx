"use client";

import { useState, useRef, useEffect } from "react";
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiMic,
  FiMicOff,
  FiBarChart2,
  FiFileText,
  FiTrendingUp,
  FiMinimize2
} from "react-icons/fi";

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

type ChatSidebarProps = {
  currentPage?: string;
  uploadedResearch?: string[];
  isOpen: boolean;
  onToggle: () => void;
};

// Backend API configuration
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";
const CHAT_ENDPOINT = `${BACKEND_API_URL}/chat`;
const CHAT_HEALTH_ENDPOINT = `${BACKEND_API_URL}/chat/health`;

export function ChatSidebar({ currentPage = 'dashboard', uploadedResearch = [], isOpen, onToggle }: ChatSidebarProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I'm your CORE assistant powered by Claude. I can help you analyze research, explain charts, and generate insights. Currently viewing: ${currentPage}`,
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const callClaudeAPI = async (userMessage: string): Promise<string> => {
    try {
      // Prepare context for the backend
      const context = `You are a CORE (Commercialization & Research Evaluator) assistant helping with ${currentPage} analysis. Current research: ${uploadedResearch.join(', ')}.`;
      
      // Prepare conversation history (last 5 messages for context)
      const conversationHistory = messages.slice(-5).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: context,
          conversation_history: conversationHistory
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Backend API error ${response.status}:`, errorText);
        
        if (response.status === 401) {
          return "I apologize, but there's an authentication issue with the AI service. Please contact your administrator.";
        } else if (response.status === 429) {
          return "I'm currently experiencing high demand. Please try again in a moment.";
        } else if (response.status >= 500) {
          return "The AI service is temporarily unavailable. Please try again later.";
        } else {
          return `I encountered an error (${response.status}). Please try rephrasing your question.`;
        }
      }

      const data = await response.json();
      
      if (!data.success) {
        console.error('Backend API error:', data.error);
        return data.error || "I encountered an error processing your request. Please try again.";
      }
      
      if (!data.response) {
        console.error('Invalid response format from backend:', data);
        return "I received an unexpected response format. Please try again.";
      }
      
      return data.response;
    } catch (error) {
      console.error('Backend API error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return "I'm having trouble connecting to the backend service. Please check your connection and ensure the backend server is running.";
      }
      
      return `I apologize, but I'm having trouble connecting to my backend service right now. Please ensure the Python backend is running and try again.`;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');
    setIsTyping(true);

    try {
      const claudeResponse = await callClaudeAPI(currentMessage);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: claudeResponse,
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    let actionMessage = '';
    switch (action) {
      case 'explain-chart':
        actionMessage = 'Can you explain the current chart or visualization on this page?';
        break;
      case 'summarize-paper':
        actionMessage = 'Please summarize the key findings from the uploaded research papers.';
        break;
      case 'generate-pitch':
        actionMessage = 'Generate a pitch deck based on the current analysis and research.';
        break;
    }
    setMessage(actionMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chatbot Button - Bottom Right */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
          aria-label="Open Chatbot"
        >
          <FiMessageSquare size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Chatbot</span>
        </button>
      )}

      {/* Chat Sidebar Panel */}
      <div className={`fixed right-0 top-0 z-50 h-full transition-all duration-300 ease-in-out ${
        isOpen ? 'w-96' : 'w-0'
      } bg-slate-900 border-l border-slate-700 shadow-2xl overflow-hidden`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <FiMessageSquare size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">CORE Chatbot</h3>
                <p className="text-xs text-slate-400">
                  {isVoiceEnabled ? 'Voice enabled' : 'Text mode'} • {currentPage}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  isVoiceEnabled 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title={isVoiceEnabled ? 'Disable voice' : 'Enable voice'}
              >
                {isVoiceEnabled ? <FiMic size={16} /> : <FiMicOff size={16} />}
              </button>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                title="Close chat"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-1 opacity-70`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-200 p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t border-slate-700">
            <div className="flex gap-2 mb-3 flex-wrap">
              <button
                onClick={() => handleQuickAction('explain-chart')}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
              >
                <FiBarChart2 size={14} />
                Explain Chart
              </button>
              <button
                onClick={() => handleQuickAction('summarize-paper')}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
              >
                <FiFileText size={14} />
                Summarize Paper
              </button>
              <button
                onClick={() => handleQuickAction('generate-pitch')}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
              >
                <FiTrendingUp size={14} />
                Generate Pitch
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your research..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}