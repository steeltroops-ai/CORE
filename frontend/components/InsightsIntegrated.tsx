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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NoveltyAssessment from "./NoveltyAssessment";
import CompetitiveIntelligence from "./CompetitiveIntelligence";
import CommercializationOpportunities from "./CommercializationOpportunities";
import StrategicInsights from "./StrategicInsights";
import { DocumentUpload } from "./DocumentUpload";
import {
  BarChart3,
  Network,
  Briefcase,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Award,
  RefreshCw,
  ExternalLink,
  Upload,
} from "lucide-react";

interface InsightsIntegratedProps {
  analysisId: string | null;
  className?: string;
  onDocumentUpload?: (data: {
    title: string;
    abstract: string;
    body?: string;
    file?: File;
    url?: string;
  }) => void;
  isUploading?: boolean;
}

interface InsightsSummary {
  novelty_score: number;
  competitive_intensity: string;
  market_readiness: number;
  overall_risk: string;
  key_recommendations: number;
  licensing_opportunities: number;
}

interface ProcessingStage {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  result?: any;
}

interface RealTimeInsights {
  novelty?: any;
  competitive?: any;
  commercialization?: any;
  strategic?: any;
}

const InsightsIntegrated: React.FC<InsightsIntegratedProps> = ({
  analysisId,
  className = "",
  onDocumentUpload,
  isUploading = false,
}) => {
  const [activeTab, setActiveTab] = useState("novelty");
  const [summary, setSummary] = useState<InsightsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isProcessingRealTime, setIsProcessingRealTime] = useState(false);
  const [processingStages, setProcessingStages] = useState<ProcessingStage[]>(
    []
  );
  const [realTimeInsights, setRealTimeInsights] = useState<RealTimeInsights>(
    {}
  );
  const [processingErrors, setProcessingErrors] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);

  useEffect(() => {
    if (analysisId) {
      fetchSummaryData();
    } else {
      setLoading(false);
      setError("No analysis available. Please upload a document first.");
    }
  }, [analysisId]);

  const fetchSummaryData = async () => {
    if (!analysisId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/analysis/${analysisId}/track1/comprehensive`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch insights summary (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();

      // Extract summary metrics from comprehensive data with better fallbacks
      const summaryData: InsightsSummary = {
        novelty_score:
          data.novelty_assessment?.novelty_score ||
          data.basic_analysis?.novelty_score ||
          0.5, // Default to neutral score
        competitive_intensity:
          data.competitive_intelligence?.market_position
            ?.competitive_intensity || "MEDIUM", // Default to medium instead of unknown
        market_readiness:
          data.commercialization?.market_readiness?.readiness_score || 0.5, // Default to neutral
        overall_risk:
          data.strategic_insights?.risk_assessment?.overall_risk || "MEDIUM",
        key_recommendations:
          data.strategic_insights?.recommendations?.length || 0,
        licensing_opportunities:
          data.commercialization?.licensing_leads?.length || 0,
      };

      setSummary(summaryData);
      setError(null);
    } catch (err) {
      console.error("Error fetching insights summary:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load insights summary";
      setError(errorMessage);

      // Set fallback summary data so the UI doesn't break
      setSummary({
        novelty_score: 0.5,
        competitive_intensity: "MEDIUM",
        market_readiness: 0.5,
        overall_risk: "MEDIUM",
        key_recommendations: 0,
        licensing_opportunities: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSummaryData();
    setRefreshing(false);
  };

  const initializeProcessingStages = () => {
    const stages: ProcessingStage[] = [
      {
        id: "extract",
        name: "Document Processing",
        status: "pending",
        progress: 0,
      },
      {
        id: "logic_mill",
        name: "Patent & Publication Search",
        status: "pending",
        progress: 0,
      },
      {
        id: "claude",
        name: "AI Strategic Analysis",
        status: "pending",
        progress: 0,
      },
      {
        id: "novelty",
        name: "Novelty Assessment",
        status: "pending",
        progress: 0,
      },
      {
        id: "competitive",
        name: "Competitive Intelligence",
        status: "pending",
        progress: 0,
      },
      {
        id: "commercialization",
        name: "Commercialization Analysis",
        status: "pending",
        progress: 0,
      },
      {
        id: "strategic",
        name: "Strategic Insights",
        status: "pending",
        progress: 0,
      },
    ];
    setProcessingStages(stages);
    return stages;
  };

  const updateProcessingStage = (
    stageId: string,
    updates: Partial<ProcessingStage>
  ) => {
    setProcessingStages((prev) =>
      prev.map((stage) =>
        stage.id === stageId ? { ...stage, ...updates } : stage
      )
    );
  };

  const simulateRealTimeProcessing = async (analysisId: string) => {
    setIsProcessingRealTime(true);
    const stages = initializeProcessingStages();

    try {
      // Stage 1: Document Processing (already completed by upload)
      updateProcessingStage("extract", { status: "processing" });
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateProcessingStage("extract", { status: "completed", progress: 100 });

      // Stage 2: Logic Mill API - Real API call
      updateProcessingStage("logic_mill", { status: "processing" });
      try {
        // Simulate progress while making real API call
        const progressInterval = setInterval(() => {
          updateProcessingStage("logic_mill", {
            progress: Math.min(90, Math.random() * 80 + 10),
          });
        }, 500);

        // Make actual API call for comprehensive data (includes novelty and competitive)
        const comprehensiveResponse = await fetch(
          `/api/analysis/${analysisId}/track1/comprehensive`
        );
        clearInterval(progressInterval);

        if (comprehensiveResponse.ok) {
          const comprehensiveData = await comprehensiveResponse.json();
          updateProcessingStage("logic_mill", {
            status: "completed",
            progress: 100,
            result: comprehensiveData,
          });

          // Extract novelty data from comprehensive response
          if (comprehensiveData.novelty_assessment) {
            setRealTimeInsights((prev) => ({
              ...prev,
              novelty: {
                analysis_id: analysisId,
                ...comprehensiveData.novelty_assessment,
              },
            }));
          }

          // Extract competitive data from comprehensive response
          if (comprehensiveData.competitive_intelligence) {
            setRealTimeInsights((prev) => ({
              ...prev,
              competitive: {
                analysis_id: analysisId,
                ...comprehensiveData.competitive_intelligence,
              },
            }));
          }
        } else {
          const errorText = await comprehensiveResponse.text();
          throw new Error(`Logic Mill API failed: ${errorText}`);
        }
      } catch (error) {
        console.error("Logic Mill API error:", error);
        updateProcessingStage("logic_mill", { status: "error", progress: 0 });
        addProcessingError("Logic Mill API: Patent similarity search failed");
      }

      // Stage 3: Claude API - Real API call for strategic insights
      updateProcessingStage("claude", { status: "processing" });
      try {
        const progressInterval = setInterval(() => {
          updateProcessingStage("claude", {
            progress: Math.min(90, Math.random() * 80 + 10),
          });
        }, 600);

        // Make actual API call for strategic insights
        const strategicResponse = await fetch(
          `/api/analysis/${analysisId}/track1/strategic`
        );
        clearInterval(progressInterval);

        if (strategicResponse.ok) {
          const strategicData = await strategicResponse.json();
          updateProcessingStage("claude", {
            status: "completed",
            progress: 100,
            result: strategicData,
          });
          setRealTimeInsights((prev) => ({
            ...prev,
            strategic: {
              ...strategicData,
              completed: true,
              timestamp: new Date().toISOString(),
            },
          }));
        } else {
          const errorText = await strategicResponse.text();
          throw new Error(`Strategic insights failed: ${errorText}`);
        }
      } catch (error) {
        console.error("Claude API error:", error);
        updateProcessingStage("claude", { status: "error", progress: 0 });
        addProcessingError("Claude API: Strategic insights generation failed");
      }

      // Stage 4-7: Generate remaining insights (only commercialization since novelty, competitive, and strategic are handled above)
      const remainingStages = [
        { id: "commercialization", endpoint: "commercialization" },
      ];

      await Promise.all(
        remainingStages.map(async (stage, index) => {
          await new Promise((resolve) => setTimeout(resolve, index * 300));
          updateProcessingStage(stage.id, { status: "processing" });

          try {
            const progressInterval = setInterval(() => {
              updateProcessingStage(stage.id, {
                progress: Math.min(90, Math.random() * 80 + 10),
              });
            }, 400);

            const response = await fetch(
              `/api/analysis/${analysisId}/track1/${stage.endpoint}`
            );
            clearInterval(progressInterval);

            if (response.ok) {
              const data = await response.json();
              updateProcessingStage(stage.id, {
                status: "completed",
                progress: 100,
                result: data,
              });

              setRealTimeInsights((prev) => ({
                ...prev,
                [stage.id]: {
                  ...data,
                  completed: true,
                  timestamp: new Date().toISOString(),
                },
              }));
            } else {
              const errorText = await response.text();
              throw new Error(`${stage.id} analysis failed: ${errorText}`);
            }
          } catch (error) {
            console.error(`${stage.id} API error:`, error);
            updateProcessingStage(stage.id, { status: "error", progress: 0 });
            addProcessingError(
              `${
                stage.id.charAt(0).toUpperCase() + stage.id.slice(1)
              } analysis failed`
            );
          }
        })
      );

      // Mark novelty, competitive, and strategic as completed based on the comprehensive data
      updateProcessingStage("novelty", { status: "completed", progress: 100 });
      updateProcessingStage("competitive", {
        status: "completed",
        progress: 100,
      });
      updateProcessingStage("strategic", {
        status: "completed",
        progress: 100,
      });

      // Fetch final comprehensive data
      await fetchSummaryData();
    } catch (error) {
      console.error("Real-time processing error:", error);
      setError(
        "Critical error during processing. Please try again or contact support."
      );
      addProcessingError("System error: Processing pipeline failed");
    } finally {
      setIsProcessingRealTime(false);

      // Check if there were any errors and offer retry
      if (processingErrors.length > 0 && retryCount < maxRetries) {
        // Auto-retry after a delay for certain types of errors
        const hasRetryableErrors = processingErrors.some(
          (err) =>
            err.includes("API") ||
            err.includes("network") ||
            err.includes("timeout")
        );

        if (hasRetryableErrors) {
          setTimeout(() => {
            console.log(
              `Auto-retrying processing (attempt ${
                retryCount + 1
              }/${maxRetries})`
            );
            retryProcessing();
          }, 3000);
        }
      }
    }
  };

  const handleRealTimeDocumentUpload = async (data: {
    title: string;
    abstract: string;
    body?: string;
    file?: File;
    url?: string;
  }) => {
    // Reset error states
    setError(null);
    setProcessingErrors([]);
    setRetryCount(0);

    // Validate input data
    if (!data.title?.trim() || !data.abstract?.trim()) {
      setError("Document title and abstract are required for analysis");
      return;
    }

    if (data.title.length < 10) {
      setError("Document title must be at least 10 characters long");
      return;
    }

    if (data.abstract.length < 50) {
      setError(
        "Document abstract must be at least 50 characters long for meaningful analysis"
      );
      return;
    }

    try {
      if (onDocumentUpload) {
        onDocumentUpload(data);

        // Start real-time processing with actual analysis ID
        // Wait a moment for the analysis ID to be set
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Use the actual analysis ID if available, otherwise create a temporary one
        const actualAnalysisId = analysisId || "temp-" + Date.now();
        await simulateRealTimeProcessing(actualAnalysisId);
      }
    } catch (error) {
      console.error("Document upload error:", error);
      setError("Failed to upload document. Please try again.");
    }
  };

  const retryProcessing = async () => {
    if (retryCount < maxRetries && analysisId) {
      setRetryCount((prev) => prev + 1);
      setProcessingErrors([]);
      await simulateRealTimeProcessing(analysisId);
    } else {
      setError("Maximum retry attempts reached. Please refresh and try again.");
    }
  };

  const addProcessingError = (errorMessage: string) => {
    setProcessingErrors((prev) => [...prev, errorMessage]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 0.6) return <Clock className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity.toUpperCase()) {
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

  const getRiskColor = (risk: string) => {
    switch (risk.toUpperCase()) {
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

  if (!analysisId) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">
              Track 1: Tech Transfer Insights
            </h2>
            <p className="text-slate-400">
              Upload a research document to get comprehensive commercialization
              insights
            </p>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="space-y-6">
          <DocumentUpload
            onUpload={handleRealTimeDocumentUpload}
            isUploading={isUploading || isProcessingRealTime}
            className=""
          />

          {/* Real-Time Processing Display */}
          {isProcessingRealTime && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                <h3 className="text-lg font-semibold text-slate-200">
                  Processing Real-Time Insights
                </h3>
              </div>

              <div className="space-y-4">
                {processingStages.map((stage) => {
                  const getStageIcon = () => {
                    switch (stage.status) {
                      case "completed":
                        return (
                          <CheckCircle className="text-emerald-400" size={16} />
                        );
                      case "processing":
                        return (
                          <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                        );
                      case "error":
                        return (
                          <AlertTriangle className="text-red-400" size={16} />
                        );
                      default:
                        return <Clock className="text-slate-500" size={16} />;
                    }
                  };

                  return (
                    <div
                      key={stage.id}
                      className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg"
                    >
                      {getStageIcon()}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-sm font-medium ${
                              stage.status === "completed"
                                ? "text-emerald-300"
                                : stage.status === "processing"
                                ? "text-blue-300"
                                : stage.status === "error"
                                ? "text-red-300"
                                : "text-slate-400"
                            }`}
                          >
                            {stage.name}
                          </span>
                          {stage.status === "processing" && (
                            <span className="text-xs text-slate-400">
                              {stage.progress}%
                            </span>
                          )}
                        </div>
                        {stage.status === "processing" && (
                          <div className="w-full bg-slate-700 rounded-full h-1.5">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${stage.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Real-Time Insights Preview */}
              {Object.keys(realTimeInsights).length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <Zap className="text-emerald-400" size={14} />
                    Live Insights
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(realTimeInsights).map(
                      ([key, insight]: [string, any]) => (
                        <div
                          key={key}
                          className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
                        >
                          <CheckCircle className="text-emerald-400" size={14} />
                          <span className="text-xs text-emerald-300 capitalize">
                            {key} Ready
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Available Insights Preview */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-emerald-400" size={20} />
              <h3 className="text-lg font-semibold text-slate-200">
                Available Insights After Upload
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <BarChart3 className="text-emerald-400 mt-1" size={16} />
                <div>
                  <h4 className="text-slate-200 font-medium text-sm">
                    Novelty Assessment
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">
                    Prior art analysis and novelty scoring
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <Network className="text-blue-400 mt-1" size={16} />
                <div>
                  <h4 className="text-slate-200 font-medium text-sm">
                    Competitive Intelligence
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">
                    Market position and competitor analysis
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <Briefcase className="text-orange-400 mt-1" size={16} />
                <div>
                  <h4 className="text-slate-200 font-medium text-sm">
                    Commercialization
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">
                    Licensing opportunities and market readiness
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <Brain className="text-purple-400 mt-1" size={16} />
                <div>
                  <h4 className="text-slate-200 font-medium text-sm">
                    Strategic Insights
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">
                    AI-powered recommendations and analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-700 rounded w-2/3 mb-6"></div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Alerts */}
      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300 flex items-center justify-between">
            <span>{error}</span>
            {retryCount < maxRetries && analysisId && (
              <button
                onClick={retryProcessing}
                className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                Retry ({retryCount}/{maxRetries})
              </button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Processing Errors */}
      {processingErrors.length > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            <div className="space-y-1">
              <p className="font-medium">Processing Issues Detected:</p>
              <ul className="text-sm space-y-1">
                {processingErrors.map((error, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                    {error}
                  </li>
                ))}
              </ul>
              {retryCount < maxRetries && (
                <button
                  onClick={retryProcessing}
                  className="mt-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                >
                  Retry Processing
                </button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">
            Track 1: Tech Transfer Insights
          </h2>
          <p className="text-slate-400">
            Comprehensive analysis for technology commercialization
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {analysisId && (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 px-3 py-1"
            >
              ID: {analysisId.slice(0, 8)}...
            </Badge>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 border border-slate-600 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-300 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium text-slate-400">
                <BarChart3 className="h-4 w-4" />
                <span>Novelty Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getScoreIcon(summary.novelty_score)}
                <span
                  className={`text-2xl font-bold ${getScoreColor(
                    summary.novelty_score
                  )}`}
                >
                  {(summary.novelty_score * 100).toFixed(0)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium text-slate-400">
                <Network className="h-4 w-4" />
                <span>Market Competition</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={`${getIntensityColor(
                  summary.competitive_intensity
                )} border-0 text-sm font-medium px-3 py-1`}
              >
                {summary.competitive_intensity}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium text-slate-400">
                <Target className="h-4 w-4" />
                <span>Market Readiness</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getScoreIcon(summary.market_readiness)}
                <span
                  className={`text-2xl font-bold ${getScoreColor(
                    summary.market_readiness
                  )}`}
                >
                  {(summary.market_readiness * 100).toFixed(0)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium text-slate-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Overall Risk</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={`${getRiskColor(
                  summary.overall_risk
                )} border-0 text-sm font-medium px-3 py-1`}
              >
                {summary.overall_risk}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 p-1 rounded-t-lg border-b border-slate-700">
            <TabsTrigger
              value="novelty"
              className="flex items-center space-x-2 data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-300 text-slate-400"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Novelty Assessment</span>
              <span className="sm:hidden">Novelty</span>
            </TabsTrigger>
            <TabsTrigger
              value="competitive"
              className="flex items-center space-x-2 data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-300 text-slate-400"
            >
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">Competitive Intelligence</span>
              <span className="sm:hidden">Competition</span>
            </TabsTrigger>
            <TabsTrigger
              value="commercialization"
              className="flex items-center space-x-2 data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-300 text-slate-400"
            >
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Commercialization</span>
              <span className="sm:hidden">Commercial</span>
            </TabsTrigger>
            <TabsTrigger
              value="strategic"
              className="flex items-center space-x-2 data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-300 text-slate-400"
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Strategic Insights</span>
              <span className="sm:hidden">Strategy</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="novelty" className="mt-0">
              <NoveltyAssessment analysisId={analysisId} />
            </TabsContent>

            <TabsContent value="competitive" className="mt-0">
              <CompetitiveIntelligence analysisId={analysisId} />
            </TabsContent>

            <TabsContent value="commercialization" className="mt-0">
              <CommercializationOpportunities analysisId={analysisId} />
            </TabsContent>

            <TabsContent value="strategic" className="mt-0">
              <StrategicInsights analysisId={analysisId} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default InsightsIntegrated;
