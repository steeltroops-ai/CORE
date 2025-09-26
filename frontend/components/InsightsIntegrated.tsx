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
import NoveltyAssessment from "./NoveltyAssessment";
import CompetitiveIntelligence from "./CompetitiveIntelligence";
import CommercializationOpportunities from "./CommercializationOpportunities";
import StrategicInsights from "./StrategicInsights";
import ProcessingPipeline from "./ProcessingPipeline";
import UserPersonaSelector from "./UserPersonaSelector";
import InsightsDashboard from "./InsightsDashboard";
import ErrorBoundary from "./ErrorBoundary";
import LoadingSpinner, { SkeletonCard, SkeletonChart } from "./LoadingSpinner";
import { AccessibilityProvider } from "./AccessibilityProvider";

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
  FileText,
  Search,
  Cpu,
  Database,
  Activity,
  Download,
  Share2,
  Settings,
  Eye,
  Code,
  Timer,
  Layers,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Info,
  Users,
  Building,
  Globe,
  DollarSign,
  TrendingDown,
  Shield,
  Lightbulb,
  BookOpen,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Link,
  Filter,
  SortAsc,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  WifiOff,
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
  description: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  duration?: number;
  startTime?: number;
  endTime?: number;
  result?: any;
  apiCalls?: number;
  tokensUsed?: number;
  errorMessage?: string;
}

interface UserPersona {
  id: string;
  name: string;
  role: string;
  preferences: {
    showTechnicalDetails: boolean;
    showProcessingMetrics: boolean;
    preferredView: 'overview' | 'detailed' | 'technical';
  };
}

interface ProcessingMetrics {
  totalDuration: number;
  apiCalls: number;
  tokensUsed: number;
  successRate: number;
  averageResponseTime: number;
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
  const [userPersona, setUserPersona] = useState<UserPersona>({
    id: 'researcher',
    name: 'Researcher',
    role: 'Research Scientist',
    preferences: {
      showTechnicalDetails: false,
      showProcessingMetrics: false,
      preferredView: 'overview'
    }
  });
  const [processingMetrics, setProcessingMetrics] = useState<ProcessingMetrics>({
    totalDuration: 0,
    apiCalls: 0,
    tokensUsed: 0,
    successRate: 100,
    averageResponseTime: 0
  });
  const [showDeveloperMode, setShowDeveloperMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'json'>('pdf');
  const [showDeveloperTools, setShowDeveloperTools] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  useEffect(() => {
    if (analysisId) {
      fetchSummaryData();
    } else {
      setLoading(false);
      setError("No analysis available. Please upload a document first.");
    }
  }, [analysisId]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('online');
      if (error && error.includes('Network error')) {
        // Retry fetching data when connection is restored
        fetchSummaryData();
      }
    };
    
    const handleOffline = () => {
      setConnectionStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error]);

  const fetchSummaryData = useCallback(async (retryCount = 0) => {
    if (!analysisId) return;

    try {
      setLoading(true);
      setError(null);
      setLastError(null);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(
        `/api/analysis/${analysisId}/track1/comprehensive`,
        {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
          `Failed to fetch insights summary (${response.status}): ${errorText}`
        );
        
        // Check if it's a network error that might benefit from retry
        if (response.status >= 500 && retryCount < maxRetries) {
          console.warn(`Server error, retrying... (${retryCount + 1}/${maxRetries})`);
          setRetryAttempts(retryCount + 1);
          setTimeout(() => fetchSummaryData(retryCount + 1), Math.pow(2, retryCount) * 1000);
          return;
        }
        
        throw error;
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
      setRetryAttempts(0);
      setConnectionStatus('online');
    } catch (err) {
      console.error("Error fetching insights summary:", err);
      setLastError(err instanceof Error ? err : new Error('Unknown error'));
      
      let errorMessage = "Failed to load insights summary";
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = "Request timed out. Please check your connection and try again.";
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = "Network error. Please check your internet connection.";
          setConnectionStatus('offline');
        } else {
          errorMessage = err.message;
        }
      }
      
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
  }, [analysisId, maxRetries, setRetryAttempts, setConnectionStatus, setSummary, setError, setLastError, setLoading]);

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
        description: "Extracting and parsing document content",
        status: "pending",
        progress: 0,
        apiCalls: 0,
        tokensUsed: 0,
      },
      {
        id: "logic_mill",
        name: "Patent & Publication Search",
        description: "Searching 70M+ patents and publications using Logic Mill API",
        status: "pending",
        progress: 0,
        apiCalls: 0,
        tokensUsed: 0,
      },
      {
        id: "claude",
        name: "AI Strategic Analysis",
        description: "Generating strategic insights using Claude AI",
        status: "pending",
        progress: 0,
        apiCalls: 0,
        tokensUsed: 0,
      },
      {
        id: "novelty",
        name: "Novelty Assessment",
        description: "Analyzing technology novelty and prior art landscape",
        status: "pending",
        progress: 0,
        apiCalls: 0,
        tokensUsed: 0,
      },
      {
        id: "competitive",
        name: "Competitive Intelligence",
        description: "Mapping competitive landscape and market position",
        status: "pending",
        progress: 0,
        apiCalls: 0,
        tokensUsed: 0,
      },
      {
        id: "commercialization",
        name: "Commercialization Analysis",
        description: "Identifying licensing opportunities and market readiness",
        status: "pending",
        progress: 0,
        apiCalls: 0,
        tokensUsed: 0,
      },
      {
        id: "strategic",
        name: "Strategic Insights",
        description: "Generating AI-powered recommendations and risk assessment",
        status: "pending",
        progress: 0,
        apiCalls: 0,
        tokensUsed: 0,
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
      prev.map((stage) => {
        if (stage.id === stageId) {
          const updatedStage = { ...stage, ...updates };
          
          // Track timing
          if (updates.status === 'processing' && !stage.startTime) {
            updatedStage.startTime = Date.now();
          }
          if (updates.status === 'completed' && stage.startTime) {
            updatedStage.endTime = Date.now();
            updatedStage.duration = updatedStage.endTime - stage.startTime;
          }
          
          return updatedStage;
        }
        return stage;
      })
    );
    
    // Update processing metrics
    if (updates.status === 'completed') {
      setProcessingMetrics(prev => ({
        ...prev,
        apiCalls: prev.apiCalls + (updates.apiCalls || 0),
        tokensUsed: prev.tokensUsed + (updates.tokensUsed || 0)
      }));
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleExport = async (format: string, data?: any) => {
    // Implementation for export functionality
    console.log(`Exporting insights in ${format} format for analysis ${analysisId}`, data);
  };

  const handleShare = async () => {
    // Implementation for sharing functionality
    const shareUrl = `${window.location.origin}/insights?analysisId=${analysisId}`;
    if (navigator.share) {
      await navigator.share({
        title: 'CORE Tech Transfer Insights',
        text: 'Check out these technology commercialization insights',
        url: shareUrl
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
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
      <AccessibilityProvider>
        <ErrorBoundary>
          <div className={`space-y-6 ${className}`} role="main" aria-label="Tech Transfer Insights">
            {/* Skip Link for Accessibility */}
            <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
              Skip to main content
            </a>
            
            {/* Connection Status */}
            {connectionStatus === 'offline' && (
              <Alert className="border-orange-200 bg-orange-50">
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  You&apos;re currently offline. Some features may not be available.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Header */}
            <div className="flex items-center justify-between" id="main-content">
              <div>
                <h1 className="text-2xl font-bold text-slate-200 mb-2">
                  Track 1: Tech Transfer Insights
                </h1>
                <p className="text-slate-400">
                  Upload a research document to get comprehensive commercialization insights
                </p>
              </div>
            </div>

        {/* Document Upload Section */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
            <Upload className="mx-auto mb-4 text-slate-400" size={48} />
            <h3 className="text-lg font-medium text-white mb-2">Upload Research Document</h3>
            <p className="text-slate-400 mb-4">Document upload functionality will be available soon.</p>
            <button 
              disabled 
              className="px-4 py-2 bg-slate-700 text-slate-400 rounded-lg cursor-not-allowed"
            >
              Upload Document
            </button>
          </div>

          {/* User Persona Selector */}
          <UserPersonaSelector
            currentPersona={userPersona}
            onPersonaChange={setUserPersona}
            className="mb-6"
          />

          {/* Real-Time Processing Display */}
          {isProcessingRealTime && (
            <ProcessingPipeline
              stages={processingStages}
              isProcessing={isProcessingRealTime}
              showTechnicalDetails={userPersona.preferences.showTechnicalDetails}
              className="mb-6"
            />
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
        
        {/* Removed Accessibility Button and Developer Tools for cleaner UI */}
      </div>
      </ErrorBoundary>
      </AccessibilityProvider>
    );
  }

  if (loading) {
    return (
      <AccessibilityProvider>
        <ErrorBoundary>
          <div className={`space-y-6 ${className}`} role="main" aria-label="Loading insights" aria-busy="true">
            {/* Loading Announcement for Screen Readers */}
            <div className="sr-only" aria-live="polite">
              Loading technology transfer insights. Please wait...
              {retryAttempts > 0 && ` Retry attempt ${retryAttempts} of ${maxRetries}.`}
            </div>
            
            {/* Connection Status */}
            {connectionStatus === 'offline' && (
              <Alert className="border-orange-200 bg-orange-50">
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  You&apos;re currently offline. Loading cached data if available.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Loading Spinner with Stage Information */}
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner 
                size="lg" 
                variant="themed" 
                stage={isProcessingRealTime ? 'analyzing' : 'processing'}
                text={retryAttempts > 0 ? `Retrying... (${retryAttempts}/${maxRetries})` : undefined}
              />
              
              {/* Progress Information */}
              {processingStages.length > 0 && (
                <div className="mt-6 w-full max-w-md">
                  <div className="text-sm text-slate-400 mb-2 text-center">
                    Processing Stage: {processingStages.find(s => s.status === 'processing')?.name || 'Initializing'}
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(processingStages.filter(s => s.status === 'completed').length / processingStages.length) * 100}%` 
                      }}
                      role="progressbar"
                      aria-valuenow={(processingStages.filter(s => s.status === 'completed').length / processingStages.length) * 100}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Processing progress"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Header Skeleton */}
            <SkeletonCard className="h-20" />

            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} className="h-24" />
              ))}
            </div>
            
            {/* Chart Skeleton */}
            <SkeletonChart className="h-64" />
            
            {/* Removed Accessibility Button and Developer Tools for cleaner UI */}
          </div>
        </ErrorBoundary>
      </AccessibilityProvider>
    );
  }

  return (
    <AccessibilityProvider>
      <ErrorBoundary>
        <div className={`space-y-6 ${className}`} role="main" aria-label="Technology Transfer Insights">
          {/* Skip Link for Accessibility */}
          <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
            Skip to main content
          </a>
          
          {/* Connection Status */}
          {connectionStatus === 'offline' && (
            <Alert className="border-orange-200 bg-orange-50">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                You&apos;re currently offline. Some features may not be available.
              </AlertDescription>
            </Alert>
          )}
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

      {/* User Persona Selector */}
      <UserPersonaSelector
        currentPersona={userPersona}
        onPersonaChange={setUserPersona}
        className="mb-6"
      />

      {/* Enhanced Dashboard */}
      {summary && (
        <InsightsDashboard
          summary={summary}
          analysisId={analysisId}
          onTabChange={setActiveTab}
          onExport={handleExport}
          onShare={handleShare}
          showTechnicalDetails={userPersona.preferences.showTechnicalDetails}
          className="mb-6"
        />
      )}

      {/* Processing Pipeline */}
      {(isProcessingRealTime || processingStages.length > 0) && (
        <ProcessingPipeline
          stages={processingStages}
          isProcessing={isProcessingRealTime}
          showTechnicalDetails={userPersona.preferences.showTechnicalDetails}
          className="mb-6"
        />
      )}

      {/* Developer Mode Toggle */}
      {userPersona.id === 'developer' && (
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="text-emerald-400" size={16} />
                <span className="text-sm font-medium text-slate-300">Developer Mode</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeveloperMode(!showDeveloperMode)}
                className={`border-slate-600 text-slate-300 hover:bg-slate-700 ${
                  showDeveloperMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : ''
                }`}
              >
                {showDeveloperMode ? 'Hide' : 'Show'} Technical Details
              </Button>
            </div>
            
            {showDeveloperMode && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-emerald-300">
                      {processingMetrics.apiCalls}
                    </div>
                    <div className="text-xs text-slate-400">Total API Calls</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-300">
                      {processingMetrics.tokensUsed.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">Tokens Used</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-purple-300">
                      {processingMetrics.successRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-400">Success Rate</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-yellow-300">
                      {processingMetrics.averageResponseTime.toFixed(0)}ms
                    </div>
                    <div className="text-xs text-slate-400">Avg Response</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <div id="main-content" className="bg-slate-900/50 border border-slate-800 rounded-lg">
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
              <NoveltyAssessment 
                analysisId={analysisId} 
                showTechnicalDetails={userPersona.preferences.showTechnicalDetails}
                onExport={handleExport}
                onShare={handleShare}
              />
            </TabsContent>

            <TabsContent value="competitive" className="mt-0">
              <CompetitiveIntelligence 
                analysisId={analysisId} 
                showTechnicalDetails={userPersona.preferences.showTechnicalDetails}
                onExport={handleExport}
                onShare={handleShare}
              />
            </TabsContent>

            <TabsContent value="commercialization" className="mt-0">
              <CommercializationOpportunities 
                analysisId={analysisId} 
                showTechnicalDetails={userPersona.preferences.showTechnicalDetails}
                onExport={handleExport}
                onShare={handleShare}
              />
            </TabsContent>

            <TabsContent value="strategic" className="mt-0">
              <StrategicInsights 
                analysisId={analysisId} 
                showTechnicalDetails={userPersona.preferences.showTechnicalDetails}
                onExport={handleExport}
                onShare={handleShare}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Removed Accessibility Button and Developer Tools for cleaner UI */}
    </div>
    </ErrorBoundary>
    </AccessibilityProvider>
  );
};

export default InsightsIntegrated;
