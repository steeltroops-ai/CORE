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
  Users,
  Building,
  Network,
  TrendingUp,
  AlertTriangle,
  FileText,
  Briefcase,
  Target,
  Globe,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";

interface CompetitiveIntelligenceData {
  analysis_id: string;
  inventor_network: {
    top_inventors: Array<{
      name: string;
      patent_count: number;
      patents: Array<{
        document_id: string;
        title: string;
        score: number;
      }>;
    }>;
    key_collaborations: Array<{
      inventors: string[];
      collaboration_count: number;
    }>;
    network_density: number;
  };
  institution_mapping: Record<
    string,
    Array<{
      document_id: string;
      title: string;
      type: string;
      score: number;
    }>
  >;
  patent_portfolio_analysis: Record<
    string,
    {
      patent_count: number;
      avg_similarity: number;
      strength: string;
      top_patents: Array<{
        patent_id: string;
        title: string;
        similarity_score: number;
      }>;
    }
  >;
  collaboration_networks: Array<{
    organizations: string[];
    collaboration_count: number;
    strength: string;
  }>;
  market_position: {
    patent_density: number;
    competitive_intensity: string;
    market_maturity: string;
    innovation_opportunity: string;
    key_players: string[];
  };
}

interface CompetitiveIntelligenceProps {
  analysisId: string;
  className?: string;
}

const CompetitiveIntelligence: React.FC<CompetitiveIntelligenceProps> = ({
  analysisId,
  className = "",
}) => {
  const [data, setData] = useState<CompetitiveIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompetitiveData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/analysis/${analysisId}/track1/competitive`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch competitive intelligence: ${response.statusText}`
          );
        }

        const competitiveData = await response.json();
        setData(competitiveData);
        setError(null);
      } catch (err) {
        console.error("Error fetching competitive intelligence:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load competitive intelligence"
        );
      } finally {
        setLoading(false);
      }
    };

    if (analysisId) {
      fetchCompetitiveData();
    }
  }, [analysisId]);

  const getStrengthColor = (strength: string) => {
    switch (strength.toUpperCase()) {
      case "HIGH":
      case "STRONG":
        return "text-green-600 bg-green-50";
      case "MEDIUM":
      case "MODERATE":
        return "text-yellow-600 bg-yellow-50";
      case "LOW":
      case "WEAK":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getIntensityIcon = (intensity: string) => {
    switch (intensity.toUpperCase()) {
      case "HIGH":
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case "MEDIUM":
        return <Activity className="h-4 w-4 text-yellow-600" />;
      case "LOW":
        return <BarChart3 className="h-4 w-4 text-green-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Network className="h-5 w-5" />
              <CardTitle>Competitive Intelligence</CardTitle>
            </div>
            <CardDescription>
              Analyzing competitive landscape and market position...
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
            No competitive intelligence data available
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Market Position Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Market Position Analysis</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {getIntensityIcon(data.market_position.competitive_intensity)}
              <span className="text-sm font-medium">
                {data.market_position.competitive_intensity} Competition
              </span>
            </div>
          </div>
          <CardDescription>
            Competitive landscape analysis and market maturity assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <PieChart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {(data.market_position.patent_density * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Patent Density</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-lg font-bold text-purple-600">
                {data.market_position.market_maturity}
              </div>
              <div className="text-sm text-gray-600">Market Maturity</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-lg font-bold text-green-600">
                {data.market_position.innovation_opportunity}
              </div>
              <div className="text-sm text-gray-600">
                Innovation Opportunity
              </div>
            </div>
          </div>

          {data.market_position.key_players.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Key Market Players
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.market_position.key_players.map((player, index) => (
                  <Badge key={index} variant="secondary">
                    {player}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="inventors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventors">Inventor Network</TabsTrigger>
          <TabsTrigger value="institutions">Institutions</TabsTrigger>
          <TabsTrigger value="portfolios">Patent Portfolios</TabsTrigger>
          <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
        </TabsList>

        <TabsContent value="inventors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Inventor Network Analysis</span>
              </CardTitle>
              <CardDescription>
                Key inventors and their collaboration patterns
                {data.inventor_network.network_density > 0 && (
                  <span className="ml-2">
                    • Network Density:{" "}
                    {(data.inventor_network.network_density * 100).toFixed(1)}%
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Top Inventors */}
                {data.inventor_network.top_inventors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Top Inventors
                    </h4>
                    <div className="space-y-3">
                      {data.inventor_network.top_inventors.map(
                        (inventor, index) => (
                          <div
                            key={inventor.name}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">
                                  {inventor.name}
                                </span>
                              </div>
                              <Badge variant="outline">
                                {inventor.patent_count} patents
                              </Badge>
                            </div>
                            {inventor.patents.length > 0 && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">
                                  Recent work:
                                </span>
                                <ul className="mt-1 space-y-1">
                                  {inventor.patents
                                    .slice(0, 2)
                                    .map((patent, idx) => (
                                      <li key={idx} className="truncate">
                                        • {patent.title} (
                                        {(patent.score * 100).toFixed(1)}%
                                        similarity)
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Key Collaborations */}
                {data.inventor_network.key_collaborations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Key Collaborations
                    </h4>
                    <div className="space-y-2">
                      {data.inventor_network.key_collaborations
                        .slice(0, 5)
                        .map((collab, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <Network className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {collab.inventors.join(" ↔ ")}
                              </span>
                            </div>
                            <Badge variant="secondary">
                              {collab.collaboration_count} collaborations
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="institutions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Institution Mapping</span>
              </CardTitle>
              <CardDescription>
                Research institutions and their patent/publication activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(data.institution_mapping).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(data.institution_mapping)
                    .slice(0, 8)
                    .map(([institution, documents]) => (
                      <div key={institution} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{institution}</span>
                          </div>
                          <Badge variant="outline">
                            {documents.length} documents
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span>
                              Patents:{" "}
                              {
                                documents.filter((d) => d.type === "patents")
                                  .length
                              }
                            </span>
                            <span>
                              Publications:{" "}
                              {
                                documents.filter(
                                  (d) => d.type === "publications"
                                ).length
                              }
                            </span>
                          </div>
                          {documents.length > 0 && (
                            <div className="mt-2">
                              <span className="font-medium">Top document:</span>
                              <div className="truncate">
                                {documents[0].title}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No institution mapping data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Patent Portfolio Analysis</span>
              </CardTitle>
              <CardDescription>
                Competitive patent portfolios and their strength assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(data.patent_portfolio_analysis).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(data.patent_portfolio_analysis)
                    .slice(0, 6)
                    .map(([assignee, portfolio]) => (
                      <div key={assignee} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{assignee}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={getStrengthColor(portfolio.strength)}
                            >
                              {portfolio.strength} Strength
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Patent Count:</span>
                            <span className="ml-2 font-medium">
                              {portfolio.patent_count}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Avg Similarity:
                            </span>
                            <span className="ml-2 font-medium">
                              {(portfolio.avg_similarity * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {portfolio.top_patents.length > 0 && (
                          <div className="mt-3">
                            <span className="text-sm font-medium text-gray-700">
                              Top Patents:
                            </span>
                            <ul className="mt-1 space-y-1 text-sm text-gray-600">
                              {portfolio.top_patents
                                .slice(0, 2)
                                .map((patent, idx) => (
                                  <li key={idx} className="truncate">
                                    • {patent.title} (
                                    {(patent.similarity_score * 100).toFixed(1)}
                                    %)
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No patent portfolio data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaborations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="h-5 w-5" />
                <span>Collaboration Networks</span>
              </CardTitle>
              <CardDescription>
                Inter-organizational collaboration patterns and partnership
                opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.collaboration_networks.length > 0 ? (
                <div className="space-y-4">
                  {data.collaboration_networks.map((collab, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Network className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">
                            {collab.organizations.join(" ↔ ")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={getStrengthColor(collab.strength)}
                          >
                            {collab.strength}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <span className="font-medium">
                          Collaboration Count:
                        </span>
                        <span className="ml-2">
                          {collab.collaboration_count} joint projects
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Network className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No collaboration network data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompetitiveIntelligence;
