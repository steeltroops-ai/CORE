"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import NoveltyAssessment from "@/components/NoveltyAssessment";
import CompetitiveIntelligence from "@/components/CompetitiveIntelligence";
import CommercializationOpportunities from "@/components/CommercializationOpportunities";
import StrategicInsights from "@/components/StrategicInsights";
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
  Eye,
} from "lucide-react";

interface InsightsSummary {
  novelty_score: number;
  competitive_intensity: string;
  market_readiness: number;
  overall_risk: string;
  key_recommendations: number;
  licensing_opportunities: number;
}

const InsightsPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const analysisId = searchParams?.get('analysisId');
  
  const [activeTab, setActiveTab] = useState("overview");
  const [summary, setSummary] = useState<InsightsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (analysisId) {
      fetchSummaryData();
    } else {
      setLoading(false);
      setError("No analysis ID provided. Please upload a document first.");
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
        throw new Error(
          `Failed to fetch insights summary: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Extract summary metrics from comprehensive data
      const summaryData: InsightsSummary = {
        novelty_score:
          data.novelty_assessment?.novelty_score ||
          data.basic_analysis?.novelty_score ||
          0,
        competitive_intensity:
          data.competitive_intelligence?.market_position
            ?.competitive_intensity || "UNKNOWN",
        market_readiness:
          data.commercialization?.market_readiness?.readiness_score || 0,
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
      setError(
        err instanceof Error ? err.message : "Failed to load insights summary"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSummaryData();
    setRefreshing(false);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Analysis Available
          </h2>
          <p className="text-gray-600 mb-6">
            Please upload a document first to view insights.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            </div>

            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Track 1: Tech Transfer Insights
                </h1>
                <p className="text-lg text-gray-600">
                  Comprehensive analysis for technology commercialization and
                  market entry strategy
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 px-3 py-1"
                >
                  Analysis ID: {analysisId?.slice(0, 8)}...
                </Badge>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-sm font-medium text-gray-600">
                      <BarChart3 className="h-4 w-4" />
                      <span>Novelty Score</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {getScoreIcon(summary.novelty_score)}
                      <span
                        className={`text-2xl font-bold ${
                          getScoreColor(summary.novelty_score)
                        }`}
                      >
                        {(summary.novelty_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-sm font-medium text-gray-600">
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

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-sm font-medium text-gray-600">
                      <Target className="h-4 w-4" />
                      <span>Market Readiness</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {getScoreIcon(summary.market_readiness)}
                      <span
                        className={`text-2xl font-bold ${
                          getScoreColor(summary.market_readiness)
                        }`}
                      >
                        {(summary.market_readiness * 100).toFixed(0)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-sm font-medium text-gray-600">
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
          </div>

          {/* Main Content Tabs */}
          <div className="bg-white rounded-lg shadow-sm border">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 bg-gray-50 p-1 rounded-t-lg">
                <TabsTrigger
                  value="novelty"
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Novelty Assessment</span>
                  <span className="sm:hidden">Novelty</span>
                </TabsTrigger>
                <TabsTrigger
                  value="competitive"
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Network className="h-4 w-4" />
                  <span className="hidden sm:inline">Competitive Intelligence</span>
                  <span className="sm:hidden">Competition</span>
                </TabsTrigger>
                <TabsTrigger
                  value="commercialization"
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Commercialization</span>
                  <span className="sm:hidden">Commercial</span>
                </TabsTrigger>
                <TabsTrigger
                  value="strategic"
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
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
      </div>
    </div>
  );
};

const InsightsPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading insights...</p>
        </div>
      </div>
    }>
      <InsightsPageContent />
    </Suspense>
  );
};

export default InsightsPage;