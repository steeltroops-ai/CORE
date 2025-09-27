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
  Download,
  Share2,
  ExternalLink,
  Search,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  GitBranch,
  Layers,
  MapPin,
  TrendingDown,
  Award,
  Link,
  Upload,
} from "lucide-react";
import SimilaritySearchCard from "./SimilaritySearchCard";

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
  showTechnicalDetails?: boolean;
  onExport?: (format: string, data: any) => void;
  onShare?: (url: string) => void;
}

interface NetworkNode {
  id: string;
  name: string;
  type: 'inventor' | 'institution' | 'patent';
  size: number;
  color: string;
  patents?: number;
  collaborations?: number;
}

interface NetworkLink {
  source: string;
  target: string;
  strength: number;
  type: 'collaboration' | 'citation' | 'assignment';
}

interface FilterState {
  strengthLevel: string;
  organizationType: string;
  collaborationThreshold: number;
  patentCountRange: [number, number];
}

interface ViewState {
  expandedItems: Set<string>;
  sortBy: 'strength' | 'patents' | 'collaborations' | 'similarity';
  sortOrder: 'asc' | 'desc';
  showFilters: boolean;
  selectedNetwork: 'inventors' | 'institutions' | 'collaborations' | null;
}

const CompetitiveIntelligence: React.FC<CompetitiveIntelligenceProps> = ({
  analysisId,
  className = "",
  showTechnicalDetails = false,
  onExport,
  onShare,
}) => {
  const [data, setData] = useState<CompetitiveIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive state
  const [filters, setFilters] = useState<FilterState>({
    strengthLevel: 'all',
    organizationType: 'all',
    collaborationThreshold: 0,
    patentCountRange: [0, 1000],
  });
  
  const [viewState, setViewState] = useState<ViewState>({
    expandedItems: new Set(),
    sortBy: 'strength',
    sortOrder: 'desc',
    showFilters: false,
    selectedNetwork: null,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const [networkLinks, setNetworkLinks] = useState<NetworkLink[]>([]);

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

  const handleSort = (sortBy: 'strength' | 'patents' | 'collaborations' | 'similarity') => {
    const newOrder = viewState.sortBy === sortBy && viewState.sortOrder === 'desc' ? 'asc' : 'desc';
    setViewState({ ...viewState, sortBy, sortOrder: newOrder });
  };

  const handleExport = (format: 'pdf' | 'excel' | 'json') => {
    if (onExport && data) {
      const exportData = {
        market_position: data.market_position,
        inventor_network: data.inventor_network,
        institution_mapping: data.institution_mapping,
        patent_portfolio_analysis: data.patent_portfolio_analysis,
        collaboration_networks: data.collaboration_networks,
        generated_at: new Date().toISOString(),
      };
      onExport(format, exportData);
    }
  };

  const handleShare = () => {
    if (onShare) {
      const shareUrl = `${window.location.origin}/insights?analysisId=${analysisId}&tab=competitive`;
      onShare(shareUrl);
    }
  };

  // Generate network visualization data
  const generateNetworkData = useCallback(() => {
    if (!data) return;

    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];

    // Add inventor nodes
    data.inventor_network.top_inventors.forEach((inventor, index) => {
      nodes.push({
        id: `inventor-${inventor.name}`,
        name: inventor.name,
        type: 'inventor',
        size: Math.min(inventor.patent_count * 2 + 10, 50),
        color: '#3b82f6',
        patents: inventor.patent_count,
        collaborations: data.inventor_network.key_collaborations.filter(c => 
          c.inventors.includes(inventor.name)
        ).length,
      });
    });

    // Add collaboration links
    data.inventor_network.key_collaborations.forEach((collab, index) => {
      if (collab.inventors.length >= 2) {
        for (let i = 0; i < collab.inventors.length - 1; i++) {
          for (let j = i + 1; j < collab.inventors.length; j++) {
            links.push({
              source: `inventor-${collab.inventors[i]}`,
              target: `inventor-${collab.inventors[j]}`,
              strength: collab.collaboration_count,
              type: 'collaboration',
            });
          }
        }
      }
    });

    // Add institution nodes
    Object.entries(data.institution_mapping).forEach(([institution, documents]) => {
      nodes.push({
        id: `institution-${institution}`,
        name: institution,
        type: 'institution',
        size: Math.min(documents.length * 3 + 15, 60),
        color: '#10b981',
        patents: documents.filter(d => d.type === 'patents').length,
        collaborations: 0,
      });
    });

    setNetworkNodes(nodes);
    setNetworkLinks(links);
  }, [data]);

  // Filter and sort data
  const getFilteredAndSortedData = (items: any[], type: string) => {
    let filtered = items.filter(item => {
      const matchesSearch = searchTerm === '' || 
        (typeof item === 'object' && JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStrength = filters.strengthLevel === 'all' || 
        (item.strength && item.strength.toLowerCase() === filters.strengthLevel.toLowerCase());
      
      return matchesSearch && matchesStrength;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (viewState.sortBy) {
        case 'strength':
          const strengthOrder = { 'HIGH': 3, 'STRONG': 3, 'MEDIUM': 2, 'MODERATE': 2, 'LOW': 1, 'WEAK': 1 };
          aValue = strengthOrder[a.strength?.toUpperCase() as keyof typeof strengthOrder] || 0;
          bValue = strengthOrder[b.strength?.toUpperCase() as keyof typeof strengthOrder] || 0;
          break;
        case 'patents':
          aValue = a.patent_count || a.patents?.length || 0;
          bValue = b.patent_count || b.patents?.length || 0;
          break;
        case 'collaborations':
          aValue = a.collaboration_count || 0;
          bValue = b.collaboration_count || 0;
          break;
        case 'similarity':
          aValue = a.avg_similarity || a.score || 0;
          bValue = b.avg_similarity || b.score || 0;
          break;
        default:
          return 0;
      }
      
      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return viewState.sortOrder === 'asc' ? result : -result;
    });

    return filtered;
  };

  // Generate network data when data changes
  useEffect(() => {
    if (data) {
      generateNetworkData();
    }
  }, [data, generateNetworkData]);

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
      {/* Document Upload and Similarity Search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimilaritySearchCard
          title="Upload PDF Document"
          description="Upload PDF files for competitive intelligence analysis"
          icon={Upload as React.ComponentType<{ className?: string; size?: number }>}
          uploadType="pdf"
        />
        <SimilaritySearchCard
          title="Add Document URL"
          description="Add documents via URL for market analysis"
          icon={FileText as React.ComponentType<{ className?: string; size?: number }>}
          uploadType="url"
        />
      </div>

      {/* Enhanced Market Position Overview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Globe className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-slate-200">Market Position Analysis</CardTitle>
                <CardDescription className="text-slate-400">
                  Competitive landscape analysis and market maturity assessment
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getIntensityIcon(data.market_position.competitive_intensity)}
                <span className="text-sm font-medium text-slate-300">
                  {data.market_position.competitive_intensity} Competition
                </span>
              </div>
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
          {/* Interactive Market Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-700/30 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors">
              <div className="p-2 bg-blue-500/10 rounded-lg w-fit mx-auto mb-3">
                <PieChart className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {(data.market_position.patent_density * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400 mb-2">Patent Density</div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${data.market_position.patent_density * 100}%` }}
                />
              </div>
              {showTechnicalDetails && (
                <div className="text-xs text-slate-500 mt-2">
                  Market saturation indicator
                </div>
              )}
            </div>
            
            <div className="text-center p-4 bg-slate-700/30 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors">
              <div className="p-2 bg-purple-500/10 rounded-lg w-fit mx-auto mb-3">
                <Target className="h-8 w-8 text-purple-400" />
              </div>
              <div className="text-lg font-bold text-purple-400 mb-1">
                {data.market_position.market_maturity}
              </div>
              <div className="text-sm text-slate-400 mb-2">Market Maturity</div>
              <Badge 
                variant="outline" 
                className={`border-purple-500/50 text-purple-300 bg-purple-500/10`}
              >
                {data.market_position.market_maturity === 'HIGH' ? 'Mature Market' :
                 data.market_position.market_maturity === 'MEDIUM' ? 'Growing Market' : 'Emerging Market'}
              </Badge>
              {showTechnicalDetails && (
                <div className="text-xs text-slate-500 mt-2">
                  Technology lifecycle stage
                </div>
              )}
            </div>
            
            <div className="text-center p-4 bg-slate-700/30 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors">
              <div className="p-2 bg-green-500/10 rounded-lg w-fit mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-lg font-bold text-green-400 mb-1">
                {data.market_position.innovation_opportunity}
              </div>
              <div className="text-sm text-slate-400 mb-2">Innovation Opportunity</div>
              <Badge 
                variant="outline" 
                className={`border-green-500/50 text-green-300 bg-green-500/10`}
              >
                {data.market_position.innovation_opportunity === 'HIGH' ? 'High Potential' :
                 data.market_position.innovation_opportunity === 'MEDIUM' ? 'Moderate Potential' : 'Limited Potential'}
              </Badge>
              {showTechnicalDetails && (
                <div className="text-xs text-slate-500 mt-2">
                  White space analysis
                </div>
              )}
            </div>
          </div>

          {/* Key Market Players */}
          {data.market_position.key_players.length > 0 && (
            <div className="p-4 bg-slate-700/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <h4 className="text-sm font-medium text-slate-300">
                    Key Market Players ({data.market_position.key_players.length})
                  </h4>
                </div>
                {showTechnicalDetails && (
                  <Badge variant="outline" className="border-slate-600 text-slate-400">
                    Competitive Analysis
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {data.market_position.key_players.map((player, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 cursor-pointer transition-colors"
                    onClick={() => {
                      // Could trigger detailed analysis of this player
                    }}
                  >
                    <Building className="h-3 w-3 mr-1" />
                    {player}
                  </Badge>
                ))}
              </div>
              {showTechnicalDetails && (
                <div className="mt-3 text-xs text-slate-500">
                  Click on a player to view detailed competitive analysis
                </div>
              )}
            </div>
          )}

          {/* Network Visualization Preview */}
          {networkNodes.length > 0 && (
            <div className="p-4 bg-slate-700/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Network className="h-5 w-5 text-emerald-400" />
                  <h4 className="text-sm font-medium text-slate-300">
                    Network Overview
                  </h4>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => setViewState({...viewState, selectedNetwork: 'inventors'})}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Network
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-400">
                    {networkNodes.filter(n => n.type === 'inventor').length}
                  </div>
                  <div className="text-xs text-slate-400">Inventors</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-400">
                    {networkNodes.filter(n => n.type === 'institution').length}
                  </div>
                  <div className="text-xs text-slate-400">Institutions</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-400">
                    {networkLinks.length}
                  </div>
                  <div className="text-xs text-slate-400">Connections</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Analysis Tabs */}
      <Tabs defaultValue="inventors" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="inventors" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Users className="h-4 w-4 mr-1" />
              Inventors
            </TabsTrigger>
            <TabsTrigger value="institutions" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Building className="h-4 w-4 mr-1" />
              Institutions
            </TabsTrigger>
            <TabsTrigger value="portfolios" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Briefcase className="h-4 w-4 mr-1" />
              Portfolios
            </TabsTrigger>
            <TabsTrigger value="collaborations" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Network className="h-4 w-4 mr-1" />
              Networks
            </TabsTrigger>
          </TabsList>
          
          {/* Search and Filter Controls */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search competitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm w-64"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewState({...viewState, showFilters: !viewState.showFilters})}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {viewState.showFilters && (
          <Card className="bg-slate-800/50 border-slate-700 mb-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-2 block">Strength Level</label>
                  <select
                    value={filters.strengthLevel}
                    onChange={(e) => setFilters({...filters, strengthLevel: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm p-2"
                  >
                    <option value="all">All Levels</option>
                    <option value="high">High Strength</option>
                    <option value="medium">Medium Strength</option>
                    <option value="low">Low Strength</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-2 block">Organization Type</label>
                  <select
                    value={filters.organizationType}
                    onChange={(e) => setFilters({...filters, organizationType: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm p-2"
                  >
                    <option value="all">All Types</option>
                    <option value="university">Universities</option>
                    <option value="corporation">Corporations</option>
                    <option value="government">Government</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-2 block">Min Collaborations</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={filters.collaborationThreshold}
                    onChange={(e) => setFilters({...filters, collaborationThreshold: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-xs text-slate-400 mt-1">{filters.collaborationThreshold}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-2 block">Sort By</label>
                  <div className="flex space-x-1">
                    <Button
                      variant={viewState.sortBy === 'strength' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSort('strength')}
                      className="text-xs"
                    >
                      Strength
                      {viewState.sortBy === 'strength' && (
                        viewState.sortOrder === 'desc' ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronUp className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                    <Button
                      variant={viewState.sortBy === 'patents' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSort('patents')}
                      className="text-xs"
                    >
                      Patents
                      {viewState.sortBy === 'patents' && (
                        viewState.sortOrder === 'desc' ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronUp className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
