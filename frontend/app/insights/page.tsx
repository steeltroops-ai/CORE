"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { ViewContainer } from "@/components/ViewContainer";
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
import NoveltyAssessment from "@/components/NoveltyAssessment";
import CompetitiveIntelligence from "@/components/CompetitiveIntelligence";
import CommercializationOpportunities from "@/components/CommercializationOpportunities";
import StrategicInsights from "@/components/StrategicInsights";
import ProcessingPipeline from "@/components/ProcessingPipeline";
import UserPersonaSelector from "@/components/UserPersonaSelector";
import InsightsDashboard from "@/components/InsightsDashboard";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner, { SkeletonCard, SkeletonChart } from "@/components/LoadingSpinner";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import UploadAnalyzeCard from "@/components/UploadAnalyzeCard";
import { FileText, Users, DollarSign, Target, Upload, Search, Lightbulb, TrendingUp, Shield, RefreshCw, WifiOff } from "lucide-react";

interface InsightsSummary {
  novelty_score: number;
  competitive_intensity: string;
  market_readiness: number;
  overall_risk: string;
  key_recommendations: number;
  licensing_opportunities: number;
}

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

const InsightsPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const analysisId = searchParams?.get("analysisId");
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(analysisId);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [activeTab, setActiveTab] = useState("novelty");
  const [summary, setSummary] = useState<InsightsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');

  // Online/offline status detection
  useEffect(() => {
    const handleOnline = () => setConnectionStatus('online');
    const handleOffline = () => setConnectionStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchSummaryData = useCallback(async () => {
    if (!currentAnalysisId) return;

    try {
      setLoading(true);
      setError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(
        `/api/analysis/${currentAnalysisId}/track1/comprehensive`,
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const summaryData: InsightsSummary = {
        novelty_score: data.novelty_assessment?.novelty_score || 0.5,
        competitive_intensity: data.competitive_intelligence?.market_position?.competitive_intensity || "MEDIUM",
        market_readiness: data.commercialization?.market_readiness?.readiness_score || 0.5,
        overall_risk: data.strategic_insights?.risk_assessment?.overall_risk || "MEDIUM",
        key_recommendations: data.strategic_insights?.recommendations?.length || 0,
        licensing_opportunities: data.commercialization?.licensing_leads?.length || 0,
      };

      setSummary(summaryData);
    } catch (err) {
      console.error("Error fetching summary data:", err);
      setError("Failed to load insights data.");
      
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
  }, [currentAnalysisId]);

  useEffect(() => {
    if (currentAnalysisId && hasAnalyzed) {
      fetchSummaryData();
    }
  }, [currentAnalysisId, hasAnalyzed, fetchSummaryData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSummaryData();
    setRefreshing(false);
  };

  const handleDocumentAnalysis = async (documents: UploadedDocument[]) => {
    setIsAnalyzing(true);
    setError(null);
    setUploadedDocuments(documents);
    
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
      setCurrentAnalysisId('demo-sample-analysis'); // Use the sample analysis ID from backend
    }, 3000);
  };

  return (
    <AccessibilityProvider>
      <ErrorBoundary>
        <ViewContainer
          icon={FileText}
          title="Research Insights"
          subtitle="Comprehensive analysis and intelligence for your research documents"
        >
          {/* Header Actions */}
          <div className="flex items-center justify-end mb-6">
            <div className="flex items-center gap-2">
              {connectionStatus === 'offline' && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <WifiOff size={12} />
                  Offline
                </Badge>
              )}
              {hasAnalyzed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing || !currentAnalysisId}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
            </div>
          </div>

          {/* Main Layout: Upload Card Left, Results Right */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Upload Card - Left Side */}
            <div className="lg:col-span-1">
              <UploadAnalyzeCard
                title="Document Analysis"
                description="Upload your research document for comprehensive analysis including novelty assessment, competitive intelligence, commercialization opportunities, and strategic insights"
                icon={Upload}
                uploadType="pdf"
                onAnalyze={handleDocumentAnalysis}
                isAnalyzing={isAnalyzing}
                className="h-full min-h-96"
              />
            </div>
          
            {/* Analysis Results - Right Side */}
            <div className="lg:col-span-3">
              {currentAnalysisId ? (
                <div className="space-y-4">
                  {/* Similar Documents Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Search className="h-5 w-5 text-emerald-400" />
                        Similar Research Found
                      </CardTitle>
                      <CardDescription>
                        Documents with similar content and research focus
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-80 overflow-y-auto">
                      <div className="space-y-3">
                        <div className="p-3 bg-muted/50 rounded-lg border">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-medium">Neural Network Optimization Techniques for Deep Learning</h4>
                            <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">92%</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">Patent US10,123,456 • Published 2023</p>
                          <p className="text-xs mb-2 line-clamp-2">Advanced optimization methods for neural network training with improved convergence rates.</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">AI</Badge>
                            <Badge variant="secondary" className="text-xs">ML</Badge>
                            <Badge variant="secondary" className="text-xs">Optimization</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Analysis Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Novelty Assessment Card */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-blue-400" />
                          Novelty Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-4">
                          <div className="text-2xl font-bold text-blue-600 mb-1">78%</div>
                          <div className="text-xs text-muted-foreground">Uniqueness Score</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Prior Art</span>
                            <span>247 found</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Novelty Level</span>
                            <Badge className="bg-blue-500/20 text-blue-600">High</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Competitive Intelligence Card */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Target className="h-4 w-4 text-red-400" />
                          Competitive Intelligence
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-600 mb-1">Medium</div>
                            <div className="text-xs text-muted-foreground">Competition Level</div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Key Players</span>
                              <span>12</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Market Share</span>
                              <span>15%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Commercialization Card */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-400" />
                          Commercialization
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600 mb-1">High</div>
                            <div className="text-xs text-muted-foreground">Market Potential</div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">TRL Level</span>
                              <span>6/9</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Licensing Ops</span>
                              <span>8</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <CardContent className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Analysis Available</h3>
                    <p className="text-muted-foreground">Upload a document to begin analysis</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Detailed Analysis Tabs */}
          {currentAnalysisId && (
            <div className="mt-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="novelty">Novelty</TabsTrigger>
                  <TabsTrigger value="competitive">Competitive</TabsTrigger>
                  <TabsTrigger value="commercialization">Commercial</TabsTrigger>
                  <TabsTrigger value="strategic">Strategic</TabsTrigger>
                </TabsList>
                
                <TabsContent value="novelty" className="mt-6">
                  <NoveltyAssessment analysisId={currentAnalysisId} />
                </TabsContent>
                
                <TabsContent value="competitive" className="mt-6">
                  <CompetitiveIntelligence analysisId={currentAnalysisId} />
                </TabsContent>
                
                <TabsContent value="commercialization" className="mt-6">
                  <CommercializationOpportunities analysisId={currentAnalysisId} />
                </TabsContent>
                
                <TabsContent value="strategic" className="mt-6">
                  <StrategicInsights analysisId={currentAnalysisId} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </ViewContainer>
      </ErrorBoundary>
    </AccessibilityProvider>
  );
};

const InsightsPage: React.FC = () => {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <InsightsPageContent />
      </Suspense>
    </AppLayout>
  );
};

export default InsightsPage;