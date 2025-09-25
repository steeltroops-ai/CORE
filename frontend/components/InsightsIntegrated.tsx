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
} from "lucide-react";

interface InsightsIntegratedProps {
  analysisId: string | null;
  className?: string;
}

interface InsightsSummary {
  novelty_score: number;
  competitive_intensity: string;
  market_readiness: number;
  overall_risk: string;
  key_recommendations: number;
  licensing_opportunities: number;
}

const InsightsIntegrated: React.FC<InsightsIntegratedProps> = ({
  analysisId,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("novelty");
  const [summary, setSummary] = useState<InsightsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
      <div className={`bg-slate-900/50 border border-slate-800 rounded-lg p-8 text-center ${className}`}>
        <p className="text-slate-400">
          Please upload a document to view Track 1 insights.
        </p>
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
      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            {error}
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
                  className={`text-2xl font-bold ${
                    getScoreColor(summary.novelty_score)
                  }`}
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
                  className={`text-2xl font-bold ${
                    getScoreColor(summary.market_readiness)
                  }`}
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
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
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