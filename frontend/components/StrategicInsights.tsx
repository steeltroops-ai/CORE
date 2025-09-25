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
} from "lucide-react";

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
}

const StrategicInsights: React.FC<StrategicInsightsProps> = ({
  analysisId,
  className = "",
}) => {
  const [data, setData] = useState<StrategicInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      {/* AI Recommendations Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <CardTitle>AI-Powered Strategic Recommendations</CardTitle>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Zap className="h-3 w-3 mr-1" />
              Claude AI Analysis
            </Badge>
          </div>
          <CardDescription>
            Strategic recommendations generated by advanced AI analysis of your
            technology and market context
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recommendations.length > 0 ? (
            <div className="space-y-4">
              {data.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <h4 className="font-medium text-gray-900">
                          {rec.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={getPriorityColor(rec.priority)}
                    >
                      {rec.priority} Priority
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2 mt-3">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Timeframe: {rec.timeframe}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No strategic recommendations available</p>
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
