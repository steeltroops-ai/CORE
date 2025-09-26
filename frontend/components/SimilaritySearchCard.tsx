"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  ExternalLink,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Database,
  TrendingUp,
  Globe,
  Building,
  Calendar,
} from "lucide-react";
import { extractAndSearchDocuments, SimilaritySearchResult } from "@/lib/api";
import UploadAnalyzeCard from "./UploadAnalyzeCard";

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

interface SimilaritySearchCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  uploadType: 'pdf' | 'url';
  className?: string;
}

interface SearchResults {
  results: SimilaritySearchResult[];
  extractionInfo: {
    title: string;
    abstract: string;
    wordCount: number;
  };
}

const SimilaritySearchCard: React.FC<SimilaritySearchCardProps> = ({
  title,
  description,
  icon: Icon,
  uploadType,
  className = "",
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchProgress, setSearchProgress] = useState(0);

  const handleAnalyze = async (documents: UploadedDocument[]) => {
    if (documents.length === 0) {
      setError("Please upload at least one document before analyzing");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSearchResults(null);
    setSearchProgress(0);

    try {
      const document = documents[0]; // Use the first document
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      let requestData: any = {
        title: document.title,
        abstract: document.abstract || document.title,
        amount: 25,
        indices: ["patents", "publications"]
      };

      // Add file or URL data based on document type
      if (document.type === 'pdf' && document.file) {
        const formData = new FormData();
        formData.append('file', document.file);
        formData.append('title', document.title);
        formData.append('abstract', document.abstract || document.title);
        formData.append('amount', '25');
        formData.append('indices', JSON.stringify(["patents", "publications"]));
        
        // For file upload, we'll use the extract-and-search endpoint
        const response = await fetch('/api/extract-and-search', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const result = await response.json();
        clearInterval(progressInterval);
        setSearchProgress(100);
        
        setSearchResults({
          results: result.similarity_results || result.results || [],
          extractionInfo: {
            title: result.extraction_info?.original_title || result.extractionInfo?.title || document.title,
            abstract: result.extraction_info?.abstract || result.extractionInfo?.abstract || document.abstract || '',
            wordCount: result.extraction_info?.final_abstract_words || result.extractionInfo?.wordCount || 0
          }
        });
      } else {
        // For URL or direct text search
        const response = await extractAndSearchDocuments(requestData);
        clearInterval(progressInterval);
        setSearchProgress(100);
        
        setSearchResults({
          results: response.similarity_results || [],
          extractionInfo: {
            title: response.extraction_info?.original_title || document.title,
            abstract: document.abstract || '',
            wordCount: response.extraction_info?.final_abstract_words || (document.abstract ? document.abstract.split(' ').length : 0)
          }
        });
      }
    } catch (err) {
      console.error('Similarity search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsAnalyzing(false);
      setSearchProgress(0);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-emerald-400";
    if (score >= 0.6) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 0.8) return "default";
    if (score >= 0.6) return "secondary";
    return "destructive";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload and Analyze Card */}
      <UploadAnalyzeCard
        title={title}
        description={description}
        icon={Icon}
        uploadType={uploadType}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
      />

      {/* Progress Bar */}
      {isAnalyzing && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Searching similar documents...</span>
                <span className="text-slate-400">{searchProgress}%</span>
              </div>
              <Progress value={searchProgress} className="h-2" />
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Processing with Logic Mill API</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-4">
          {/* Extraction Info */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                Document Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-slate-400 mb-1">Extracted Title:</div>
                <div className="text-sm text-white">{searchResults.extractionInfo.title}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Abstract ({searchResults.extractionInfo.wordCount} words):</div>
                <div className="text-sm text-slate-300 line-clamp-3">
                  {searchResults.extractionInfo.abstract}
                </div>
              </div>
              {searchResults.extractionInfo.wordCount > 420 && (
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertTriangle className="h-3 w-3 text-yellow-400" />
                  <AlertDescription className="text-yellow-300 text-xs">
                    Abstract exceeds 420 words. Text may be truncated for BERT processing.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Similar Research Found */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Search className="h-4 w-4 text-emerald-400" />
                Similar Research Found
                <Badge variant="outline" className="ml-2 text-xs border-emerald-500/30 text-emerald-300">
                  {searchResults.results.length} results
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Most similar documents from patents and publications databases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchResults.results.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchResults.results.map((result, index) => (
                    <div
                      key={result.id}
                      className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white line-clamp-2 mb-1">
                            {result.title || 'Untitled Document'}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Badge 
                              variant="outline" 
                              className={`text-xs border-slate-600 ${
                                result.index === 'patents' ? 'text-blue-300' : 'text-purple-300'
                              }`}
                            >
                              {result.index === 'patents' ? 'Patent' : 'Publication'}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Database className="h-3 w-3" />
                              {result.id}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <div className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                            {(result.score * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-slate-500">Similarity</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Progress 
                            value={result.score * 100} 
                            className="h-1 mb-2" 
                          />
                        </div>
                        {result.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(result.url, '_blank')}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-emerald-400 ml-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Search className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-sm font-medium mb-1">No similar documents found</p>
                  <p className="text-xs">Try uploading a different document or adjusting search parameters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SimilaritySearchCard;