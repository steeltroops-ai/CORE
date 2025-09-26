"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  Building,
  Users,
  BarChart3,
  Shield,
  Download,
  Share2,
  ExternalLink,
  Search,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  Target,
  Upload,
} from "lucide-react";
import SimilaritySearchCard from "./SimilaritySearchCard";

interface NoveltyAssessmentData {
  analysis_id: string;
  novelty_score: number;
  confidence_interval: [number, number];
  prior_art_landscape: Array<{
    id: string;
    title: string;
    score: number;
    type: string;
    assignees: string[];
    year?: number;
  }>;
  freedom_to_operate_risk: string;
  claims_analysis: Array<{
    patent_id: string;
    title: string;
    overlap_score: number;
    risk_level: string;
    assignees: string[];
  }>;
}

interface NoveltyAssessmentProps {
  analysisId: string;
  className?: string;
  showTechnicalDetails?: boolean;
  onExport?: (format: string, data: any) => void;
  onShare?: (url: string) => void;
}

interface FilterState {
  riskLevel: string;
  patentType: string;
  yearRange: [number, number];
  similarityThreshold: number;
}

interface ViewState {
  expandedItems: Set<string>;
  sortBy: 'similarity' | 'year' | 'risk';
  sortOrder: 'asc' | 'desc';
  showFilters: boolean;
}

const NoveltyAssessment: React.FC<NoveltyAssessmentProps> = ({
  analysisId,
  className = "",
  showTechnicalDetails = false,
  onExport,
  onShare,
}) => {
  const [data, setData] = useState<NoveltyAssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive state
  const [filters, setFilters] = useState<FilterState>({
    riskLevel: 'all',
    patentType: 'all',
    yearRange: [2000, new Date().getFullYear()],
    similarityThreshold: 0,
  });
  
  const [viewState, setViewState] = useState<ViewState>({
    expandedItems: new Set(),
    sortBy: 'similarity',
    sortOrder: 'desc',
    showFilters: false,
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchNoveltyData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/analysis/${analysisId}/track1/novelty`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch novelty assessment: ${response.statusText}`
          );
        }

        const noveltyData = await response.json();
        setData(noveltyData);
        setError(null);
      } catch (err) {
        console.error("Error fetching novelty assessment:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load novelty assessment"
        );
      } finally {
        setLoading(false);
      }
    };

    if (analysisId) {
      fetchNoveltyData();
    }
  }, [analysisId]);

  const getNoveltyScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getNoveltyScoreIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 0.6)
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getRiskBadgeVariant = (risk: string) => {
    if (risk.includes("HIGH")) return "destructive";
    if (risk.includes("MEDIUM")) return "secondary";
    return "default";
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "text-red-600 bg-red-50";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50";
      case "LOW":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Helper functions for interactive features
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(viewState.expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setViewState({ ...viewState, expandedItems: newExpanded });
  };

  const handleSort = (sortBy: 'similarity' | 'year' | 'risk') => {
    const newOrder = viewState.sortBy === sortBy && viewState.sortOrder === 'desc' ? 'asc' : 'desc';
    setViewState({ ...viewState, sortBy, sortOrder: newOrder });
  };

  const handleExport = (format: 'pdf' | 'excel' | 'json') => {
    if (onExport && data) {
      const exportData = {
        novelty_score: data.novelty_score,
        confidence_interval: data.confidence_interval,
        freedom_to_operate_risk: data.freedom_to_operate_risk,
        prior_art_landscape: data.prior_art_landscape,
        claims_analysis: data.claims_analysis,
        generated_at: new Date().toISOString(),
      };
      onExport(format, exportData);
    }
  };

  const handleShare = () => {
    if (onShare) {
      const shareUrl = `${window.location.origin}/insights?analysisId=${analysisId}&tab=novelty`;
      onShare(shareUrl);
    }
  };

  // Filter and sort data
  const getFilteredAndSortedData = (items: any[], type: 'prior_art' | 'claims') => {
    let filtered = items.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.assignees && item.assignees.some((a: string) => a.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesRisk = filters.riskLevel === 'all' || 
        (type === 'claims' && item.risk_level === filters.riskLevel);
      
      const matchesType = filters.patentType === 'all' || 
        (type === 'prior_art' && item.type === filters.patentType);
      
      const matchesYear = !item.year || 
        (item.year >= filters.yearRange[0] && item.year <= filters.yearRange[1]);
      
      const matchesSimilarity = type === 'prior_art' ? 
        item.score >= filters.similarityThreshold / 100 :
        item.overlap_score >= filters.similarityThreshold / 100;
      
      return matchesSearch && matchesRisk && matchesType && matchesYear && matchesSimilarity;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (viewState.sortBy) {
        case 'similarity':
          aValue = type === 'prior_art' ? a.score : a.overlap_score;
          bValue = type === 'prior_art' ? b.score : b.overlap_score;
          break;
        case 'year':
          aValue = a.year || 0;
          bValue = b.year || 0;
          break;
        case 'risk':
          if (type === 'claims') {
            const riskOrder = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };
            aValue = riskOrder[a.risk_level as keyof typeof riskOrder] || 0;
            bValue = riskOrder[b.risk_level as keyof typeof riskOrder] || 0;
          } else {
            aValue = a.score;
            bValue = b.score;
          }
          break;
        default:
          return 0;
      }
      
      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return viewState.sortOrder === 'asc' ? result : -result;
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle>Novelty Assessment</CardTitle>
            </div>
            <CardDescription>
              Analyzing technology novelty and prior art landscape...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={className}>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No novelty assessment data available
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Document Upload and Similarity Search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimilaritySearchCard
          title="Upload PDF Document"
          description="Upload PDF files for automatic similarity search"
          icon={Upload as React.ComponentType<{ className?: string; size?: number }>}
          uploadType="pdf"
        />
        <SimilaritySearchCard
          title="Add Document URL"
          description="Add documents via URL for similarity analysis"
          icon={FileText as React.ComponentType<{ className?: string; size?: number }>}
          uploadType="url"
        />
      </div>

      {/* Enhanced Novelty Score Overview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-slate-200">Novelty Assessment</CardTitle>
                <CardDescription className="text-slate-400">
                  Technology novelty score with{" "}
                  {(
                    (data.confidence_interval[1] - data.confidence_interval[0]) *
                    100
                  ).toFixed(1)}
                  % confidence interval
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  {getNoveltyScoreIcon(data.novelty_score)}
                  <span
                    className={`text-3xl font-bold ${getNoveltyScoreColor(
                      data.novelty_score
                    )}`}
                  >
                    {(data.novelty_score * 100).toFixed(1)}%
                  </span>
                </div>
                {showTechnicalDetails && (
                  <div className="text-xs text-slate-400 mt-1">
                    CI: [{(data.confidence_interval[0] * 100).toFixed(1)}%, {(data.confidence_interval[1] * 100).toFixed(1)}%]
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => setViewState({...viewState, showFilters: !viewState.showFilters})}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  {viewState.showFilters && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
                      <div className="p-2 space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-slate-300 hover:bg-slate-700"
                          onClick={() => handleExport('pdf')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Export as PDF
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-slate-300 hover:bg-slate-700"
                          onClick={() => handleExport('excel')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export as Excel
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-slate-300 hover:bg-slate-700"
                          onClick={() => handleExport('json')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Export as JSON
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Interactive Novelty Gauge */}
          <div className="relative">
            <div className="flex justify-between text-sm text-slate-400 mb-3">
              <span>Novelty Score</span>
              <span className="font-medium text-slate-200">{(data.novelty_score * 100).toFixed(1)}%</span>
            </div>
            
            {/* Enhanced Progress Bar with Gradient */}
            <div className="relative">
              <Progress 
                value={data.novelty_score * 100} 
                className="h-4 bg-slate-700"
              />
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                  style={{ width: `${data.novelty_score * 100}%` }}
                />
              </div>
            </div>
            
            {/* Confidence Interval Markers */}
            <div className="relative mt-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              <div className="absolute top-0 w-full h-2">
                <div 
                  className="absolute top-0 w-1 h-2 bg-slate-400 opacity-60"
                  style={{ left: `${data.confidence_interval[0] * 100}%` }}
                />
                <div 
                  className="absolute top-0 w-1 h-2 bg-slate-400 opacity-60"
                  style={{ left: `${data.confidence_interval[1] * 100}%` }}
                />
              </div>
            </div>
            
            {showTechnicalDetails && (
              <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Confidence Interval: [{(data.confidence_interval[0] * 100).toFixed(2)}%, {(data.confidence_interval[1] * 100).toFixed(2)}%]</div>
                  <div>Interval Width: {((data.confidence_interval[1] - data.confidence_interval[0]) * 100).toFixed(2)}%</div>
                  <div>Statistical Confidence: 95%</div>
                </div>
              </div>
            )}
          </div>

          {/* Freedom to Operate Risk */}
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200">Freedom to Operate</div>
                <div className="text-xs text-slate-400">Patent landscape risk assessment</div>
              </div>
            </div>
            <Badge
              variant={getRiskBadgeVariant(data.freedom_to_operate_risk)}
              className="text-sm font-medium px-3 py-1"
            >
              {data.freedom_to_operate_risk}
            </Badge>
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-slate-700/20 rounded-lg">
              <div className="text-lg font-bold text-emerald-400">
                {data.prior_art_landscape.length}
              </div>
              <div className="text-xs text-slate-400">Prior Art Items</div>
            </div>
            <div className="text-center p-3 bg-slate-700/20 rounded-lg">
              <div className="text-lg font-bold text-blue-400">
                {data.claims_analysis.length}
              </div>
              <div className="text-xs text-slate-400">Claims Analyzed</div>
            </div>
            <div className="text-center p-3 bg-slate-700/20 rounded-lg">
              <div className="text-lg font-bold text-purple-400">
                {data.claims_analysis.filter(c => c.risk_level === 'HIGH').length}
              </div>
              <div className="text-xs text-slate-400">High Risk Claims</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Analysis Tabs */}
      <Tabs defaultValue="prior-art" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-2 bg-slate-800 border-slate-700">
            <TabsTrigger value="prior-art" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              Prior Art Landscape
            </TabsTrigger>
            <TabsTrigger value="claims-analysis" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              Claims Analysis
            </TabsTrigger>
          </TabsList>
          
          {/* Search and Filter Controls */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm w-64"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewState({...viewState, showFilters: !viewState.showFilters})}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {viewState.showFilters && (
          <Card className="bg-slate-800/50 border-slate-700 mb-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-2 block">Risk Level</label>
                  <select
                    value={filters.riskLevel}
                    onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm p-2"
                  >
                    <option value="all">All Levels</option>
                    <option value="HIGH">High Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="LOW">Low Risk</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-2 block">Patent Type</label>
                  <select
                    value={filters.patentType}
                    onChange={(e) => setFilters({...filters, patentType: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm p-2"
                  >
                    <option value="all">All Types</option>
                    <option value="patent">Patents</option>
                    <option value="publication">Publications</option>
                    <option value="application">Applications</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-2 block">Min Similarity (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.similarityThreshold}
                    onChange={(e) => setFilters({...filters, similarityThreshold: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-xs text-slate-400 mt-1">{filters.similarityThreshold}%</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-2 block">Sort By</label>
                  <div className="flex space-x-1">
                    <Button
                      variant={viewState.sortBy === 'similarity' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSort('similarity')}
                      className="text-xs"
                    >
                      Similarity
                      {viewState.sortBy === 'similarity' && (
                        viewState.sortOrder === 'desc' ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronUp className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                    <Button
                      variant={viewState.sortBy === 'year' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSort('year')}
                      className="text-xs"
                    >
                      Year
                      {viewState.sortBy === 'year' && (
                        viewState.sortOrder === 'desc' ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronUp className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <TabsContent value="prior-art" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-200">Prior Art Landscape</CardTitle>
                    <CardDescription className="text-slate-400">
                      Most similar patents and publications in the technology space
                    </CardDescription>
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  {getFilteredAndSortedData(data.prior_art_landscape, 'prior_art').length} of {data.prior_art_landscape.length} items
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {getFilteredAndSortedData(data.prior_art_landscape, 'prior_art').length > 0 ? (
                <div className="space-y-4">
                  {getFilteredAndSortedData(data.prior_art_landscape, 'prior_art').map((item, index) => {
                    const isExpanded = viewState.expandedItems.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className="border border-slate-600 rounded-lg p-4 hover:bg-slate-700/30 transition-all duration-200 cursor-pointer"
                        onClick={() => toggleExpanded(item.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-slate-200 line-clamp-2">
                                {item.title}
                              </h4>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              <span className="flex items-center space-x-1">
                                <FileText className="h-3 w-3" />
                                <span>{item.id}</span>
                              </span>
                              {item.year && (
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{item.year}</span>
                                </span>
                              )}
                              <Badge 
                                variant="outline" 
                                className="border-slate-600 text-slate-300 bg-slate-700/50"
                              >
                                {item.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="flex items-center space-x-2 mb-1">
                              <div
                                className={`text-xl font-bold ${getNoveltyScoreColor(
                                  item.score
                                )}`}
                              >
                                {(item.score * 100).toFixed(1)}%
                              </div>
                              {item.score > 0.8 && <AlertTriangle className="h-4 w-4 text-red-400" />}
                            </div>
                            <div className="text-xs text-slate-500">
                              Similarity
                            </div>
                            <div className="w-16 mt-1">
                              <Progress value={item.score * 100} className="h-1" />
                            </div>
                          </div>
                        </div>

                        {item.assignees.length > 0 && (
                          <div className="flex items-center space-x-2 mb-3">
                            <Building className="h-3 w-3 text-slate-400" />
                            <div className="flex flex-wrap gap-1">
                              {item.assignees.slice(0, isExpanded ? item.assignees.length : 3).map((assignee: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs bg-slate-700 text-slate-300 border-slate-600"
                                >
                                  {assignee}
                                </Badge>
                              ))}
                              {!isExpanded && item.assignees.length > 3 && (
                                <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300 border-slate-600">
                                  +{item.assignees.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-600 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-400">Risk Assessment:</span>
                              <Badge 
                                variant={item.score > 0.8 ? 'destructive' : item.score > 0.6 ? 'secondary' : 'default'}
                                className="text-xs"
                              >
                                {item.score > 0.8 ? 'High Risk' : item.score > 0.6 ? 'Medium Risk' : 'Low Risk'}
                              </Badge>
                            </div>
                            
                            {showTechnicalDetails && (
                              <div className="bg-slate-700/30 rounded p-3 text-xs text-slate-400 space-y-1">
                                <div>Patent ID: {item.id}</div>
                                <div>Similarity Score: {(item.score * 100).toFixed(3)}%</div>
                                <div>Document Type: {item.type}</div>
                                {item.year && <div>Publication Year: {item.year}</div>}
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`https://patents.google.com/patent/${item.id}`, '_blank');
                                }}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Patent
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add to comparison or analysis
                                }}
                              >
                                <Target className="h-3 w-3 mr-1" />
                                Analyze
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-lg font-medium mb-2">No prior art found</p>
                  <p className="text-sm">Try adjusting your filters or search terms</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims-analysis" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Shield className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-200">Claims Overlap Analysis</CardTitle>
                    <CardDescription className="text-slate-400">
                      Potential patent claims conflicts and infringement risks
                    </CardDescription>
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  {getFilteredAndSortedData(data.claims_analysis, 'claims').length} of {data.claims_analysis.length} claims
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {getFilteredAndSortedData(data.claims_analysis, 'claims').length > 0 ? (
                <div className="space-y-4">
                  {getFilteredAndSortedData(data.claims_analysis, 'claims').map((claim, index) => {
                    const isExpanded = viewState.expandedItems.has(claim.patent_id);
                    const riskColor = claim.risk_level === 'HIGH' ? 'border-red-500/50 bg-red-500/5' : 
                                     claim.risk_level === 'MEDIUM' ? 'border-yellow-500/50 bg-yellow-500/5' : 
                                     'border-green-500/50 bg-green-500/5';
                    return (
                      <div
                        key={claim.patent_id}
                        className={`border rounded-lg p-4 hover:bg-slate-700/30 transition-all duration-200 cursor-pointer ${riskColor}`}
                        onClick={() => toggleExpanded(claim.patent_id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-slate-200 line-clamp-2">
                                {claim.title}
                              </h4>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              <span className="flex items-center space-x-1">
                                <FileText className="h-3 w-3" />
                                <span>{claim.patent_id}</span>
                              </span>
                              <Badge 
                                variant="outline" 
                                className={`border-0 text-xs font-medium ${getRiskLevelColor(claim.risk_level)}`}
                              >
                                {claim.risk_level} Risk
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="flex items-center space-x-2 mb-1">
                              <div
                                className={`text-xl font-bold ${getNoveltyScoreColor(
                                  claim.overlap_score
                                )}`}
                              >
                                {(claim.overlap_score * 100).toFixed(1)}%
                              </div>
                              {claim.risk_level === 'HIGH' && <AlertTriangle className="h-4 w-4 text-red-400" />}
                            </div>
                            <div className="text-xs text-slate-500">Overlap</div>
                            <div className="w-16 mt-1">
                              <Progress value={claim.overlap_score * 100} className="h-1" />
                            </div>
                          </div>
                        </div>

                        {claim.assignees.length > 0 && (
                          <div className="flex items-center space-x-2 mb-3">
                            <Building className="h-3 w-3 text-slate-400" />
                            <div className="flex flex-wrap gap-1">
                              {claim.assignees.slice(0, isExpanded ? claim.assignees.length : 2).map((assignee: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs bg-slate-700 text-slate-300 border-slate-600"
                                >
                                  {assignee}
                                </Badge>
                              ))}
                              {!isExpanded && claim.assignees.length > 2 && (
                                <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300 border-slate-600">
                                  +{claim.assignees.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-600 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-300">Risk Assessment</div>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    claim.risk_level === 'HIGH' ? 'bg-red-500' :
                                    claim.risk_level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                                  }`} />
                                  <span className="text-sm text-slate-400">
                                    {claim.risk_level === 'HIGH' ? 'High infringement risk' :
                                     claim.risk_level === 'MEDIUM' ? 'Moderate infringement risk' : 'Low infringement risk'}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-300">Overlap Score</div>
                                <div className="flex items-center space-x-2">
                                  <Progress value={claim.overlap_score * 100} className="flex-1 h-2" />
                                  <span className="text-sm text-slate-400">
                                    {(claim.overlap_score * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {showTechnicalDetails && (
                              <div className="bg-slate-700/30 rounded p-3 text-xs text-slate-400 space-y-1">
                                <div>Patent ID: {claim.patent_id}</div>
                                <div>Overlap Score: {(claim.overlap_score * 100).toFixed(3)}%</div>
                                <div>Risk Level: {claim.risk_level}</div>
                                <div>Assignees: {claim.assignees.join(', ')}</div>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`https://patents.google.com/patent/${claim.patent_id}`, '_blank');
                                }}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Patent
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add detailed claims analysis
                                }}
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Deep Analysis
                              </Button>
                              {claim.risk_level === 'HIGH' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Generate mitigation strategies
                                  }}
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  Mitigation
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-lg font-medium mb-2">No claims analysis found</p>
                  <p className="text-sm">Try adjusting your filters or search terms</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NoveltyAssessment;
