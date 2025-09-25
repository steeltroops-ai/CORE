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
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Briefcase,
  FileText,
  Shield,
  Users,
  Globe,
  Zap,
  ArrowRight,
  Calendar,
  Building,
} from "lucide-react";

interface CommercializationData {
  analysis_id: string;
  licensing_leads: Array<{
    target: string;
    licensing_model: string;
    revenue_potential: string;
    timeline: string;
  }>;
  market_readiness: {
    readiness_score: number;
    technology_maturity: string;
    market_demand: string;
    barriers: string[];
    enablers: string[];
  };
  ip_protection_roadmap: Array<{
    activity: string;
    timeline: string;
    priority: string;
    description: string;
  }>;
  technology_transfer_pathways: Array<{
    pathway: string;
    description: string;
    pros: string[];
    cons: string[];
    suitability: string;
  }>;
  revenue_potential: {
    market_size: string;
    revenue_streams: string[];
    growth_projection: string;
    risk_factors: string[];
  };
}

interface CommercializationOpportunitiesProps {
  analysisId: string;
  className?: string;
}

const CommercializationOpportunities: React.FC<
  CommercializationOpportunitiesProps
> = ({ analysisId, className = "" }) => {
  const [data, setData] = useState<CommercializationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommercializationData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/analysis/${analysisId}/track1/commercialization`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch commercialization data: ${response.statusText}`
          );
        }

        const commercializationData = await response.json();
        setData(commercializationData);
        setError(null);
      } catch (err) {
        console.error("Error fetching commercialization data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load commercialization opportunities"
        );
      } finally {
        setLoading(false);
      }
    };

    if (analysisId) {
      fetchCommercializationData();
    }
  }, [analysisId]);

  const getReadinessColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getReadinessIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 0.6) return <Clock className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

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

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability.toUpperCase()) {
      case "HIGH":
        return "text-green-600 bg-green-50";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50";
      case "LOW":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getRevenuePotentialIcon = (potential: string) => {
    switch (potential.toUpperCase()) {
      case "HIGH":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "MEDIUM":
        return <DollarSign className="h-4 w-4 text-yellow-600" />;
      case "LOW":
        return <Target className="h-4 w-4 text-red-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <CardTitle>Commercialization Opportunities</CardTitle>
            </div>
            <CardDescription>
              Analyzing market readiness and commercialization pathways...
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
            No commercialization data available
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Market Readiness Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <CardTitle>Market Readiness Assessment</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {getReadinessIcon(data.market_readiness.readiness_score)}
              <span
                className={`text-2xl font-bold ${getReadinessColor(
                  data.market_readiness.readiness_score
                )}`}
              >
                {(data.market_readiness.readiness_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <CardDescription>
            Overall assessment of technology and market readiness for
            commercialization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Market Readiness Score</span>
                <span>
                  {(data.market_readiness.readiness_score * 100).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={data.market_readiness.readiness_score * 100}
                className="h-3"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    Technology Maturity:
                  </span>
                  <Badge variant="outline">
                    {data.market_readiness.technology_maturity}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Market Demand:</span>
                  <Badge variant="outline">
                    {data.market_readiness.market_demand}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                {data.market_readiness.barriers.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-red-600">
                      Key Barriers:
                    </span>
                    <ul className="text-xs text-gray-600 mt-1">
                      {data.market_readiness.barriers
                        .slice(0, 2)
                        .map((barrier, index) => (
                          <li key={index}>• {barrier}</li>
                        ))}
                    </ul>
                  </div>
                )}
                {data.market_readiness.enablers.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-green-600">
                      Key Enablers:
                    </span>
                    <ul className="text-xs text-gray-600 mt-1">
                      {data.market_readiness.enablers
                        .slice(0, 2)
                        .map((enabler, index) => (
                          <li key={index}>• {enabler}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="licensing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="licensing">Licensing Leads</TabsTrigger>
          <TabsTrigger value="pathways">Transfer Pathways</TabsTrigger>
          <TabsTrigger value="ip-roadmap">IP Roadmap</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Potential</TabsTrigger>
        </TabsList>

        <TabsContent value="licensing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Licensing Opportunities</span>
              </CardTitle>
              <CardDescription>
                Potential licensing partners and revenue models
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.licensing_leads.length > 0 ? (
                <div className="space-y-4">
                  {data.licensing_leads.map((lead, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {lead.target}
                          </h4>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Model:</span>{" "}
                            {lead.licensing_model}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            {getRevenuePotentialIcon(lead.revenue_potential)}
                            <span className="text-sm font-medium">
                              {lead.revenue_potential}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Revenue Potential
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Timeline: {lead.timeline}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No licensing opportunities identified</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pathways" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowRight className="h-5 w-5" />
                <span>Technology Transfer Pathways</span>
              </CardTitle>
              <CardDescription>
                Different routes to market with pros, cons, and suitability
                assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.technology_transfer_pathways.length > 0 ? (
                <div className="space-y-4">
                  {data.technology_transfer_pathways.map((pathway, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {pathway.pathway}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            {pathway.description}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={getSuitabilityColor(pathway.suitability)}
                        >
                          {pathway.suitability} Suitability
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pathway.pros.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-green-600">
                              Advantages:
                            </span>
                            <ul className="text-sm text-gray-600 mt-1 space-y-1">
                              {pathway.pros.map((pro, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start space-x-1"
                                >
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {pathway.cons.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-red-600">
                              Challenges:
                            </span>
                            <ul className="text-sm text-gray-600 mt-1 space-y-1">
                              {pathway.cons.map((con, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start space-x-1"
                                >
                                  <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ArrowRight className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No transfer pathways identified</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ip-roadmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>IP Protection Roadmap</span>
              </CardTitle>
              <CardDescription>
                Strategic intellectual property protection timeline and
                priorities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.ip_protection_roadmap.length > 0 ? (
                <div className="space-y-4">
                  {data.ip_protection_roadmap.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {item.activity}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(item.priority)}
                        >
                          {item.priority} Priority
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-2 mt-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Timeline: {item.timeline}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No IP roadmap available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Revenue Potential Analysis</span>
              </CardTitle>
              <CardDescription>
                Market size, revenue streams, and growth projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Market Size */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Market Size</span>
                  </div>
                  <p className="text-gray-600">
                    {data.revenue_potential.market_size}
                  </p>
                </div>

                {/* Revenue Streams */}
                {data.revenue_potential.revenue_streams.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Revenue Streams</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.revenue_potential.revenue_streams.map(
                        (stream, index) => (
                          <Badge key={index} variant="secondary">
                            {stream}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Growth Projection */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Growth Projection</span>
                  </div>
                  <p className="text-gray-600">
                    {data.revenue_potential.growth_projection}
                  </p>
                </div>

                {/* Risk Factors */}
                {data.revenue_potential.risk_factors.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-medium">Risk Factors</span>
                    </div>
                    <ul className="space-y-1">
                      {data.revenue_potential.risk_factors.map(
                        (risk, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2 text-sm text-gray-600"
                          >
                            <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>{risk}</span>
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
      </Tabs>
    </div>
  );
};

export default CommercializationOpportunities;
