"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Shield,
  FileText,
  Users,
  Globe,
  Zap,
  Calendar,
  Building,
  Lightbulb,
  Award,
  ArrowRight,
  ExternalLink,
  Download,
  Share2,
  Search,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Star,
  TrendingDown,
  MapPin,
  Layers,
  GitBranch,
  Bookmark,
  Upload,
} from "lucide-react";
import SimilaritySearchCard from "./SimilaritySearchCard";

interface StrategicInsightsData {
  analysis_id: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
    timeframe: string;
  }>;
  risk_assessment: {
    overall_risk: string;
    technical_risk: string;
    market_risk: string;
    regulatory_risk: string;
    financial_risk: string;
    mitigation_strategies: string[];
  };
  regulatory_considerations: Array<{
    category: string;
    requirements: string[];
    timeline: string;
    complexity: string;
  }>;
  market_timing_analysis: {
    optimal_timing: string;
    market_readiness: string;
    key_factors: string[];
    milestones: string[];
  };
  partnership_recommendations: Array<{
    partner_type: string;
    description: string;
    strategic_value: string;
    priority: string;
  }>;
}

interface StrategicInsightsProps {
  analysisId: string;
  className?: string;
  showTechnicalDetails?: boolean;
  onExport?: (format: string, data: any) => void;
  onShare?: (url: string) => void;
}

interface FilterState {
  priorityLevel: string;
  riskLevel: string;
  timeframe: string;
  category: string;
}

interface ViewState {
  expandedItems: Set<string>;
  sortBy: 'priority' | 'risk' | 'timeframe' | 'value';
  sortOrder: 'asc' | 'desc';
  showFilters: boolean;
  selectedRiskCategory: string | null;
}

interface RiskMatrix {
  technical: { level: string; score: number; factors: string[] };
  market: { level: string; score: number; factors: string[] };
  regulatory: { level: string; score: number; factors: string[] };
  financial: { level: string; score: number; factors: string[] };
}

const StrategicInsights: React.FC<StrategicInsightsProps> = ({
  analysisId,
  className = "",
  showTechnicalDetails = false,
  onExport,
  onShare,
}) => {
  const [data, setData] = useState<StrategicInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive state
  const [filters, setFilters] = useState<FilterState>({
    priorityLevel: 'all',
    riskLevel: 'all',
    timeframe: 'all',
    category: 'all',
  });
  
  const [viewState, setViewState] = useState<ViewState>({
    expandedItems: new Set(),
    sortBy: 'priority',
    sortOrder: 'desc',
    showFilters: false,
    selectedRiskCategory: null,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [riskMatrix, setRiskMatrix] = useState<RiskMatrix | null>(null);

  useEffect(() => {
    const fetchStrategicData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/analysis/${analysisId}/track1/strategic`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch strategic insights: ${response.statusText}`
          );
        }

        const strategicData = await response.json();
        setData(strategicData);
        setError(null);
      } catch (err) {
        console.error("Error fetching strategic insights:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load strategic insights"
        );
      } finally {
        setLoading(false);
      }
    };

    if (analysisId) {
      fetchStrategicData();
    }
  }, [analysisId]);

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "HIGH":
        return "text-red-600 bg-red-50 border-red-200";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "LOW":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toUpperCase()) {
      case "HIGH":
        return "text-red-600";
      case "MEDIUM":
        return "text-yellow-600";
      case "LOW":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk.toUpperCase()) {
      case "HIGH":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "MEDIUM":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "LOW":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toUpperCase()) {
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

  const getReadinessIcon = (readiness: string) => {
    switch (readiness.toUpperCase()) {
      case "HIGH":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "MODERATE":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "LOW":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
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

  const handleSort = (sortBy: 'priority' | 'risk' | 'timeframe' | 'value') => {
    const newOrder = viewState.sortBy === sortBy && viewState.sortOrder === 'desc' ? 'asc' : 'desc';
    setViewState({ ...viewState, sortBy, sortOrder: newOrder });
  };

  const handleExport = (format: 'pdf' | 'excel' | 'json') => {
    if (onExport && data) {
      const exportData = {
        recommendations: data.recommendations,
        risk_assessment: data.risk_assessment,
        regulatory_considerations: data.regulatory_considerations,
        market_timing_analysis: data.market_timing_analysis,
        partnership_recommendations: data.partnership_recommendations,
        generated_at: new Date().toISOString(),
      };
      onExport(format, exportData);
    }
  };

  const handleShare = () => {
    if (onShare) {
      const shareUrl = `${window.location.origin}/insights?analysisId=${analysisId}&tab=strategic`;
      onShare(shareUrl);
    }
  };

  // Calculate risk scores for matrix visualization
  const calculateRiskMatrix = useCallback(() => {
    if (!data) return;

    const riskLevels = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };
    
    const matrix: RiskMatrix = {
      technical: {
        level: data.risk_assessment.technical_risk,
        score: riskLevels[data.risk_assessment.technical_risk.toUpperCase() as keyof typeof riskLevels] || 1,
        factors: ['Technology maturity', 'Development complexity', 'Scalability challenges']
      },
      market: {
        level: data.risk_assessment.market_risk,
        score: riskLevels[data.risk_assessment.market_risk.toUpperCase() as keyof typeof riskLevels] || 1,
        factors: ['Market acceptance', 'Competition intensity', 'Timing risks']
      },
      regulatory: {
        level: data.risk_assessment.regulatory_risk,
        score: riskLevels[data.risk_assessment.regulatory_risk.toUpperCase() as keyof typeof riskLevels] || 1,
        factors: ['Compliance requirements', 'Approval timelines', 'Policy changes']
      },
      financial: {
        level: data.risk_assessment.financial_risk,
        score: riskLevels[data.risk_assessment.financial_risk.toUpperCase() as keyof typeof riskLevels] || 1,
        factors: ['Funding requirements', 'Revenue uncertainty', 'Cost overruns']
      }
    };

    setRiskMatrix(matrix);
  }, [data, setRiskMatrix]);

  // Filter and sort data
  const getFilteredAndSortedData = (items: any[], type: string) => {
    let filtered = items.filter(item => {
      const matchesSearch = searchTerm === '' || 
        (typeof item === 'object' && JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPriority = filters.priorityLevel === 'all' || 
        (item.priority && item.priority.toLowerCase() === filters.priorityLevel.toLowerCase());
      
      const matchesTimeframe = filters.timeframe === 'all' || 
        (item.timeframe && item.timeframe.toLowerCase().includes(filters.timeframe.toLowerCase()));
      
      return matchesSearch && matchesPriority && matchesTimeframe;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (viewState.sortBy) {
        case 'priority':
          const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          aValue = priorityOrder[a.priority?.toUpperCase() as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority?.toUpperCase() as keyof typeof priorityOrder] || 0;
          break;
        case 'timeframe':
          aValue = a.timeframe || '';
          bValue = b.timeframe || '';
          break;
        case 'value':
          aValue = a.strategic_value || a.description?.length || 0;
          bValue = b.strategic_value || b.description?.length || 0;
          break;
        default:
          return 0;
      }
      
      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return viewState.sortOrder === 'asc' ? result : -result;
    });

    return filtered;
  };

  // Calculate risk matrix when data changes
  useEffect(() => {
    if (data) {
      calculateRiskMatrix();
    }
  }, [data, calculateRiskMatrix]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <CardTitle>Strategic Insights</CardTitle>
            </div>
            <CardDescription>
              Generating AI-powered strategic recommendations...
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
          <AlertDescription>No strategic insights available</AlertDescription>
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
          description="Upload PDF files for strategic insights analysis"
          icon={Upload as React.ComponentType<{ className?: string; size?: number }>}
          uploadType="pdf"
        />
        <SimilaritySearchCard
          title="Add Document URL"
          description="Add documents via URL for AI-powered recommendations"
          icon={FileText as React.ComponentType<{ className?: string; size?: number }>}
          uploadType="url"
        />
      </div>

      {/* Enhanced AI Recommendations Overview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Brain className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-slate-200">AI-Powered Strategic Recommendations</CardTitle>
                <CardDescription className="text-slate-400">
                  Strategic recommendations generated by advanced AI analysis of your technology and market context
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                <Zap className="h-3 w-3 mr-1" />
                Claude AI Analysis
              </Badge>
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
          {/* Search and Filter Controls */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search recommendations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm w-64"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewState.sortBy === 'priority' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('priority')}
                className="text-xs"
              >
                Priority
                {viewState.sortBy === 'priority' && (
                  viewState.sortOrder === 'desc' ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronUp className="h-3 w-3 ml-1" />
                )}
              </Button>
              <Button
                variant={viewState.sortBy === 'timeframe' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('timeframe')}
                className="text-xs"
              >
                Timeframe
                {viewState.sortBy === 'timeframe' && (
                  viewState.sortOrder === 'desc' ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronUp className="h-3 w-3 ml-1" />
                )}
              </Button>
            </div>
          </div>

          {/* Enhanced Recommendations */}
          {getFilteredAndSortedData(data.recommendations, 'recommendations').length > 0 ? (
            <div className="space-y-4">
              {getFilteredAndSortedData(data.recommendations, 'recommendations').map((rec, index) => {
                const isExpanded = viewState.expandedItems.has(`rec-${index}`);
                const priorityColor = rec.priority === 'HIGH' ? 'border-red-500/50 bg-red-500/5' : 
                                     rec.priority === 'MEDIUM' ? 'border-yellow-500/50 bg-yellow-500/5' : 
                                     'border-green-500/50 bg-green-500/5';
                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 hover:bg-slate-700/30 transition-all duration-200 cursor-pointer ${priorityColor}`}
                    onClick={() => toggleExpanded(`rec-${index}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="p-1 bg-yellow-500/10 rounded">
                            <Lightbulb className="h-4 w-4 text-yellow-400" />
                          </div>
                          <h4 className="font-medium text-slate-200">
                            {rec.title}
                          </h4>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{rec.description}</p>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            <span className="text-sm text-slate-400">
                              {rec.timeframe}
                            </span>
                          </div>
                          {showTechnicalDetails && (
                            <div className="flex items-center space-x-2">
                              <Star className="h-3 w-3 text-slate-500" />
                              <span className="text-xs text-slate-500">
                                AI Confidence: 85%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getPriorityColor(rec.priority)} border-0 text-sm font-medium`}
                      >
                        {rec.priority} Priority
                      </Badge>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-600 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-slate-300">Implementation Steps</div>
                            <div className="text-xs text-slate-400 space-y-1">
                              <div>• Assess current capabilities</div>
                              <div>• Develop implementation plan</div>
                              <div>• Execute and monitor progress</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-slate-300">Expected Impact</div>
                            <div className="flex items-center space-x-2">
                              <Progress value={rec.priority === 'HIGH' ? 85 : rec.priority === 'MEDIUM' ? 65 : 45} className="flex-1 h-2" />
                              <span className="text-xs text-slate-400">
                                {rec.priority === 'HIGH' ? 'High' : rec.priority === 'MEDIUM' ? 'Medium' : 'Low'} Impact
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {showTechnicalDetails && (
                          <div className="bg-slate-700/30 rounded p-3 text-xs text-slate-400 space-y-1">
                            <div>Recommendation ID: REC-{String(index + 1).padStart(3, '0')}</div>
                            <div>Generated: {new Date().toLocaleDateString()}</div>
                            <div>Priority Score: {rec.priority === 'HIGH' ? '8.5/10' : rec.priority === 'MEDIUM' ? '6.5/10' : '4.5/10'}</div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add to action plan
                            }}
                          >
                            <Bookmark className="h-3 w-3 mr-1" />
                            Add to Plan
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              // View detailed analysis
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Details
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
              <Brain className="h-16 w-16 mx-auto mb-4 text-slate-600" />
              <p className="text-lg font-medium mb-2">No recommendations found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="risk-assessment" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
          <TabsTrigger value="market-timing">Market Timing</TabsTrigger>
          <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
        </TabsList>

        <TabsContent value="risk-assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Comprehensive Risk Assessment</span>
              </CardTitle>
              <CardDescription>
                Multi-dimensional risk analysis with mitigation strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Overall Risk */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">Overall Risk Level</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRiskIcon(data.risk_assessment.overall_risk)}
                      <span
                        className={`font-bold ${getRiskColor(
                          data.risk_assessment.overall_risk
                        )}`}
                      >
                        {data.risk_assessment.overall_risk}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Risk Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          Technical Risk
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getRiskIcon(data.risk_assessment.technical_risk)}
                        <span
                          className={`text-sm font-medium ${getRiskColor(
                            data.risk_assessment.technical_risk
                          )}`}
                        >
                          {data.risk_assessment.technical_risk}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Market Risk</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getRiskIcon(data.risk_assessment.market_risk)}
                        <span
                          className={`text-sm font-medium ${getRiskColor(
                            data.risk_assessment.market_risk
                          )}`}
                        >
                          {data.risk_assessment.market_risk}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          Regulatory Risk
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getRiskIcon(data.risk_assessment.regulatory_risk)}
                        <span
                          className={`text-sm font-medium ${getRiskColor(
                            data.risk_assessment.regulatory_risk
                          )}`}
                        >
                          {data.risk_assessment.regulatory_risk}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">
                          Financial Risk
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getRiskIcon(data.risk_assessment.financial_risk)}
                        <span
                          className={`text-sm font-medium ${getRiskColor(
                            data.risk_assessment.financial_risk
                          )}`}
                        >
                          {data.risk_assessment.financial_risk}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mitigation Strategies */}
                {data.risk_assessment.mitigation_strategies.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Mitigation Strategies</span>
                    </div>
                    <ul className="space-y-2">
                      {data.risk_assessment.mitigation_strategies.map(
                        (strategy, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2 text-sm"
                          >
                            <ArrowRight className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{strategy}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulatory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Regulatory Landscape Analysis</span>
              </CardTitle>
              <CardDescription>
                Compliance requirements and regulatory pathway assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.regulatory_considerations.length > 0 ? (
                <div className="space-y-4">
                  {data.regulatory_considerations.map((reg, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {reg.category}
                          </h4>
                          {reg.requirements.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">
                                Requirements:
                              </span>
                              <ul className="mt-1 space-y-1">
                                {reg.requirements.map((req, idx) => (
                                  <li
                                    key={idx}
                                    className="text-sm text-gray-600 flex items-start space-x-1"
                                  >
                                    <span>•</span>
                                    <span>{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={getComplexityColor(reg.complexity)}
                        >
                          {reg.complexity} Complexity
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-2 mt-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Timeline: {reg.timeline}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No regulatory considerations identified</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market-timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Market Timing Analysis</span>
              </CardTitle>
              <CardDescription>
                Optimal timing for market entry and key milestone planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Optimal Timing */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Optimal Market Entry</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700"
                    >
                      {data.market_timing_analysis.optimal_timing}
                    </Badge>
                  </div>
                </div>

                {/* Market Readiness */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Market Readiness</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getReadinessIcon(
                        data.market_timing_analysis.market_readiness
                      )}
                      <span className="font-medium">
                        {data.market_timing_analysis.market_readiness}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Factors */}
                {data.market_timing_analysis.key_factors.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Key Success Factors</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.market_timing_analysis.key_factors.map(
                        (factor, index) => (
                          <Badge key={index} variant="secondary">
                            {factor}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {data.market_timing_analysis.milestones.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Key Milestones</span>
                    </div>
                    <ul className="space-y-2">
                      {data.market_timing_analysis.milestones.map(
                        (milestone, index) => (
                          <li
                            key={index}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            <span>{milestone}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partnerships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Strategic Partnership Recommendations</span>
              </CardTitle>
              <CardDescription>
                Potential partners and strategic alliance opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.partnership_recommendations.length > 0 ? (
                <div className="space-y-4">
                  {data.partnership_recommendations.map((partner, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Building className="h-4 w-4 text-gray-400" />
                            <h4 className="font-medium text-gray-900">
                              {partner.partner_type}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {partner.description}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Award className="h-3 w-3 text-blue-500" />
                            <span className="text-sm text-blue-600 font-medium">
                              Strategic Value:
                            </span>
                            <span className="text-sm text-gray-600">
                              {partner.strategic_value}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(partner.priority)}
                        >
                          {partner.priority} Priority
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No partnership recommendations available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategicInsights;
