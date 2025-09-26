"use client";

import { useState, useRef, useCallback } from "react";
import {
  LuFile,
  LuPaperclip,
  LuLink,
  LuCircleCheck,
  LuZap,
  LuUpload,
  LuSearch,
  LuUsers,
  LuHandshake,
  LuBot,
  LuChartBar,
  LuEye,
  LuFlaskConical,
  LuFileText,
  LuArrowRight,
  LuLoader,
} from "react-icons/lu";

type DashboardCardsProps = {
  onDocumentUpload: (data: {
    title: string;
    abstract: string;
    body?: string;
  }) => void;
  onNavigate: (view: string) => void;
  isUploading: boolean;
  hasDocument: boolean;
};

type UploadMode = "pdf" | "url";

type AnalysisCard = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  disabled?: boolean;
};

const analysisCards: AnalysisCard[] = [
  {
    id: "insights",
    title: "Track 1: Tech Transfer Insights",
    description: "Comprehensive analysis including novelty assessment, competitive intelligence, and commercialization opportunities",
    icon: LuSearch,
    color: "emerald",
  },
  {
    id: "patents",
    title: "Patent Radar",
    description: "Discover related patents and IP landscape",
    icon: LuEye,
    color: "blue",
  },
  {
    id: "stakeholders",
    title: "Stakeholder Network",
    description: "Identify key inventors, assignees, and institutions",
    icon: LuUsers,
    color: "purple",
  },
  {
    id: "licensing",
    title: "Licensing Opportunities",
    description: "Find commercialization and licensing prospects",
    icon: LuHandshake,
    color: "orange",
  },
  {
    id: "vc-lens",
    title: "VC Lens",
    description: "Startup evaluation and investment analysis",
    icon: LuChartBar,
    color: "green",
  },
  {
    id: "gtm-lab",
    title: "GTM Lab",
    description: "Go-to-market strategy development",
    icon: LuFlaskConical,
    color: "indigo",
  },
];

export function DashboardCards({
  onDocumentUpload,
  onNavigate,
  isUploading,
  hasDocument,
}: DashboardCardsProps) {
  const [uploadMode, setUploadMode] = useState<UploadMode>("pdf");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((file) => file.type === "application/pdf");

    if (pdfFile) {
      handleFileUpload(pdfFile);
    }
  }, []);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);

    // Simulate file processing
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          // Simulate extracted data
          onDocumentUpload({
            title: file.name.replace(".pdf", ""),
            abstract: "Extracted abstract from PDF document...",
            body: "Extracted full text content from PDF...",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUrlExtract = () => {
    if (!url.trim()) return;

    setIsProcessing(true);
    setUploadProgress(0);

    // Simulate URL extraction
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          // Simulate extracted data
          onDocumentUpload({
            title: "Extracted Title from URL",
            abstract: "Extracted abstract from web content...",
            body: "Extracted full content from URL...",
          });
          setUrl("");
          return 100;
        }
        return prev + 15;
      });
    }, 300);
  };

  const handleAnalysisCardClick = (cardId: string) => {
    if (!hasDocument) return;
    onNavigate(cardId);
  };

  const getColorClasses = (color: string, disabled: boolean = false) => {
    if (disabled) {
      return {
        border: "border-slate-700",
        bg: "bg-slate-900/30",
        text: "text-slate-500",
        icon: "text-slate-600",
        hover: "",
      };
    }

    const colorMap: Record<string, any> = {
      emerald: {
        border: "border-emerald-500/20",
        bg: "bg-emerald-500/5",
        text: "text-emerald-300",
        icon: "text-emerald-400",
        hover: "hover:border-emerald-400/40 hover:bg-emerald-500/10",
      },
      blue: {
        border: "border-blue-500/20",
        bg: "bg-blue-500/5",
        text: "text-blue-300",
        icon: "text-blue-400",
        hover: "hover:border-blue-400/40 hover:bg-blue-500/10",
      },
      purple: {
        border: "border-purple-500/20",
        bg: "bg-purple-500/5",
        text: "text-purple-300",
        icon: "text-purple-400",
        hover: "hover:border-purple-400/40 hover:bg-purple-500/10",
      },
      orange: {
        border: "border-orange-500/20",
        bg: "bg-orange-500/5",
        text: "text-orange-300",
        icon: "text-orange-400",
        hover: "hover:border-orange-400/40 hover:bg-orange-500/10",
      },
      green: {
        border: "border-green-500/20",
        bg: "bg-green-500/5",
        text: "text-green-300",
        icon: "text-green-400",
        hover: "hover:border-green-400/40 hover:bg-green-500/10",
      },
      indigo: {
        border: "border-indigo-500/20",
        bg: "bg-indigo-500/5",
        text: "text-indigo-300",
        icon: "text-indigo-400",
        hover: "hover:border-indigo-400/40 hover:bg-indigo-500/10",
      },
    };

    return colorMap[color] || colorMap.emerald;
  };

  return (
    <div className="space-y-8">
      {/* Document Upload Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <LuUpload className="text-2xl text-emerald-300" size={24} />
          <h2 className="text-2xl font-bold text-emerald-300">
            Document Upload
          </h2>
        </div>

        {/* Upload Mode Tabs */}
        <div className="flex rounded-lg bg-slate-800/50 p-1 w-fit">
          <button
            onClick={() => setUploadMode("pdf")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              uploadMode === "pdf"
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LuPaperclip size={16} className="inline mr-2" /> PDF Upload
          </button>
          <button
            onClick={() => setUploadMode("url")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              uploadMode === "url"
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LuLink size={16} className="inline mr-2" /> URL Extract
          </button>
        </div>

        {/* Upload Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PDF Upload Card */}
          {uploadMode === "pdf" && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <LuFile size={20} className="text-emerald-400" />
                PDF Document Upload
              </h3>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                  isDragOver
                    ? "border-emerald-400 bg-emerald-500/10"
                    : "border-slate-600 hover:border-slate-500"
                }`}
                onClick={handleFileSelect}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                />

                {uploadedFile ? (
                  <div className="space-y-3">
                    <LuCircleCheck
                      className="text-emerald-400 mx-auto"
                      size={32}
                    />
                    <p className="text-slate-300 font-medium">
                      {uploadedFile.name}
                    </p>
                    {isProcessing && (
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                    {!isProcessing && (
                      <p className="text-emerald-400 text-sm flex items-center justify-center gap-1">
                        <LuZap size={16} />
                        Content extracted successfully!
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <LuPaperclip className="text-slate-400 mx-auto" size={32} />
                    <div>
                      <p className="text-slate-300 font-medium">
                        Drop PDF here or click to browse
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        Supports PDF files up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* URL Extract Card */}
          {uploadMode === "url" && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <LuLink size={20} className="text-emerald-400" />
                URL Content Extraction
              </h3>

              <div className="space-y-4">
                <div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter research paper URL..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  onClick={handleUrlExtract}
                  disabled={!url.trim() || isProcessing}
                  className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-medium text-slate-950 transition-all hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <LuLoader size={16} className="animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <LuZap size={16} />
                      Extract Content
                    </>
                  )}
                </button>

                {isProcessing && (
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Cards Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <LuChartBar className="text-2xl text-emerald-300" size={24} />
          <h2 className="text-2xl font-bold text-emerald-300">
            Analysis & Insights
          </h2>
          {!hasDocument && (
            <span className="text-sm text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
              Upload a document to enable
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analysisCards.map((card) => {
            const disabled = !hasDocument;
            const colors = getColorClasses(card.color, disabled);
            const IconComponent = card.icon;

            return (
              <div
                key={card.id}
                onClick={() => handleAnalysisCardClick(card.id)}
                className={`rounded-xl border p-6 shadow-lg transition-all duration-200 ${
                  disabled
                    ? "cursor-not-allowed"
                    : "cursor-pointer transform hover:scale-105"
                } ${colors.border} ${colors.bg} ${colors.hover}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <IconComponent size={24} className={colors.icon} />
                  {!disabled && (
                    <LuArrowRight
                      size={16}
                      className={`${colors.icon} opacity-0 group-hover:opacity-100 transition-opacity`}
                    />
                  )}
                </div>

                <h3 className={`text-lg font-semibold mb-2 ${colors.text}`}>
                  {card.title}
                </h3>

                <p className="text-slate-400 text-sm leading-relaxed">
                  {card.description}
                </p>

                {disabled && (
                  <div className="mt-4 text-xs text-slate-600 flex items-center gap-1">
                    <LuFileText size={12} />
                    Document required
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
