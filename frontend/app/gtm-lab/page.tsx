"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ViewContainer } from "@/components/ViewContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  Target, 
  TrendingUp, 
  Users, 
  BarChart3,
  PieChart,
  Download,
  MessageSquare,
  Zap,
  DollarSign,
  Building,
  Award,
  Eye,
  Star,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Map,
  Calendar,
  Shield,
  Rocket,
  Settings,
  BookOpen,
  Briefcase
} from "lucide-react";
import { LuTarget } from "react-icons/lu";
import { gtmAnalysisService, GTMAnalysisInput, GTMAnalysisResult } from "@/lib/gtmAnalysisService";
import { exportUtils } from "@/lib/exportUtils";

const GTMLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inputs');
  const [analysisData, setAnalysisData] = useState<GTMAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [formData, setFormData] = useState<GTMAnalysisInput>({
    businessIdea: { writtenIdea: '', description: '' },
    productInfo: { features: [], targetMarket: '', valueProposition: '', competitiveAdvantage: '' },
    marketContext: { industry: '', geography: '', customerSegments: '', marketSize: '' }
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await gtmAnalysisService.analyzeBusinessIdea(formData);
      setAnalysisData(result);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('GTM Analysis failed:', error);
      // Show dashboard with default data on error
      setActiveTab('dashboard');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = (section: keyof GTMAnalysisInput, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <AppLayout>
      <div className="px-6 py-4">
        <ViewContainer
          icon={LuTarget}
          title="GTM Lab - Go-to-Market Strategy"
          subtitle="Comprehensive market strategy development and analysis platform"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800">
              <TabsTrigger value="inputs" className="data-[state=active]:bg-slate-600">
                <Upload className="h-4 w-4 mr-2" />
                Input Analysis
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Strategy Dashboard
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-slate-600">
                <FileText className="h-4 w-4 mr-2" />
                GTM Documents
              </TabsTrigger>
              <TabsTrigger value="interactive" className="data-[state=active]:bg-slate-600">
                <MessageSquare className="h-4 w-4 mr-2" />
                Interactive Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inputs" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Business Idea Input */}
                <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-400" />
                      Business Idea Input
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Upload a PDF document or describe your business idea in detail
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
                          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-300 mb-2">Drop business plan or idea document here</p>
                          <p className="text-xs text-slate-500">PDF, DOC, or other document formats</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Written Business Idea</Label>
                          <Textarea 
                            placeholder="Describe your business idea, product concept, or service offering in detail..."
                            className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                            value={formData.businessIdea?.writtenIdea || ''}
                            onChange={(e) => handleInputChange('businessIdea', 'writtenIdea', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Additional Context</Label>
                          <Textarea 
                            placeholder="Any additional context, market insights, or specific requirements..."
                            className="bg-slate-700 border-slate-600 text-white"
                            rows={3}
                            value={formData.businessIdea?.description || ''}
                            onChange={(e) => handleInputChange('businessIdea', 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Information */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-400" />
                      Product Information
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Define your product features and value proposition
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Key Features</Label>
                      <Textarea 
                        placeholder="List key product features (one per line)\ne.g., Real-time analytics\nUser-friendly interface\nAPI integration"
                        className="bg-slate-700 border-slate-600 text-white"
                        rows={4}
                        value={formData.productInfo?.features?.join('\n') || ''}
                        onChange={(e) => handleInputChange('productInfo', 'features', e.target.value.split('\n').filter(f => f.trim()))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Target Market</Label>
                      <Input 
                        placeholder="e.g., Small to medium businesses, Enterprise customers"
                        className="bg-slate-700 border-slate-600 text-white"
                        value={formData.productInfo?.targetMarket || ''}
                        onChange={(e) => handleInputChange('productInfo', 'targetMarket', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Value Proposition</Label>
                      <Textarea 
                        placeholder="What unique value does your product provide to customers?"
                        className="bg-slate-700 border-slate-600 text-white"
                        rows={3}
                        value={formData.productInfo?.valueProposition || ''}
                        onChange={(e) => handleInputChange('productInfo', 'valueProposition', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Competitive Advantage</Label>
                      <Textarea 
                        placeholder="What makes your product different from competitors?"
                        className="bg-slate-700 border-slate-600 text-white"
                        rows={3}
                        value={formData.productInfo?.competitiveAdvantage || ''}
                        onChange={(e) => handleInputChange('productInfo', 'competitiveAdvantage', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Market Context */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-400" />
                      Market Context
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Define your market environment and assumptions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Industry</Label>
                      <Input 
                        placeholder="e.g., SaaS, E-commerce, Healthcare, Fintech"
                        className="bg-slate-700 border-slate-600 text-white"
                        value={formData.marketContext?.industry || ''}
                        onChange={(e) => handleInputChange('marketContext', 'industry', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Geographic Focus</Label>
                      <Input 
                        placeholder="e.g., North America, Europe, Global"
                        className="bg-slate-700 border-slate-600 text-white"
                        value={formData.marketContext?.geography || ''}
                        onChange={(e) => handleInputChange('marketContext', 'geography', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Customer Segments</Label>
                      <Textarea 
                        placeholder="Describe your target customer segments\ne.g., SMBs with 10-100 employees\nEnterprise companies in manufacturing"
                        className="bg-slate-700 border-slate-600 text-white"
                        rows={3}
                        value={formData.marketContext?.customerSegments || ''}
                        onChange={(e) => handleInputChange('marketContext', 'customerSegments', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Market Size (if known)</Label>
                      <Input 
                        placeholder="e.g., $5B TAM, Growing at 15% annually"
                        className="bg-slate-700 border-slate-600 text-white"
                        value={formData.marketContext?.marketSize || ''}
                        onChange={(e) => handleInputChange('marketContext', 'marketSize', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center pt-6">
                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !formData.businessIdea?.writtenIdea}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg font-medium min-w-[280px]"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analyzing GTM Strategy...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Generate GTM Strategy
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Overall GTM Score Card */}
              <Card className="bg-gradient-to-r from-emerald-900/50 to-blue-900/50 border-slate-700">
                <CardHeader className="text-center">
                  <CardTitle className="text-white text-2xl mb-2">GTM Readiness Score</CardTitle>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-6xl font-bold text-emerald-400">{analysisData?.overallScore || 75}</div>
                    <div className="text-slate-300">
                      <div className="text-lg font-medium">/100</div>
                      <Badge className={`${getScoreBg(analysisData?.overallScore || 75)} text-white`}>
                        Market Ready
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-slate-400 mt-2">
                    Success Probability: <span className="text-emerald-400 font-semibold">{analysisData?.successProbability || 72}%</span>
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Performance Metrics */}
                <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      GTM Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Market Opportunity</span>
                          <span className={`font-semibold ${getScoreColor(analysisData?.marketOpportunityScore || 80)}`}>
                            {analysisData?.marketOpportunityScore || 80}%
                          </span>
                        </div>
                        <Progress value={analysisData?.marketOpportunityScore || 80} className="h-2" />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Product-Market Fit</span>
                          <span className={`font-semibold ${getScoreColor(analysisData?.productMarketFitScore || 70)}`}>
                            {analysisData?.productMarketFitScore || 70}%
                          </span>
                        </div>
                        <Progress value={analysisData?.productMarketFitScore || 70} className="h-2" />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Competitive Position</span>
                          <span className={`font-semibold ${getScoreColor(analysisData?.competitivePositionScore || 75)}`}>
                            {analysisData?.competitivePositionScore || 75}%
                          </span>
                        </div>
                        <Progress value={analysisData?.competitivePositionScore || 75} className="h-2" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Execution Readiness</span>
                          <span className={`font-semibold ${getScoreColor(analysisData?.executionReadinessScore || 65)}`}>
                            {analysisData?.executionReadinessScore || 65}%
                          </span>
                        </div>
                        <Progress value={analysisData?.executionReadinessScore || 65} className="h-2" />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Risk Assessment</span>
                          <span className={`font-semibold ${getScoreColor(analysisData?.riskScore || 60)}`}>
                            {analysisData?.riskScore || 60}%
                          </span>
                        </div>
                        <Progress value={analysisData?.riskScore || 60} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Sizing */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-400" />
                      Market Sizing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">TAM</span>
                        <span className="text-white font-semibold">{analysisData?.gtmStrategy?.marketSizing?.tam || '$10B'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">SAM</span>
                        <span className="text-white font-semibold">{analysisData?.gtmStrategy?.marketSizing?.sam || '$1B'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">SOM</span>
                        <span className="text-emerald-400 font-semibold">{analysisData?.gtmStrategy?.marketSizing?.som || '$100M'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Growth Rate</span>
                        <span className="text-emerald-400 font-semibold">{analysisData?.gtmStrategy?.marketSizing?.growthRate || '15%'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Feature Priority Matrix */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-400" />
                    Feature Priority Matrix
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Features prioritized by market need vs development effort
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisData?.featureAnalysis?.coreFeatures?.map((feature, index) => (
                      <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-white font-medium">{feature.name}</div>
                          <Badge className={`${getPriorityColor(feature.priority)} text-white text-xs`}>
                            {feature.priority}
                          </Badge>
                        </div>
                        <div className="text-slate-400 text-sm mb-3">{feature.description}</div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Market Need</span>
                            <span className="text-emerald-400">{feature.marketNeed}/10</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Dev Effort</span>
                            <span className="text-yellow-400">{feature.developmentEffort}/10</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Competitive Edge</span>
                            <span className="text-blue-400">{feature.competitiveAdvantage}/10</span>
                          </div>
                          {feature.mvpIncluded && (
                            <Badge className="bg-emerald-600 text-white text-xs">
                              MVP Feature
                            </Badge>
                          )}
                        </div>
                      </div>
                    )) || (
                      <div className="col-span-3 text-center text-slate-400 py-8">
                        Feature analysis will be shown after generating GTM strategy...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Segments */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-400" />
                      Customer Segments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysisData?.gtmStrategy?.customerSegmentation?.map((segment, index) => {
                      const priorityColors = {
                        primary: 'border-emerald-500 bg-emerald-500/10',
                        secondary: 'border-yellow-500 bg-yellow-500/10',
                        tertiary: 'border-slate-500 bg-slate-500/10'
                      };
                      return (
                        <div key={index} className={`border rounded-lg p-4 ${priorityColors[segment.priority]}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-white font-medium">{segment.segment}</div>
                            <Badge className={`${getPriorityColor(segment.priority)} text-white text-xs`}>
                              {segment.priority}
                            </Badge>
                          </div>
                          <div className="text-slate-400 text-sm mb-2">Market Size: {segment.size}</div>
                          <div className="text-slate-300 text-sm">
                            <div className="mb-1">Characteristics:</div>
                            <ul className="list-disc list-inside text-xs text-slate-400">
                              {segment.characteristics.map((char, i) => (
                                <li key={i}>{char}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    }) || (
                      <div className="text-center text-slate-400 py-4">
                        Customer segments will be identified after analysis...
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Risk Assessment */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-400" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysisData?.riskAssessment?.map((risk, index) => {
                      const impactColors = {
                        high: 'text-red-400',
                        medium: 'text-yellow-400',
                        low: 'text-green-400'
                      };
                      return (
                        <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-white text-sm font-medium">{risk.risk}</div>
                            <Badge className={`${getPriorityColor(risk.impact)} text-white text-xs`}>
                              {risk.impact}
                            </Badge>
                          </div>
                          <div className="text-slate-400 text-xs mb-2">{risk.category} risk</div>
                          <div className="text-slate-300 text-xs">{risk.mitigation}</div>
                        </div>
                      );
                    }) || (
                      <div className="text-center text-slate-400 py-4">
                        Risk assessment will be shown after analysis...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    Strategic Recommendations
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    AI-generated actionable recommendations for GTM success
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisData?.recommendations?.map((rec, index) => (
                      <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-white font-medium">{rec.category}</div>
                          <Badge className={`${getPriorityColor(rec.priority)} text-white text-xs`}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <div className="text-slate-300 text-sm mb-2">{rec.recommendation}</div>
                        <div className="text-slate-400 text-xs">Timeline: {rec.timeline}</div>
                      </div>
                    )) || (
                      <div className="col-span-2 text-center text-slate-400 py-8">
                        Strategic recommendations will be generated after analysis...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              {/* GTM Document Suite */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strategy Document */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-400" />
                      GTM Strategy Document
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Comprehensive go-to-market strategy overview
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-slate-700/50 rounded-lg p-4 text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                      <div className="whitespace-pre-wrap text-sm">
                        {analysisData?.gtmDocuments?.strategyDocument || 'GTM strategy document will be generated after analysis...'}
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => exportUtils.exportMemo(analysisData, 'GTM Strategy')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Strategy Document
                    </Button>
                  </CardContent>
                </Card>

                {/* Launch Plan */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-blue-400" />
                      Launch Plan
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Detailed timeline and milestones for market entry
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {analysisData?.gtmDocuments?.launchPlan?.timeline?.map((phase, index) => (
                        <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-white font-medium">{phase.phase}</div>
                            <Badge className="bg-blue-600 text-white text-xs">{phase.duration}</Badge>
                          </div>
                          <div className="text-slate-400 text-sm mb-2">
                            Milestones: {phase.milestones.join(', ')}
                          </div>
                          <div className="text-slate-400 text-xs">
                            Success Metrics: {phase.successMetrics.join(', ')}
                          </div>
                        </div>
                      )) || (
                        <div className="text-center text-slate-400 py-4">
                          Launch plan will be generated after analysis...
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => exportUtils.exportPitch(analysisData, 'Launch Plan')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Export Launch Plan
                    </Button>
                  </CardContent>
                </Card>

                {/* Sales Playbook */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-purple-400" />
                      Sales Playbook
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Customer profiles and sales process guidance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {analysisData?.gtmDocuments?.salesPlaybook?.customerProfiles?.map((profile, index) => (
                        <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                          <div className="text-white font-medium mb-2">{profile.persona}</div>
                          <div className="text-slate-400 text-sm mb-1">
                            Characteristics: {profile.characteristics.join(', ')}
                          </div>
                          <div className="text-slate-400 text-sm mb-1">
                            Pain Points: {profile.painPoints.join(', ')}
                          </div>
                          <div className="text-slate-300 text-xs">
                            Buying Process: {profile.buyingProcess}
                          </div>
                        </div>
                      )) || (
                        <div className="text-center text-slate-400 py-4">
                          Sales playbook will be generated after analysis...
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => exportUtils.exportSummary(analysisData, 'Sales Playbook')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Export Sales Playbook
                    </Button>
                  </CardContent>
                </Card>

                {/* Financial Projections */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      Financial Projections
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Revenue forecasts and unit economics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <div className="text-white font-medium mb-2">Unit Economics</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">CAC</span>
                            <span className="text-white">{analysisData?.gtmDocuments?.financialProjections?.unitEconomics?.cac || '$500'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">LTV</span>
                            <span className="text-white">{analysisData?.gtmDocuments?.financialProjections?.unitEconomics?.ltv || '$5000'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">LTV:CAC</span>
                            <span className="text-emerald-400">{analysisData?.gtmDocuments?.financialProjections?.unitEconomics?.ltvCacRatio || '10:1'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Payback</span>
                            <span className="text-emerald-400">{analysisData?.gtmDocuments?.financialProjections?.unitEconomics?.paybackPeriod || '6 months'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <div className="text-white font-medium mb-2">Funding Requirements</div>
                        <div className="text-slate-400 text-sm mb-2">
                          Amount: <span className="text-emerald-400 font-semibold">{analysisData?.gtmDocuments?.financialProjections?.fundingRequirements?.amount || '$2M'}</span>
                        </div>
                        <div className="text-slate-400 text-sm">
                          Timeline: {analysisData?.gtmDocuments?.financialProjections?.fundingRequirements?.timeline || '18 months'}
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => exportUtils.exportData(analysisData, 'Financial Projections')}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Export Financial Model
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="interactive" className="space-y-6">
              {/* Export Options */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Download className="h-5 w-5 text-emerald-400" />
                    Export GTM Documents
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Download comprehensive GTM documentation in various formats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => exportUtils.exportMemo(analysisData, 'GTM Strategy')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Strategy Document
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => exportUtils.exportPitch(analysisData, 'Launch Plan')}
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      Launch Plan
                    </Button>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => exportUtils.exportSummary(analysisData, 'Sales Playbook')}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Sales Playbook
                    </Button>
                    <Button 
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => exportUtils.exportData(analysisData, 'Complete GTM Suite')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Complete Suite
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* GTM Simulator */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-400" />
                    GTM Strategy Simulator
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Test different scenarios and assumptions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-700/50 rounded-lg p-6 text-center">
                    <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-300 mb-4">Interactive GTM simulation tools</p>
                    <p className="text-slate-400 text-sm mb-4">
                      Adjust market assumptions, pricing models, and launch strategies to see real-time impact on success probability and financial projections.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Zap className="h-4 w-4 mr-2" />
                      Launch Simulator
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Market Research Assistant */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-400" />
                    Market Research Assistant
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    AI-powered market data gathering and competitive intelligence
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-700/50 rounded-lg p-6 text-center">
                    <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-300 mb-4">Automated market research and competitive analysis</p>
                    <p className="text-slate-400 text-sm mb-4">
                      Get real-time market data, competitor analysis, and industry insights to refine your GTM strategy.
                    </p>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Eye className="h-4 w-4 mr-2" />
                      Start Research
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Launch Readiness Checker */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Launch Readiness Checker
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Comprehensive pre-launch audit and checklist
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-700/50 rounded-lg p-6 text-center">
                    <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-300 mb-4">Validate your readiness for market launch</p>
                    <p className="text-slate-400 text-sm mb-4">
                      Comprehensive checklist covering product, market, team, and operational readiness factors.
                    </p>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Award className="h-4 w-4 mr-2" />
                      Check Readiness
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ViewContainer>
      </div>
    </AppLayout>
  );
};

export default GTMLabPage;
