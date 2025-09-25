"use client";

import { useState, useRef, useCallback } from "react";
import { LuFile, LuPencil, LuPaperclip, LuLink, LuCircleCheck, LuZap, LuFolder, LuSend } from "react-icons/lu";

type UploadPanelProps = {
  onSubmit: (data: {
    title: string;
    abstract: string;
    body?: string;
  }) => void;
  isSubmitting: boolean;
};

type UploadMode = 'manual' | 'pdf' | 'url';

export function UploadPanel({ onSubmit, isSubmitting }: UploadPanelProps) {
  const [mode, setMode] = useState<UploadMode>('manual');
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !abstract.trim()) return;

    onSubmit({
      title: title.trim(),
      abstract: abstract.trim(),
      body: body.trim() || undefined,
    });

    // Reset form
    setTitle("");
    setAbstract("");
    setBody("");
    setUrl("");
    setUploadedFile(null);
    setUploadProgress(0);
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
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      handleFileUpload(pdfFile);
    }
  }, []);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setMode('pdf');
    
    // Simulate file processing
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Simulate extracted data
          setTitle(file.name.replace('.pdf', ''));
          setAbstract('Extracted abstract from PDF document...');
          setBody('Extracted full text content from PDF...');
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
    
    setMode('url');
    setUploadProgress(0);
    
    // Simulate URL extraction
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Simulate extracted data
          setTitle('Extracted Title from URL');
          setAbstract('Extracted abstract from web content...');
          setBody('Extracted full content from URL...');
          return 100;
        }
        return prev + 15;
      });
    }, 300);
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
      <h3 className="mb-6 text-lg font-semibold text-emerald-300 flex items-center gap-2">
        <LuFile size={20} />
        Ingest Research
      </h3>

      {/* Upload Mode Tabs */}
      <div className="mb-6 flex rounded-lg bg-slate-800/50 p-1">
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
            mode === 'manual'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LuPencil size={16} className="inline mr-1" /> Manual Entry
        </button>
        <button
          onClick={() => setMode('pdf')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
            mode === 'pdf'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LuPaperclip size={16} className="inline mr-1" /> PDF Upload
        </button>
        <button
          onClick={() => setMode('url')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
            mode === 'url'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LuLink size={16} className="inline mr-1" /> URL Extract
        </button>
      </div>

      {/* PDF Upload Area */}
      {mode === 'pdf' && (
        <div className="mb-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-all ${
              isDragOver
                ? 'border-emerald-400 bg-emerald-500/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
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
                <LuCircleCheck className="text-emerald-400 mx-auto" size={32} />
                <p className="text-slate-300 font-medium">{uploadedFile.name}</p>
                {uploadProgress < 100 && (
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
                {uploadProgress === 100 && (
                  <p className="text-emerald-400 text-sm flex items-center justify-center gap-1">
                    <LuZap size={16} />
                    Content extracted successfully!
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <LuFile className="text-slate-400 mx-auto" size={48} />
                <div>
                  <p className="text-slate-300 font-medium">Drop PDF files here</p>
                  <p className="text-slate-400 text-sm">or click to browse</p>
                </div>
                <button
                  onClick={handleFileSelect}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <LuFolder size={16} className="inline mr-1" /> Choose File
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* URL Input */}
      {mode === 'url' && (
        <div className="mb-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Research URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="https://example.com/research-paper"
              />
              <button
                onClick={handleUrlExtract}
                disabled={!url.trim() || uploadProgress > 0}
                className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Extract
              </button>
            </div>
          </div>
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                Extracting content...
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {uploadProgress === 100 && (
            <p className="text-emerald-400 text-sm flex items-center gap-2">
              <LuZap size={16} />
              Content extracted successfully!
            </p>
          )}
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Research Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Enter research title..."
            required
          />
        </div>

        <div>
          <label
            htmlFor="abstract"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Abstract *
          </label>
          <textarea
            id="abstract"
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Enter research abstract..."
            required
          />
        </div>

        <div>
          <label
            htmlFor="body"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Full Text (Optional)
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Enter full research text (optional)..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !abstract.trim()}
          className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full"></div>
              Processing...
            </>
          ) : (
            <>
              <LuSend size={16} />
              Analyze Research
            </>
          )}
        </button>
      </form>
    </div>
  );
}
