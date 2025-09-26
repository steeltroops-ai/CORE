"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Link,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Play,
  Globe,
  Plus,
} from "lucide-react";

interface UploadedDocument {
  id: string;
  name: string;
  type: 'pdf' | 'url';
  size?: number;
  url?: string;
  file?: File;
  title: string;
  abstract: string;
  body?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface UploadAnalyzeCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  uploadType: 'pdf' | 'url';
  onAnalyze: (documents: UploadedDocument[]) => Promise<void>;
  isAnalyzing: boolean;
  className?: string;
}

const UploadAnalyzeCard: React.FC<UploadAnalyzeCardProps> = ({
  title,
  description,
  icon: Icon,
  uploadType,
  onAnalyze,
  isAnalyzing,
  className = "",
}) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (uploadType === 'pdf') {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  }, [uploadType]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    setError(null);
    
    for (const file of files) {
      if (file.type !== "application/pdf") {
        setError(`File "${file.name}" is not a PDF. Only PDF files are supported.`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }

      const documentId = `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newDocument: UploadedDocument = {
        id: documentId,
        name: file.name,
        type: 'pdf',
        size: file.size,
        file,
        title: file.name.replace('.pdf', ''),
        abstract: '',
        status: 'pending',
        progress: 0,
      };

      setDocuments(prev => [...prev, newDocument]);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    const documentId = `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newDocument: UploadedDocument = {
      id: documentId,
      name: urlInput,
      type: 'url',
      url: urlInput,
      title: 'URL Document',
      abstract: '',
      status: 'pending',
      progress: 0,
    };

    setDocuments(prev => [...prev, newDocument]);
    setUrlInput("");
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleAnalyze = async () => {
    if (documents.length === 0) {
      setError("Please upload at least one document before analyzing");
      return;
    }

    try {
      await onAnalyze(documents);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Analysis failed');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Icon className="h-4 w-4 text-emerald-400" />
          {title}
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        {uploadType === 'pdf' ? (
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              dragActive
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-600 hover:border-slate-500"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400 mb-2">
              Drag & drop PDF files here
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
            >
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-slate-300 text-xs">Document URL</Label>
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/document.pdf"
                className="bg-slate-900/50 border-slate-600 text-white text-xs"
              />
              <Button
                onClick={handleUrlSubmit}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
              >
                <Globe className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
            {error}
          </div>
        )}

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <Label className="text-slate-300 text-xs">Uploaded Documents</Label>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-700"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getStatusIcon(doc.status)}
                    <span className="text-xs text-white truncate">
                      {doc.name}
                    </span>
                    {doc.status === 'processing' && (
                      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                        {doc.progress}%
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(doc.id)}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {documents.some(doc => doc.status === 'processing') && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Processing...</span>
              <span className="text-slate-400">
                {Math.round(
                  documents.reduce((acc, doc) => acc + doc.progress, 0) / documents.length
                )}%
              </span>
            </div>
            <Progress
              value={
                documents.reduce((acc, doc) => acc + doc.progress, 0) / documents.length
              }
              className="h-1"
            />
          </div>
        )}

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={documents.length === 0 || isAnalyzing}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
          size="sm"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="h-3 w-3 mr-2" />
              Analyze Documents
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UploadAnalyzeCard;