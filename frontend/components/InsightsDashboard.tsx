"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Network,
  Briefcase,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Award,
  Shield,
  DollarSign,
  Users,
  Building,
  Globe,
  Lightbulb,
  Download,
  Share2,
  ExternalLink,
  ArrowRight,
  Info,
  Eye,
  Maximize2,
} from "lucide-react";

interface InsightsSummary {
  novelty_score: number;
  competitive_intensity: string;
  market_readiness: number;
  overall_risk: string;
  key_recommendations: number;
  licensing_opportunities: number;
}

interface InsightsDashboardProps {
  summary: InsightsSummary;
  analysisId: string;
  onTabChange: (tab: string) => void;
  onExport: (format: 'pdf' | 'excel' | 'json') => void;
  onShare: () => void;
  showTechnicalDetails?: boolean;
  className?: string;
}

const InsightsDashboard: React.FC<InsightsDashboardProps> = ({
  summary,
  analysisId,
  onTabChange,
  onExport,
  onShare,
  showTechnicalDetails = false,
  className = "",
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-emerald-400";
    if (score >= 0.6) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="h-5 w-5 text-emerald-400" />;
    if (score >= 0.6) return <Clock className="h-5 w-5 text-yellow-400" />;
    return <AlertTriangle className="h-5 w-5 text-red-400" />;
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity.toUpperCase()) {
      case "HIGH":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "MEDIUM":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "LOW":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toUpperCase()) {
      case "HIGH":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "MEDIUM":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "LOW":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };

  const getRecommendationLevel = (count: number) => {
    if (count >= 5) return { level: "High", color: "text-emerald-400", icon: <TrendingUp size={16} /> };
    if (count >= 3) return { level: "Medium", color: "text-yellow-400", icon: <Target size={16} /> };
    if (count >= 1) return { level: "Low", color: "text-blue-400", icon: <Lightbulb size={16} /> };
    return { level: "None", color: "text-slate-400", icon: <Clock size={16} /> };
  };

  const getLicensingLevel = (count: number) => {
    if (count >= 10) return { level: "Excellent", color: "text-emerald-400", icon: <Award size={16} /> };
    if (count >= 5) return { level: "Good", color: "text-yellow-400", icon: <TrendingUp size={16} /> };
    if (count >= 1) return { level: "Limited", color: "text-blue-400", icon: <Building size={16} /> };
    return { level: "None", color: "text-slate-400", icon: <Clock size={16} /> };
  };

  const recommendationLevel = getRecommendationLevel(summary.key_recommendations);
  const licensingLevel = getLicensingLevel(summary.licensing_opportunities);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">
            Track 1: Tech Transfer Insights
          </h2>
          <p className="text-slate-400">
            Comprehensive analysis for technology commercialization
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 px-3 py-1">
            ID: {analysisId.slice(0, 8)}...
          </Badge>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Share2 size={14} className="mr-1" />
              Share
            </Button>
            
            <div className="relative group">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Download size={14} className="mr-1" />
                Export
              </Button>
              
              <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="p-1">
                  <button
                    onClick={() => onExport('pdf')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded"
                  >
                    PDF Report
                  </button>
                  <button
                    onClick={() => onExport('excel')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded"
                  >
                    Excel Data
                  </button>
                  <button
                    onClick={() => onExport('json')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded"
                  >
                    JSON Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Novelty Score Card */}
        <Card 
          className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group"
          onClick={() => onTabChange('novelty')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Novelty Score</span>
              </div>
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getScoreIcon(summary.novelty_score)}
                <span className={`text-2xl font-bold ${getScoreColor(summary.novelty_score)}`}>
                  {(summary.novelty_score * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Prior Art</div>
                <div className="text-xs text-slate-300">
                  {summary.novelty_score >= 0.8 ? 'Limited' : 
                   summary.novelty_score >= 0.6 ? 'Moderate' : 'Extensive'}
                </div>
              </div>
            </div>
            <Progress 
              value={summary.novelty_score * 100} 
              className="mt-3 h-1.5"
            />
          </CardContent>
        </Card>

        {/* Market Competition Card */}
        <Card 
          className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group"
          onClick={() => onTabChange('competitive')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                <span>Market Competition</span>
              </div>
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge className={`${getIntensityColor(summary.competitive_intensity)} border text-sm font-medium px-3 py-1`}>
                {summary.competitive_intensity}
              </Badge>
              <div className="text-right">
                <div className="text-xs text-slate-400">Market Entry</div>
                <div className="text-xs text-slate-300">
                  {summary.competitive_intensity === 'HIGH' ? 'Challenging' :
                   summary.competitive_intensity === 'MEDIUM' ? 'Moderate' : 'Favorable'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Readiness Card */}
        <Card 
          className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group"
          onClick={() => onTabChange('commercialization')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Market Readiness</span>
              </div>
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getScoreIcon(summary.market_readiness)}
                <span className={`text-2xl font-bold ${getScoreColor(summary.market_readiness)}`}>
                  {(summary.market_readiness * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Time to Market</div>
                <div className="text-xs text-slate-300">
                  {summary.market_readiness >= 0.8 ? '6-12 months' :
                   summary.market_readiness >= 0.6 ? '1-2 years' : '2+ years'}
                </div>
              </div>
            </div>
            <Progress 
              value={summary.market_readiness * 100} 
              className="mt-3 h-1.5"
            />
          </CardContent>
        </Card>

        {/* Overall Risk Card */}
        <Card 
          className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group"
          onClick={() => onTabChange('strategic')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Overall Risk</span>
              </div>
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge className={`${getRiskColor(summary.overall_risk)} border text-sm font-medium px-3 py-1`}>
                {summary.overall_risk}
              </Badge>
              <div className="text-right">
                <div className="text-xs text-slate-400">Risk Level</div>
                <div className="text-xs text-slate-300">
                  {summary.overall_risk === 'HIGH' ? 'Caution' :
                   summary.overall_risk === 'MEDIUM' ? 'Manageable' : 'Favorable'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recommendations Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <Brain className="h-4 w-4" />
              <span>AI Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-700/50 ${recommendationLevel.color}`}>
                  {recommendationLevel.icon}
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-200">
                    {summary.key_recommendations}
                  </div>
                  <div className="text-xs text-slate-400">
                    Strategic Actions
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${recommendationLevel.color} bg-opacity-10 border-opacity-30`}>
                  {recommendationLevel.level}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Licensing Opportunities Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <Briefcase className="h-4 w-4" />
              <span>Licensing Opportunities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-700/50 ${licensingLevel.color}`}>
                  {licensingLevel.icon}
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-200">
                    {summary.licensing_opportunities}
                  </div>
                  <div className="text-xs text-slate-400">
                    Potential Partners
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${licensingLevel.color} bg-opacity-10 border-opacity-30`}>
                  {licensingLevel.level}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <Eye className="h-4 w-4" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTabChange('novelty')}
              className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <BarChart3 size={14} />
              View Novelty
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTabChange('competitive')}
              className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Network size={14} />
              Competitors
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTabChange('commercialization')}
              className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <DollarSign size={14} />
              Revenue Model
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTabChange('strategic')}
              className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Lightbulb size={14} />
              Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsDashboard;