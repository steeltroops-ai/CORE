"use client";

import { useState, useRef, useEffect } from "react";
import {
  FiMessageCircle,
  FiX,
  FiSend,
  FiMic,
  FiMicOff,
  FiBarChart2,
  FiFileText,
  FiTrendingUp,
  FiMinimize2,
} from "react-icons/fi";

type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

type FloatingChatProps = {
  currentPage?: string;
  uploadedResearch?: string[];
};

export function FloatingChat({
  currentPage = "dashboard",
  uploadedResearch = [],
}: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `Hello! I'm your CORE assistant. I can help you analyze research, explain charts, and generate insights. Currently viewing: ${currentPage}`,
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${message}". Based on your current context (${currentPage}) and uploaded research, here's my analysis...`,
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    let actionMessage = "";
    switch (action) {
      case "explain-chart":
        actionMessage =
          "Can you explain the current chart or visualization on this page?";
        break;
      case "summarize-paper":
        actionMessage =
          "Please summarize the key findings from the uploaded research papers.";
        break;
      case "generate-pitch":
        actionMessage =
          "Generate a pitch deck based on the current analysis and research.";
        break;
    }
    setMessage(actionMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        aria-label="Open chat assistant"
      >
        <FiMessageCircle
          size={24}
          className="group-hover:scale-110 transition-transform"
        />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
          !
        </div>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
      }`}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <FiMessageCircle size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                CORE Assistant
              </h3>
              <p className="text-xs text-slate-400">
                {isVoiceEnabled ? "Voice enabled" : "Text mode"} • {currentPage}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                isVoiceEnabled
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              title={isVoiceEnabled ? "Disable voice" : "Enable voice"}
            >
              {isVoiceEnabled ? <FiMic size={16} /> : <FiMicOff size={16} />}
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              <FiMinimize2 size={16} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              title="Close chat"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.sender === "user"
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 opacity-70`}>
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-200 p-3 rounded-lg text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-slate-700">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => handleQuickAction("explain-chart")}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
                >
                  <FiBarChart2 size={14} />
                  Explain Chart
                </button>
                <button
                  onClick={() => handleQuickAction("summarize-paper")}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
                >
                  <FiFileText size={14} />
                  Summarize Paper
                </button>
                <button
                  onClick={() => handleQuickAction("generate-pitch")}
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
          </>
        )}
      </div>
    </div>
  );
}
