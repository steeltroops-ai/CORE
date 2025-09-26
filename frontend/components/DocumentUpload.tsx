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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  Link,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Plus,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  Globe,
  FileUp,
  Edit3,
  Save,
} from "lucide-react";
import {
  extractPdfContent,
  extractUrlContent,
  validateExtractedContent,
  type ExtractedContent,
  type ExtractionProgress,
} from "@/lib/documentExtraction";
import {
  encodeDocumentAndSimilaritySearch,
  formatDocumentForLogicMill,
  validateDocumentData,
  type SimilaritySearchResult,
} from "@/lib/logicMillApi";
import {
  enhancedDocumentExtraction,
  extractSearchParameters,
  validateExtractionQuality,
  formatForLogicMillApi,
  getExtractionRecommendations,
  cachedEnhancedExtraction,
  type EnhancedExtractionResponse,
  type ExtractedResearchData,
  type EnhancedSimilarityResult,
  type ValidationResults,
} from "@/lib/enhancedExtractionApi";

interface UploadedDocument {
  id: string;
  name: string;
  type: "pdf" | "url";
  size?: number;
  url?: string;
  file?: File;
  title: string;
  abstract: string;
  body?: string;
  authors?: string[];
  doi?: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
  extractedContent?: ExtractedContent;
  extractionProgress?: ExtractionProgress;
  isEditing?: boolean;
  apiResults?: SimilaritySearchResult[];
  confidence?: "high" | "medium" | "low";
  // Enhanced extraction fields
  enhancedData?: ExtractedResearchData;
  enhancedResults?: EnhancedSimilarityResult[];
  validationResults?: ValidationResults;
  extractionRecommendations?: string[];
  useClaudeExtraction?: boolean; // Always true - Claude AI is the default method
  searchParameters?: {
    technical_keywords: string[];
    patent_keywords: string[];
    technology_classification: string;
    innovation_level: string;
    commercial_readiness: string;
    confidence_score: number;
  };
}

interface DocumentUploadProps {
  onAnalyze: (documents: UploadedDocument[]) => Promise<void>;
  isAnalyzing: boolean;
  className?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onAnalyze,
  isAnalyzing,
  className = "",
}) => {
  const isCompactMode = className.includes("compact-mode");
  const isSquareCards = className.includes("square-cards");
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"pdf" | "url">("pdf");
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [urlFormData, setUrlFormData] = useState({
    url: "",
    title: "",
    abstract: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingToApi, setIsSubmittingToApi] = useState(false);
  // Claude AI is now the default and only extraction method
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Automatic Claude AI extraction (default method)
  const processDocumentWithClaudeExtraction = async (
    document: UploadedDocument,
    content: string
  ) => {
    try {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === document.id
            ? { ...doc, status: "processing", progress: 10 }
            : doc
        )
      );

      // Use cached enhanced extraction
      const enhancedResult = await cachedEnhancedExtraction(
        {
          content,
          document_type: "research_paper",
          use_claude_extraction: true,
          search_indices: ["patents", "publications"],
          max_results: 25,
        },
        (progress) => {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === document.id
                ? {
                    ...doc,
                    progress: progress.progress,
                    extractionProgress: {
                      stage: progress.stage as any,
                      progress: progress.progress,
                      message: progress.message,
                    },
                  }
                : doc
            )
          );
        }
      );

      // Validate extraction quality
      const qualityValidation = validateExtractionQuality(
        enhancedResult.extracted_data
      );

      // Get recommendations
      const recommendations = getExtractionRecommendations(
        enhancedResult.extracted_data,
        enhancedResult.validation_results
      );

      // Extract search parameters
      const searchParams = await extractSearchParameters(content);

      // Update document with enhanced data
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === document.id
            ? {
                ...doc,
                status: "completed",
                progress: 100,
                title: enhancedResult.extracted_data.title,
                abstract: enhancedResult.extracted_data.abstract,
                body: enhancedResult.extracted_data.findings.join("\n\n"),
                authors: enhancedResult.extracted_data.methodology,
                confidence: enhancedResult.extracted_data.extraction_quality,
                enhancedData: enhancedResult.extracted_data,
                enhancedResults: enhancedResult.similarity_results,
                validationResults: enhancedResult.validation_results,
                extractionRecommendations: recommendations,
                searchParameters: searchParams,
                useClaudeExtraction: true,
                error: qualityValidation.isValid
                  ? undefined
                  : qualityValidation.issues.join(", "),
              }
            : doc
        )
      );

      console.info(
        `Enhanced extraction completed for ${document.id} with ${enhancedResult.extracted_data.extraction_quality} quality`
      );
    } catch (error) {
      console.error("Enhanced extraction failed:", error);

      // Fallback to basic extraction
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === document.id
            ? {
                ...doc,
                status: "error",
                progress: 0,
                error: `Enhanced extraction failed: ${
                  error instanceof Error ? error.message : "Unknown error"
                }. Falling back to basic extraction.`,
                useClaudeExtraction: true, // Claude AI is always used
              }
            : doc
        )
      );

      // Try basic extraction as fallback
      await processBasicExtraction(document, content);
    }
  };

  const processBasicExtraction = async (
    document: UploadedDocument,
    content: string
  ) => {
    try {
      // Use existing basic extraction logic
      if (document.type === "pdf" && document.file) {
        await processPdfFile(document);
      } else {
        // Basic text processing for URL content
        const lines = content.split("\n").filter((line) => line.trim());
        const title = lines[0] || "Untitled Document";
        const abstract = lines.slice(1, 3).join(" ") || "No abstract available";

        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === document.id
              ? {
                  ...doc,
                  status: "completed",
                  progress: 100,
                  title,
                  abstract,
                  body: content,
                  confidence: "low",
                  useClaudeExtraction: true, // Claude AI is always used
                }
              : doc
          )
        );
      }
    } catch (error) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === document.id
            ? {
                ...doc,
                status: "error",
                progress: 0,
                error: `Basic extraction failed: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              }
            : doc
        )
      );
    }
  };

  // Removed extraction method switching - Claude AI is now the only method

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    setError(null);

    for (const file of files) {
      // Validate file type
      if (file.type !== "application/pdf") {
        setError(
          `File "${file.name}" is not a PDF. Only PDF files are supported.`
        );
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }

      const documentId = `pdf-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const newDocument: UploadedDocument = {
        id: documentId,
        name: file.name,
        type: "pdf",
        size: file.size,
        file,
        title: file.name.replace(".pdf", ""),
        abstract: "",
        status: "pending",
        progress: 0,
      };

      setDocuments((prev) => [...prev, newDocument]);

      // Automatically process with Claude AI extraction
      try {
        const fileContent = await file.text();
        await processDocumentWithClaudeExtraction(newDocument, fileContent);
      } catch (error) {
        console.warn(
          "Failed to read PDF as text, falling back to PDF extraction:",
          error
        );
        await processPdfFile(newDocument);
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const processPdfFile = async (document: UploadedDocument) => {
    if (!document.file) return;

    try {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === document.id
            ? { ...doc, status: "processing", progress: 0 }
            : doc
        )
      );

      // Extract content from PDF using real extraction
      const extractedContent = await extractPdfContent(
        document.file,
        (progress) => {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === document.id
                ? {
                    ...doc,
                    progress: progress.progress,
                    extractionProgress: progress,
                  }
                : doc
            )
          );
        }
      );

      // Validate extracted content
      const validation = validateExtractedContent(extractedContent);

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === document.id
            ? {
                ...doc,
                status: "completed",
                progress: 100,
                title: extractedContent.title,
                abstract: extractedContent.abstract,
                body: extractedContent.body,
                authors: extractedContent.authors,
                extractedContent,
                confidence: extractedContent.confidence,
                error: validation.isValid
                  ? undefined
                  : validation.issues.join(", "),
              }
            : doc
        )
      );
    } catch (error) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === document.id
            ? {
                ...doc,
                status: "error",
                progress: 0,
                error: `PDF extraction failed: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              }
            : doc
        )
      );
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlFormData.url) {
      setError("Please provide a valid URL.");
      return;
    }

    setIsProcessingUrl(true);
    setError(null);

    try {
      const documentId = `url-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Create initial document
      const newDocument: UploadedDocument = {
        id: documentId,
        name: "Extracting...",
        type: "url",
        url: urlFormData.url,
        title: "",
        abstract: "",
        status: "processing",
        progress: 0,
      };

      setDocuments((prev) => [...prev, newDocument]);

      // Automatically use Claude AI extraction for URL content
      let extractedContent: any;
      try {
        // First extract basic content to get raw text
        const basicContent = await extractUrlContent(urlFormData.url);
        const fullContent = `${basicContent.title}\n\n${
          basicContent.abstract
        }\n\n${basicContent.body || ""}`;

        // Then use Claude AI extraction
        await processDocumentWithClaudeExtraction(newDocument, fullContent);
        return; // Exit early if Claude extraction succeeds
      } catch (error) {
        console.warn(
          "Claude AI URL extraction failed, falling back to basic:",
          error
        );
        // Fallback to basic URL extraction
        extractedContent = await extractUrlContent(
          urlFormData.url,
          (progress) => {
            setDocuments((prev) =>
              prev.map((doc) =>
                doc.id === documentId
                  ? {
                      ...doc,
                      progress: progress.progress,
                      extractionProgress: progress,
                      name:
                        progress.stage === "complete"
                          ? extractedContent?.title || "URL Document"
                          : "Extracting...",
                    }
                  : doc
              )
            );
          }
        );
      }

      // Validate extracted content
      const validation = validateExtractedContent(extractedContent);

      // Update document with extracted content
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                name: extractedContent.title || "URL Document",
                title: extractedContent.title,
                abstract: extractedContent.abstract,
                body: extractedContent.body,
                authors: extractedContent.authors,
                doi: extractedContent.doi,
                extractedContent,
                confidence: extractedContent.confidence,
                status: "completed",
                progress: 100,
                error: validation.isValid
                  ? undefined
                  : validation.issues.join(", "),
              }
            : doc
        )
      );

      // Reset form
      setUrlFormData({ url: "", title: "", abstract: "" });
    } catch (error) {
      setError("Failed to add URL document. Please try again.");
    } finally {
      setIsProcessingUrl(false);
    }
  };

  const removeDocument = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  const updateDocument = (
    documentId: string,
    updates: Partial<UploadedDocument>
  ) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === documentId ? { ...doc, ...updates } : doc))
    );
  };

  const handleAnalyze = async () => {
    const completedDocuments = documents.filter(
      (doc) => doc.status === "completed"
    );

    if (completedDocuments.length === 0) {
      setError(
        "Please upload and complete at least one document before analyzing."
      );
      return;
    }

    // Validate all documents before submission
    const validationErrors: string[] = [];
    completedDocuments.forEach((doc) => {
      const validation = validateDocumentData(doc.title, doc.abstract);
      if (!validation.isValid) {
        validationErrors.push(`${doc.name}: ${validation.errors.join(", ")}`);
      }
    });

    if (validationErrors.length > 0) {
      setError(
        `Please fix the following issues before analyzing:\n${validationErrors.join(
          "\n"
        )}`
      );
      return;
    }

    setIsSubmittingToApi(true);
    setError(null);

    try {
      // Submit documents to Logic Mill API for similarity search
      for (const doc of completedDocuments) {
        const documentParts = [
          { key: "title", value: doc.title },
          { key: "abstract", value: doc.abstract },
        ];

        if (doc.body) {
          documentParts.push({
            key: "body",
            value: doc.body.substring(0, 2000),
          }); // Limit body length
        }

        const apiResults = await encodeDocumentAndSimilaritySearch(
          documentParts,
          ["patents", "publications"],
          25,
          "patspecter"
        );

        // Update document with API results
        setDocuments((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, apiResults } : d))
        );
      }

      // Call the original analyze function
      await onAnalyze(completedDocuments);
    } catch (error) {
      setError(
        `Analysis failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmittingToApi(false);
    }
  };

  const toggleEditMode = (documentId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId ? { ...doc, isEditing: !doc.isEditing } : doc
      )
    );
  };

  const retryExtraction = async (documentId: string) => {
    const document = documents.find((doc) => doc.id === documentId);
    if (!document) return;

    if (document.type === "pdf" && document.file) {
      await processPdfFile(document);
    } else if (document.type === "url" && document.url) {
      // Reset document state and retry URL extraction
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? { ...doc, status: "processing", progress: 0, error: undefined }
            : doc
        )
      );

      try {
        const extractedContent = await extractUrlContent(
          document.url!,
          (progress) => {
            setDocuments((prev) =>
              prev.map((doc) =>
                doc.id === documentId
                  ? {
                      ...doc,
                      progress: progress.progress,
                      extractionProgress: progress,
                    }
                  : doc
              )
            );
          }
        );

        const validation = validateExtractedContent(extractedContent);

        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  title: extractedContent.title,
                  abstract: extractedContent.abstract,
                  body: extractedContent.body,
                  authors: extractedContent.authors,
                  doi: extractedContent.doi,
                  extractedContent,
                  confidence: extractedContent.confidence,
                  status: "completed",
                  progress: 100,
                  error: validation.isValid
                    ? undefined
                    : validation.issues.join(", "),
                }
              : doc
          )
        );
      } catch (error) {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  status: "error",
                  error: `Retry failed: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`,
                }
              : doc
          )
        );
      }
    }
  };

  const canAnalyze =
    documents.some((doc) => doc.status === "completed") &&
    !isAnalyzing &&
    !isSubmittingToApi;

  return (
    <div
      className={`${
        isCompactMode ? "space-y-3" : "space-y-6"
      } ${className.replace("compact-mode", "")}`}
    >
      {/* Upload Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        {!isCompactMode && (
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Upload className="h-4 w-4 text-emerald-400" />
              Document Upload
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Upload PDF files or add documents via URL for automatic Claude AI
              analysis
            </CardDescription>
          </CardHeader>
        )}
        {isCompactMode && (
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium">
              Upload Documents
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={isCompactMode ? "space-y-3 p-4" : "space-y-6"}>
          {/* Claude AI extraction is now automatic - no UI controls needed */}
          {/* Upload Method Toggle */}
          <Tabs
            value={uploadMethod}
            onValueChange={(value) => setUploadMethod(value as "pdf" | "url")}
            className="w-full"
          >
            <TabsList
              className={`grid w-full grid-cols-2 bg-slate-700/50 ${
                isCompactMode ? "h-8" : ""
              }`}
            >
              <TabsTrigger
                value="pdf"
                className={`data-[state=active]:bg-slate-600 text-slate-300 ${
                  isCompactMode ? "text-xs py-1" : ""
                }`}
              >
                <FileUp
                  className={`${
                    isCompactMode ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"
                  }`}
                />
                PDF
              </TabsTrigger>
              <TabsTrigger
                value="url"
                className={`data-[state=active]:bg-slate-600 text-slate-300 ${
                  isCompactMode ? "text-xs py-1" : ""
                }`}
              >
                <Globe
                  className={`${
                    isCompactMode ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"
                  }`}
                />
                URL
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="pdf"
              className={isCompactMode ? "space-y-2" : "space-y-4"}
            >
              {/* PDF Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg text-center transition-colors ${
                  isSquareCards
                    ? "aspect-square p-3"
                    : isCompactMode
                    ? "p-4"
                    : "p-8"
                } ${
                  dragActive
                    ? "border-emerald-400 bg-emerald-400/10"
                    : "border-slate-600 hover:border-slate-500"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className={`h-full flex flex-col justify-center ${
                    isSquareCards
                      ? "space-y-1"
                      : isCompactMode
                      ? "space-y-2"
                      : "space-y-4"
                  }`}
                >
                  <div
                    className={`mx-auto bg-slate-700 rounded-lg flex items-center justify-center ${
                      isSquareCards
                        ? "w-6 h-6"
                        : isCompactMode
                        ? "w-8 h-8"
                        : "w-12 h-12"
                    }`}
                  >
                    <FileText
                      className={`text-slate-400 ${
                        isSquareCards
                          ? "h-3 w-3"
                          : isCompactMode
                          ? "h-4 w-4"
                          : "h-6 w-6"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-white font-medium mb-1 ${
                        isSquareCards
                          ? "text-xs"
                          : isCompactMode
                          ? "text-sm"
                          : ""
                      }`}
                    >
                      {isSquareCards
                        ? "Drop PDFs"
                        : isCompactMode
                        ? "Drop PDFs or click"
                        : "Drop PDF files here or click to browse"}
                    </p>
                    {!isCompactMode && !isSquareCards && (
                      <p className="text-sm text-slate-400">
                        Maximum file size: 10MB per file • Automatic Claude AI
                        extraction
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size={
                      isSquareCards ? "sm" : isCompactMode ? "sm" : "default"
                    }
                    onClick={() => fileInputRef.current?.click()}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus
                      className={`mr-1 ${
                        isSquareCards
                          ? "h-3 w-3"
                          : isCompactMode
                          ? "h-3 w-3"
                          : "h-4 w-4"
                      }`}
                    />
                    {isSquareCards
                      ? "Select"
                      : isCompactMode
                      ? "Select"
                      : "Select PDF Files"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="url"
              className={isCompactMode ? "space-y-2" : "space-y-4"}
            >
              <div
                className={`bg-slate-900/50 rounded-lg border border-slate-700 ${
                  isSquareCards
                    ? "aspect-square p-3 flex flex-col justify-center space-y-2"
                    : isCompactMode
                    ? "space-y-2 p-3"
                    : "space-y-4 p-3"
                }`}
              >
                {!isCompactMode && !isSquareCards && (
                  <div className="flex items-center gap-2 mb-4">
                    <Link className="h-5 w-5 text-emerald-400" />
                    <span className="text-white font-medium">
                      Extract Content from URL
                    </span>
                  </div>
                )}
                <div className={isSquareCards ? "flex-1" : ""}>
                  <Label
                    htmlFor="url"
                    className={`text-slate-300 ${
                      isSquareCards
                        ? "text-xs"
                        : isCompactMode
                        ? "text-xs"
                        : "text-sm"
                    }`}
                  >
                    URL *
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder={
                      isSquareCards
                        ? "arxiv.org/abs/..."
                        : isCompactMode
                        ? "https://arxiv.org/abs/..."
                        : "https://arxiv.org/abs/... or https://pubmed.ncbi.nlm.nih.gov/..."
                    }
                    value={urlFormData.url}
                    onChange={(e) =>
                      setUrlFormData((prev) => ({
                        ...prev,
                        url: e.target.value,
                      }))
                    }
                    className={`bg-slate-800 border-slate-600 text-white ${
                      isSquareCards
                        ? "h-7 text-xs mt-1"
                        : isCompactMode
                        ? "h-8 text-sm"
                        : "mt-1"
                    }`}
                  />
                  {!isCompactMode && !isSquareCards && (
                    <p className="text-xs text-slate-400 mt-1">
                      Supports arXiv, PubMed, DOI links, and academic journal
                      websites
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleUrlSubmit}
                  disabled={isProcessingUrl || !urlFormData.url}
                  size={isSquareCards ? "sm" : isCompactMode ? "sm" : "default"}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                >
                  {isProcessingUrl ? (
                    <>
                      <Loader2
                        className={`mr-1 animate-spin ${
                          isSquareCards
                            ? "h-3 w-3"
                            : isCompactMode
                            ? "h-3 w-3"
                            : "h-4 w-4"
                        }`}
                      />
                      {isSquareCards
                        ? "Extracting..."
                        : isCompactMode
                        ? "Extracting..."
                        : "Extracting Content..."}
                    </>
                  ) : (
                    <>
                      <Plus
                        className={`mr-1 ${
                          isSquareCards
                            ? "h-3 w-3"
                            : isCompactMode
                            ? "h-3 w-3"
                            : "h-4 w-4"
                        }`}
                      />
                      {isSquareCards
                        ? "Extract"
                        : isCompactMode
                        ? "Extract"
                        : "Extract & Add Document"}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Uploaded Documents ({documents.length})</span>
              <Badge
                variant="outline"
                className="border-emerald-500/30 text-emerald-300"
              >
                {documents.filter((doc) => doc.status === "completed").length}{" "}
                Ready
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-700 rounded">
                        {document.type === "pdf" ? (
                          <FileText className="h-4 w-4 text-slate-300" />
                        ) : (
                          <Link className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium">
                            {document.name}
                          </h4>
                          {document.confidence && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                document.confidence === "high"
                                  ? "border-emerald-500/30 text-emerald-300"
                                  : document.confidence === "medium"
                                  ? "border-yellow-500/30 text-yellow-300"
                                  : "border-red-500/30 text-red-300"
                              }`}
                            >
                              {document.confidence} confidence
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <span>
                            {document.type === "pdf"
                              ? document.size
                                ? `${(document.size / 1024 / 1024).toFixed(
                                    2
                                  )} MB`
                                : "PDF File"
                              : "URL Document"}
                          </span>
                          {document.authors && document.authors.length > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                {document.authors.slice(0, 2).join(", ")}
                                {document.authors.length > 2 ? " et al." : ""}
                              </span>
                            </>
                          )}
                          {document.doi && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400">
                                DOI: {document.doi}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          document.status === "completed"
                            ? "default"
                            : document.status === "error"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          document.status === "completed"
                            ? "bg-emerald-600"
                            : ""
                        }
                      >
                        {document.status === "completed" && (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {document.status === "error" && (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {document.status === "processing" && (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        )}
                        {document.status.charAt(0).toUpperCase() +
                          document.status.slice(1)}
                      </Badge>
                      {document.status === "error" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryExtraction(document.id)}
                          className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      {document.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleEditMode(document.id)}
                          className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(document.id)}
                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Enhanced Results Display */}
                  {document.status === "completed" && document.enhancedData && (
                    <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-medium text-emerald-400">
                          Claude AI Analysis
                        </Label>
                        <Badge
                          variant={
                            document.enhancedData.extraction_quality === "high"
                              ? "default"
                              : document.enhancedData.extraction_quality ===
                                "medium"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {document.enhancedData.extraction_quality} Quality
                        </Badge>
                      </div>

                      {/* Key Technologies */}
                      {document.enhancedData.key_technologies.length > 0 && (
                        <div className="mb-2">
                          <Label className="text-xs text-slate-400">
                            Technologies:
                          </Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {document.enhancedData.key_technologies
                              .slice(0, 3)
                              .map((tech, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs border-blue-500/30 text-blue-300"
                                >
                                  {tech}
                                </Badge>
                              ))}
                            {document.enhancedData.key_technologies.length >
                              3 && (
                              <Badge
                                variant="outline"
                                className="text-xs border-slate-500/30 text-slate-400"
                              >
                                +
                                {document.enhancedData.key_technologies.length -
                                  3}{" "}
                                more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Innovation Level & Commercial Readiness */}
                      <div className="flex items-center gap-4 mb-2">
                        <div>
                          <Label className="text-xs text-slate-400">
                            Innovation:
                          </Label>
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {document.enhancedData.innovation_level}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-400">
                            Readiness:
                          </Label>
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {document.enhancedData.commercial_readiness}
                          </Badge>
                        </div>
                      </div>

                      {/* Confidence Score */}
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-slate-400">
                          Confidence:
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                document.enhancedData.confidence_score >= 0.8
                                  ? "bg-emerald-500"
                                  : document.enhancedData.confidence_score >=
                                    0.6
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${
                                  document.enhancedData.confidence_score * 100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-300">
                            {Math.round(
                              document.enhancedData.confidence_score * 100
                            )}
                            %
                          </span>
                        </div>
                      </div>

                      {/* Recommendations */}
                      {document.extractionRecommendations &&
                        document.extractionRecommendations.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-700">
                            <Label className="text-xs text-slate-400">
                              Recommendations:
                            </Label>
                            <div className="mt-1 space-y-1">
                              {document.extractionRecommendations
                                .slice(0, 2)
                                .map((rec, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs text-slate-300 flex items-start gap-1"
                                  >
                                    <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <span>{rec}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {document.status === "processing" && (
                    <div className="mb-3">
                      <Progress value={document.progress} className="h-2" />
                      <p className="text-xs text-slate-400 mt-1">
                        Processing... {document.progress}%
                      </p>
                    </div>
                  )}

                  {document.status === "error" && document.error && (
                    <Alert className="border-red-500/50 bg-red-500/10 mb-3">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-300 text-sm">
                        {document.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {document.status === "completed" && (
                    <div className="space-y-4">
                      {/* Extraction Progress Info */}
                      {document.extractionProgress &&
                        document.extractionProgress.stage === "complete" && (
                          <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 p-2 rounded">
                            <CheckCircle className="h-4 w-4" />
                            <span>{document.extractionProgress.message}</span>
                          </div>
                        )}

                      {/* Content Editing */}
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-slate-300 text-sm font-medium">
                              Title *
                            </Label>
                            <span className="text-xs text-slate-400">
                              {document.title.length}/200
                            </span>
                          </div>
                          {document.isEditing ? (
                            <Input
                              value={document.title}
                              onChange={(e) =>
                                updateDocument(document.id, {
                                  title: e.target.value,
                                })
                              }
                              className="bg-slate-800 border-slate-600 text-white"
                              placeholder="Enter document title..."
                              maxLength={200}
                            />
                          ) : (
                            <div className="p-3 bg-slate-800 border border-slate-600 rounded text-white min-h-[40px] flex items-center">
                              {document.title || "No title provided"}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-slate-300 text-sm font-medium">
                              Abstract *
                            </Label>
                            <span className="text-xs text-slate-400">
                              {document.abstract.length}/2000
                            </span>
                          </div>
                          {document.isEditing ? (
                            <Textarea
                              value={document.abstract}
                              onChange={(e) =>
                                updateDocument(document.id, {
                                  abstract: e.target.value,
                                })
                              }
                              className="bg-slate-800 border-slate-600 text-white min-h-[120px]"
                              placeholder="Enter or edit the document abstract..."
                              maxLength={2000}
                            />
                          ) : (
                            <div className="p-3 bg-slate-800 border border-slate-600 rounded text-white min-h-[120px]">
                              {document.abstract || "No abstract provided"}
                            </div>
                          )}
                        </div>

                        {/* Additional Metadata */}
                        {(document.authors || document.doi || document.url) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-700">
                            {document.authors &&
                              document.authors.length > 0 && (
                                <div>
                                  <Label className="text-slate-300 text-sm font-medium">
                                    Authors
                                  </Label>
                                  <div className="mt-1 text-sm text-slate-400">
                                    {document.authors.join(", ")}
                                  </div>
                                </div>
                              )}
                            {document.doi && (
                              <div>
                                <Label className="text-slate-300 text-sm font-medium">
                                  DOI
                                </Label>
                                <div className="mt-1 text-sm text-emerald-400">
                                  {document.doi}
                                </div>
                              </div>
                            )}
                            {document.url && (
                              <div className="md:col-span-2">
                                <Label className="text-slate-300 text-sm font-medium">
                                  Source URL
                                </Label>
                                <div className="mt-1 text-sm text-blue-400 truncate">
                                  <a
                                    href={document.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    {document.url}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Claude AI extraction is automatic - no method switching needed */}
                        {document.status === "completed" &&
                          document.enhancedResults &&
                          document.enhancedResults.length > 0 && (
                            <div className="flex items-center justify-end pt-2 border-t border-slate-700">
                              <Badge
                                variant="outline"
                                className="text-xs border-emerald-500/30 text-emerald-300"
                              >
                                {document.enhancedResults.length} Claude AI
                                Results
                              </Badge>
                            </div>
                          )}

                        {/* Edit Mode Actions */}
                        {document.isEditing && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                            <Button
                              size="sm"
                              onClick={() => toggleEditMode(document.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Reset to original extracted content
                                if (document.extractedContent) {
                                  updateDocument(document.id, {
                                    title: document.extractedContent.title,
                                    abstract:
                                      document.extractedContent.abstract,
                                    isEditing: false,
                                  });
                                }
                              }}
                              className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Section */}
      {documents.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>
                    {
                      documents.filter((doc) => doc.status === "completed")
                        .length
                    }{" "}
                    Ready
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>
                    {
                      documents.filter((doc) => doc.status === "processing")
                        .length
                    }{" "}
                    Processing
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>
                    {documents.filter((doc) => doc.status === "error").length}{" "}
                    Failed
                  </span>
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg font-medium min-w-[280px]"
              >
                {isSubmittingToApi ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting to Logic Mill API...
                  </>
                ) : isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing Documents...
                  </>
                ) : (
                  <>
                    <Eye className="h-5 w-5 mr-2" />
                    Analyze Documents (
                    {
                      documents.filter((doc) => doc.status === "completed")
                        .length
                    }
                    )
                  </>
                )}
              </Button>

              {documents.filter((doc) => doc.status === "completed").length >
                0 && (
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Documents will be processed through Max Planck Logic Mill API
                  for similarity search across 70M patents and 100M publications
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentUpload;