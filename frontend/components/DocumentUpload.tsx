"use client";

import { useState, useRef, useCallback } from "react";
import {
  LuFile,
  LuPaperclip,
  LuLink,
  LuCircleCheck,
  LuZap,
  LuUpload,
  LuLoader,
  LuTriangleAlert,
  LuX,
} from "react-icons/lu";

type DocumentUploadProps = {
  onUpload: (data: {
    title: string;
    abstract: string;
    body?: string;
    file?: File;
    url?: string;
  }) => void;
  isUploading?: boolean;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
};

type UploadMode = "pdf" | "url";
type UploadStatus = "idle" | "processing" | "success" | "error";

export function DocumentUpload({
  onUpload,
  isUploading = false,
  maxFileSize = 10,
  acceptedTypes = [".pdf"],
  className = "",
}: DocumentUploadProps) {
  const [uploadMode, setUploadMode] = useState<UploadMode>("pdf");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{
    title: string;
    abstract: string;
    body?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(
        ", "
      )}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return `File size too large. Maximum size: ${maxFileSize}MB`;
    }

    return null;
  };

  const validateUrl = (url: string): string | null => {
    try {
      new URL(url);
      return null;
    } catch {
      return "Please enter a valid URL";
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUrl("");
    setUploadProgress(0);
    setUploadStatus("idle");
    setError(null);
    setExtractedData(null);
  };

  const simulateExtraction = (
    source: File | string
  ): Promise<{
    title: string;
    abstract: string;
    body: string;
  }> => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            const result = {
              title:
                source instanceof File
                  ? source.name.replace(/\.[^/.]+$/, "")
                  : "Extracted Title from URL",
              abstract:
                source instanceof File
                  ? "Extracted abstract from PDF document. This contains key findings and research objectives."
                  : "Extracted abstract from web content. This summarizes the main research contributions.",
              body:
                source instanceof File
                  ? "Full text content extracted from PDF including methodology, results, and conclusions."
                  : "Complete content extracted from URL including all sections and references.",
            };
            resolve(result);
            return 100;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 150);
    });
  };

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
    const file = files[0];

    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setUploadStatus("error");
      return;
    }

    setUploadedFile(file);
    setUploadStatus("processing");
    setError(null);
    setUploadProgress(0);

    try {
      const extracted = await simulateExtraction(file);
      setExtractedData(extracted);
      setUploadStatus("success");

      onUpload({
        ...extracted,
        file,
      });
    } catch (err) {
      setError("Failed to process file. Please try again.");
      setUploadStatus("error");
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUrlExtract = async () => {
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      setUploadStatus("error");
      return;
    }

    setUploadStatus("processing");
    setError(null);
    setUploadProgress(0);

    try {
      const extracted = await simulateExtraction(url);
      setExtractedData(extracted);
      setUploadStatus("success");

      onUpload({
        ...extracted,
        url,
      });
    } catch (err) {
      setError("Failed to extract content from URL. Please try again.");
      setUploadStatus("error");
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case "processing":
        return <LuLoader className="animate-spin text-emerald-400" size={32} />;
      case "success":
        return <LuCircleCheck className="text-emerald-400" size={32} />;
      case "error":
        return <LuTriangleAlert className="text-red-400" size={32} />;
      default:
        return uploadMode === "pdf" ? (
          <LuPaperclip className="text-slate-400" size={32} />
        ) : (
          <LuLink className="text-slate-400" size={32} />
        );
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case "processing":
        return "Processing document...";
      case "success":
        return (
          <div className="space-y-2">
            <p className="text-emerald-400 font-medium flex items-center gap-2">
              <LuZap size={16} />
              Content extracted successfully!
            </p>
            {extractedData && (
              <div className="text-left space-y-1">
                <p className="text-slate-300 font-medium">
                  {extractedData.title}
                </p>
                <p className="text-slate-400 text-sm">
                  {extractedData.abstract}
                </p>
              </div>
            )}
          </div>
        );
      case "error":
        return (
          <div className="space-y-2">
            <p className="text-red-400 font-medium">Upload failed</p>
            {error && <p className="text-red-300 text-sm">{error}</p>}
          </div>
        );
      default:
        return uploadMode === "pdf" ? (
          <div>
            <p className="text-slate-300 font-medium">
              Drop PDF here or click to browse
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Supports {acceptedTypes.join(", ")} files up to {maxFileSize}MB
            </p>
          </div>
        ) : (
          <div>
            <p className="text-slate-300 font-medium">
              Enter research paper URL
            </p>
            <p className="text-slate-500 text-sm mt-1">
              We&apos;ll extract the content automatically
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LuUpload className="text-emerald-300" size={24} />
          <h3 className="text-xl font-semibold text-emerald-300">
            Document Upload
          </h3>
        </div>

        {(uploadStatus === "success" || uploadStatus === "error") && (
          <button
            onClick={resetUpload}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset upload"
          >
            <LuX size={20} />
          </button>
        )}
      </div>

      {/* Upload Mode Tabs */}
      <div className="flex rounded-lg bg-slate-800/50 p-1 w-fit">
        <button
          onClick={() => setUploadMode("pdf")}
          disabled={uploadStatus === "processing"}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
            uploadMode === "pdf"
              ? "bg-emerald-500 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <LuPaperclip size={16} className="inline mr-2" /> PDF Upload
        </button>
        <button
          onClick={() => setUploadMode("url")}
          disabled={uploadStatus === "processing"}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
            uploadMode === "url"
              ? "bg-emerald-500 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <LuLink size={16} className="inline mr-2" /> URL Extract
        </button>
      </div>

      {/* Upload Area */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
        {uploadMode === "pdf" ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={uploadStatus === "idle" ? handleFileSelect : undefined}
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-all ${
              uploadStatus === "idle" ? "cursor-pointer" : ""
            } ${
              isDragOver
                ? "border-emerald-400 bg-emerald-500/10"
                : uploadStatus === "error"
                ? "border-red-500/50 bg-red-500/5"
                : uploadStatus === "success"
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-slate-600 hover:border-slate-500"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(",")}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
              disabled={uploadStatus === "processing"}
            />

            <div className="space-y-4">
              {getStatusIcon()}
              {getStatusMessage()}

              {uploadStatus === "processing" && (
                <div className="w-full bg-slate-700 rounded-full h-2 max-w-xs mx-auto">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-6">
              {getStatusIcon()}
              <div className="mt-4">{getStatusMessage()}</div>
            </div>

            <div className="space-y-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/research-paper"
                disabled={uploadStatus === "processing"}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              />

              <button
                onClick={handleUrlExtract}
                disabled={!url.trim() || uploadStatus === "processing"}
                className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-medium text-slate-950 transition-all hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadStatus === "processing" ? (
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

              {uploadStatus === "processing" && (
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
  );
}
