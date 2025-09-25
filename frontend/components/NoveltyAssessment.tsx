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
} from "lucide-react";

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
}

const NoveltyAssessment: React.FC<NoveltyAssessmentProps> = ({
  analysisId,
  className = "",
}) => {
  const [data, setData] = useState<NoveltyAssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      {/* Novelty Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle>Novelty Assessment</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {getNoveltyScoreIcon(data.novelty_score)}
              <span
                className={`text-2xl font-bold ${getNoveltyScoreColor(
                  data.novelty_score
                )}`}
              >
                {(data.novelty_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <CardDescription>
            Technology novelty score with{" "}
            {(
              (data.confidence_interval[1] - data.confidence_interval[0]) *
              100
            ).toFixed(1)}
            % confidence interval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Novelty Score</span>
                <span>{(data.novelty_score * 100).toFixed(1)}%</span>
              </div>
              <Progress value={data.novelty_score * 100} className="h-3" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>
                  CI: {(data.confidence_interval[0] * 100).toFixed(1)}%
                </span>
                <span>
                  CI: {(data.confidence_interval[1] * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Freedom to Operate:</span>
              <Badge
                variant={getRiskBadgeVariant(data.freedom_to_operate_risk)}
              >
                {data.freedom_to_operate_risk}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="prior-art" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prior-art">Prior Art Landscape</TabsTrigger>
          <TabsTrigger value="claims-analysis">Claims Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="prior-art" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Prior Art Landscape</span>
              </CardTitle>
              <CardDescription>
                Most similar patents and publications in the technology space
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.prior_art_landscape.length > 0 ? (
                <div className="space-y-4">
                  {data.prior_art_landscape.map((item, index) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {item.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                            <Badge variant="outline">{item.type}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${getNoveltyScoreColor(
                              item.score
                            )}`}
                          >
                            {(item.score * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">
                            Similarity
                          </div>
                        </div>
                      </div>

                      {item.assignees.length > 0 && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Building className="h-3 w-3 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {item.assignees.slice(0, 3).map((assignee, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {assignee}
                              </Badge>
                            ))}
                            {item.assignees.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{item.assignees.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No prior art data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Claims Overlap Analysis</span>
              </CardTitle>
              <CardDescription>
                Potential patent claims conflicts and infringement risks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.claims_analysis.length > 0 ? (
                <div className="space-y-4">
                  {data.claims_analysis.map((claim, index) => (
                    <div
                      key={claim.patent_id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {claim.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <FileText className="h-3 w-3" />
                              <span>{claim.patent_id}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div
                            className={`text-lg font-bold ${getNoveltyScoreColor(
                              claim.overlap_score
                            )}`}
                          >
                            {(claim.overlap_score * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">Overlap</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <Building className="h-3 w-3 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {claim.assignees
                              .slice(0, 2)
                              .map((assignee, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {assignee}
                                </Badge>
                              ))}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getRiskLevelColor(
                            claim.risk_level
                          )} border-0`}
                        >
                          {claim.risk_level} Risk
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No claims analysis data available</p>
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
