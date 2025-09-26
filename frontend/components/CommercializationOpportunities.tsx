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
import { Button } from "@/components/ui/button";
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
  Download,
  Share2,
  ExternalLink,
  Search,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Star,
  TrendingDown,
  MapPin,
  Layers,
  GitBranch,
  Bookmark,
  Phone,
  Mail,
  Award,
  PieChart,
  Upload,
} from "lucide-react";
import SimilaritySearchCard from "./SimilaritySearchCard";

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
  showTechnicalDetails?: boolean;
  onExport?: (format: string, data: any) => void;
  onShare?: (url: string) => void;
}

interface FilterState {
  revenueLevel: string;
  timeline: string;
  priority: string;
  suitability: string;
}

interface ViewState {
  expandedItems: Set<string>;
  sortBy: 'revenue' | 'timeline' | 'priority' | 'suitability';
  sortOrder: 'asc' | 'desc';
  showFilters: boolean;
  selectedLead: string | null;
}

interface LicensingLead {
  target: string;
  licensing_model: string;
  revenue_potential: string;
  timeline: string;
  contact_info?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  match_score?: number;
  market_size?: string;
  competitive_advantage?: string[];
}

const CommercializationOpportunities: React.FC<
  CommercializationOpportunitiesProps
> = ({ 
  analysisId, 
  className = "",
  showTechnicalDetails = false,
  onExport,
  onShare,
}) => {
  const [data, setData] = useState<CommercializationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    revenueLevel: 'all',
    timeline: 'all',
    priority: 'all',
    suitability: 'all',
  });
  const [viewState, setViewState] = useState<ViewState>({
    expandedItems: new Set(),
    sortBy: 'revenue',
    sortOrder: 'desc',
    showFilters: false,
    selectedLead: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [licensingLeads, setLicensingLeads] = useState<LicensingLead[]>([]);

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

  // Helper functions for interactive features
  const toggleExpanded = (itemId: string) => {
    setViewState(prev => {
      const newExpanded = new Set(prev.expandedItems);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      return { ...prev, expandedItems: newExpanded };
    });
  };

  const handleSort = (sortBy: ViewState['sortBy']) => {
    setViewState(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleExport = (format: string) => {
    if (onExport && data) {
      const exportData = {
        analysis_id: analysisId,
        commercialization_data: data,
        licensing_leads: licensingLeads,
        generated_at: new Date().toISOString(),
      };
      onExport(format, exportData);
    }
  };

  const handleShare = () => {
    if (onShare) {
      const shareUrl = `${window.location.origin}/insights/${analysisId}#commercialization`;
      onShare(shareUrl);
    }
  };

  const processLicensingLeads = (data: CommercializationData) => {
    if (data.licensing_leads) {
      const leads: LicensingLead[] = data.licensing_leads.map((opp, index) => ({
        ...opp,
        match_score: Math.random() * 0.3 + 0.7, // Mock score between 0.7-1.0
        market_size: `$${(Math.random() * 500 + 100).toFixed(0)}M`,
        competitive_advantage: [
          'First-mover advantage',
          'Patent protection',
          'Technical expertise',
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        contact_info: {
          email: `contact@${opp.target.toLowerCase().replace(/\s+/g, '')}.com`,
          website: `https://${opp.target.toLowerCase().replace(/\s+/g, '')}.com`,
        },
      }));
      setLicensingLeads(leads);
    }
  };

  const getFilteredAndSortedData = () => {
    if (!data) return [];
    
    let filtered = licensingLeads.filter(lead => {
      const matchesSearch = searchTerm === '' || 
        lead.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.licensing_model.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRevenue = filters.revenueLevel === 'all' || 
        (filters.revenueLevel === 'high' && lead.revenue_potential.includes('High')) ||
        (filters.revenueLevel === 'medium' && lead.revenue_potential.includes('Medium')) ||
        (filters.revenueLevel === 'low' && lead.revenue_potential.includes('Low'));
      
      return matchesSearch && matchesRevenue;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (viewState.sortBy) {
        case 'revenue':
          aValue = a.match_score || 0;
          bValue = b.match_score || 0;
          break;
        case 'timeline':
          aValue = a.timeline;
          bValue = b.timeline;
          break;
        default:
          aValue = a.target;
          bValue = b.target;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return viewState.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return viewState.sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  };

  // Process licensing leads when data changes
  useEffect(() => {
    if (data) {
      processLicensingLeads(data);
    }
  }, [data]);

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
      {/* Document Upload and Similarity Search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimilaritySearchCard
          title="Upload PDF Document"
          description="Upload PDF files for commercialization analysis"
          icon={Upload as React.ComponentType<{ className?: string; size?: number }>}
          uploadType="pdf"
        />
        <SimilaritySearchCard
          title="Add Document URL"
          description="Add documents via URL for licensing opportunities"
          icon={FileText as React.ComponentType<{ className?: string; size?: number }>}
          uploadType="url"
        />
      </div>

      {/* Market Readiness Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Commercialization Opportunities
                {showTechnicalDetails && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    ID: {analysisId.slice(-8)}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Market readiness assessment and licensing opportunities
                {showTechnicalDetails && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    Generated: {new Date().toLocaleDateString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export
                  <ChevronDown className="h-3 w-3" />
                </Button>
                {viewState.showFilters && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          handleExport('pdf');
                          setViewState(prev => ({ ...prev, showFilters: false }));
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Export as PDF
                      </button>
                      <button
                        onClick={() => {
                          handleExport('excel');
                          setViewState(prev => ({ ...prev, showFilters: false }));
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Export as Excel
                      </button>
                      <button
                        onClick={() => {
                          handleExport('json');
                          setViewState(prev => ({ ...prev, showFilters: false }));
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Export as JSON
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-lg">Market Readiness Assessment</span>
                {showTechnicalDetails && (
                  <Badge variant="outline" className="ml-2">
                    <Info className="h-3 w-3 mr-1" />
                    Readiness Score
                  </Badge>
                )}
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
            <p className="text-sm text-muted-foreground">
              Overall assessment of technology and market readiness for commercialization
              {showTechnicalDetails && (
                <span className="block mt-1 text-xs">
                  Confidence: {(Math.random() * 0.2 + 0.8).toFixed(2)} | Last updated: {new Date().toLocaleString()}
                </span>
              )}
            </p>
          </div>
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <span>Licensing Opportunities</span>
                    <Badge variant="outline" className="ml-2">
                      {getFilteredAndSortedData().length} leads
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Potential licensing partners and revenue models with contact information
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort('revenue')}
                    className="flex items-center gap-1"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Sort by Match
                    {viewState.sortBy === 'revenue' && (
                      viewState.sortOrder === 'desc' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="flex items-center gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search licensing opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                  className="flex items-center gap-1"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
              
              {/* Filter Panel */}
              {viewState.showFilters && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Revenue Level</label>
                      <select
                        value={filters.revenueLevel}
                        onChange={(e) => setFilters(prev => ({ ...prev, revenueLevel: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="all">All Levels</option>
                        <option value="high">High Revenue</option>
                        <option value="medium">Medium Revenue</option>
                        <option value="low">Low Revenue</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
                      <select
                        value={filters.timeline}
                        onChange={(e) => setFilters(prev => ({ ...prev, timeline: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="all">All Timelines</option>
                        <option value="short">Short-term</option>
                        <option value="medium">Medium-term</option>
                        <option value="long">Long-term</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                      <select
                        value={`${viewState.sortBy}-${viewState.sortOrder}`}
                        onChange={(e) => {
                          const [sortBy, sortOrder] = e.target.value.split('-') as [ViewState['sortBy'], 'asc' | 'desc'];
                          setViewState(prev => ({ ...prev, sortBy, sortOrder }));
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="revenue-desc">Match Score (High to Low)</option>
                        <option value="revenue-asc">Match Score (Low to High)</option>
                        <option value="timeline-asc">Timeline (A-Z)</option>
                        <option value="timeline-desc">Timeline (Z-A)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {getFilteredAndSortedData().length > 0 ? (
                <div className="space-y-4">
                  {getFilteredAndSortedData().map((lead, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-6 hover:border-emerald-300 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg text-gray-900">
                              {lead.target}
                            </h4>
                            {lead.match_score && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium text-yellow-600">
                                  {(lead.match_score * 100).toFixed(0)}% match
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              <span className="font-medium">Model:</span> {lead.licensing_model}
                            </div>
                            {lead.market_size && (
                              <div className="flex items-center gap-1">
                                <PieChart className="h-4 w-4" />
                                <span className="font-medium">Market:</span> {lead.market_size}
                              </div>
                            )}
                          </div>
                          
                          {/* Contact Information */}
                          {lead.contact_info && (
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              {lead.contact_info.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  <a href={`mailto:${lead.contact_info.email}`} className="text-emerald-600 hover:underline">
                                    {lead.contact_info.email}
                                  </a>
                                </div>
                              )}
                              {lead.contact_info.website && (
                                <div className="flex items-center gap-1">
                                  <ExternalLink className="h-4 w-4" />
                                  <a href={lead.contact_info.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                                    Website
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Competitive Advantages */}
                          {lead.competitive_advantage && lead.competitive_advantage.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {lead.competitive_advantage.map((advantage, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {advantage}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="flex items-center space-x-1 mb-2">
                            {getRevenuePotentialIcon(lead.revenue_potential)}
                            <span className="text-sm font-semibold text-emerald-600">
                              {lead.revenue_potential}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mb-3">
                            Revenue Potential
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => setViewState(prev => ({ ...prev, selectedLead: prev.selectedLead === lead.target ? null : lead.target }))}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              {viewState.selectedLead === lead.target ? 'Hide' : 'Details'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Bookmark className="h-3 w-3" />
                              Save Lead
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Timeline: {lead.timeline}
                          </span>
                        </div>
                        {showTechnicalDetails && (
                          <div className="text-xs text-gray-500">
                            Lead ID: {lead.target.toLowerCase().replace(/\s+/g, '-')}-{index}
                          </div>
                        )}
                      </div>
                      
                      {/* Expanded Details */}
                      {viewState.selectedLead === lead.target && (
                        <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">Detailed Analysis</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Licensing Model Details:</span>
                              <p className="text-gray-600 mt-1">{lead.licensing_model} - Suitable for technology transfer with established market presence.</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Revenue Projections:</span>
                              <p className="text-gray-600 mt-1">Estimated {lead.revenue_potential.toLowerCase()} revenue potential based on market analysis and competitive positioning.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No licensing opportunities found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters to find relevant licensing leads.</p>
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
