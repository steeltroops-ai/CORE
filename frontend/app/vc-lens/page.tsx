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
  Users, 
  TrendingUp, 
  Target, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Download,
  MessageSquare,
  Zap,
  DollarSign,
  Building,
  Award,
  Eye,
  Star
} from "lucide-react";
import { LuTrendingUp } from "react-icons/lu";
import { vcAnalysisService, VCAnalysisInput, VCAnalysisResult } from "@/lib/vcAnalysisService";
import { exportUtils } from "@/lib/exportService";

const VCLensPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inputs');
  const [analysisData, setAnalysisData] = useState<VCAnalysisResult>({
    overallScore: 78,
    teamScore: 85,
    techScore: 82,
    marketScore: 75,
    scalabilityScore: 70,
    riskScore: 65,
    fundingReadiness: 'Series A',
    valuation: '$8-12M',
    tam: '$50B',
    sam: '$5B',
    som: '$500M',
    strengths: [
      { title: 'Strong Technical Team', description: 'Experienced founders with deep domain expertise', impact: 'high' },
      { title: 'Large Market Opportunity', description: 'Addressing a $50B+ market with strong growth potential', impact: 'high' }
    ],
    risks: [
      { title: 'Market Competition', description: 'Established players with significant resources', severity: 'medium' },
      { title: 'Regulatory Uncertainty', description: 'Potential regulatory changes could impact business model', severity: 'low' }
    ],
    comparableCompanies: [
      { name: 'TechCorp', stage: 'Series B', funding: '$25M', investors: ['Sequoia', 'A16Z'] },
      { name: 'InnovateLab', stage: 'Series A', funding: '$12M', investors: ['GV', 'NEA'] }
    ],
    investmentMemo: 'This startup demonstrates strong potential with an experienced team, large market opportunity, and innovative technology approach. The founding team has deep domain expertise and a track record of execution. Market timing appears favorable with growing demand in the target sector.'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [formData, setFormData] = useState<VCAnalysisInput>({
    research: { files: [], links: [], abstract: '' },
    pitchDeck: { file: undefined, slides: [] },
    team: { founders: [], linkedinProfiles: [], githubProfiles: [], publications: [] },
    market: { industry: '', targetCustomers: '', regions: '', pricingModel: '' }
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await vcAnalysisService.analyzeStartup(formData);
      setAnalysisData(result);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Analysis failed:', error);
      // Still show dashboard with default data on error
      setActiveTab('dashboard');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = (section: keyof VCAnalysisInput, field: string, value: any) => {
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

  return (
    <AppLayout>
      <div className="px-6 py-4">
        <ViewContainer
          icon={LuTrendingUp}
          title="VC Lens - Startup Evaluation"
          subtitle="Comprehensive investment analysis and startup evaluation platform"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="inputs" className="data-[state=active]:bg-slate-600">
                <Upload className="h-4 w-4 mr-2" />
                Data Input
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analysis Dashboard
              </TabsTrigger>
              <TabsTrigger value="interactive" className="data-[state=active]:bg-slate-600">
                <MessageSquare className="h-4 w-4 mr-2" />
                Interactive Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inputs" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Research Upload */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-400" />
                      Research Upload
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Upload research papers, abstracts, or provide links
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-300 mb-2">Drop research files here or click to browse</p>
                      <p className="text-xs text-slate-500">PDF, DOC, or paste research links</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Research Link (Optional)</Label>
                      <Input 
                        placeholder="https://arxiv.org/abs/..."
                        className="bg-slate-700 border-slate-600 text-white"
                        value={formData.research?.links?.[0] || ''}
                        onChange={(e) => handleInputChange('research', 'links', [e.target.value])}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Pitch Deck Upload */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-blue-400" />
                      Pitch Deck Upload
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Upload pitch deck for automated slide analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-300 mb-2">Drop pitch deck here</p>
                      <p className="text-xs text-slate-500">PPT, PPTX, or PDF format</p>
                    </div>
                    <div className="text-xs text-slate-500">
                      AI will auto-extract: Problem, Solution, Market, Traction, Team
                    </div>
                  </CardContent>
                </Card>

                {/* Team Information */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-400" />
                      Team Information
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Founder and team member details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Founder Names</Label>
                      <Input 
                        placeholder="John Doe, Jane Smith"
                        className="bg-slate-700 border-slate-600 text-white"
                        value={formData.team?.founders?.join(', ') || ''}
                        onChange={(e) => handleInputChange('team', 'founders', e.target.value.split(',').map(s => s.trim()))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">LinkedIn Profiles</Label>
                      <Textarea 
                        placeholder="linkedin.com/in/johndoe\nlinkedin.com/in/janesmith"
                        className="bg-slate-700 border-slate-600 text-white"
                        rows={3}
                        value={formData.team?.linkedinProfiles?.join('\n') || ''}
                        onChange={(e) => handleInputChange('team', 'linkedinProfiles', e.target.value.split('\n').filter(s => s.trim()))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">GitHub/Publications</Label>
                      <Textarea 
                        placeholder="github.com/johndoe\nscholar.google.com/citations?user=..."
                        className="bg-slate-700 border-slate-600 text-white"
                        rows={3}
                        value={[...(formData.team?.githubProfiles || []), ...(formData.team?.publications || [])].join('\n')}
                        onChange={(e) => {
                          const lines = e.target.value.split('\n').filter(s => s.trim());
                          const github = lines.filter(line => line.includes('github'));
                          const publications = lines.filter(line => !line.includes('github'));
                          handleInputChange('team', 'githubProfiles', github);
                          handleInputChange('team', 'publications', publications);
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Market Information */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-400" />
                      Market Information
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Industry and market assumptions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Industry</Label>
                      <Input 
                        placeholder="e.g., AI/ML, Biotech, Fintech"
                        className="bg-slate-700 border-slate-600 text-white"
                        value={formData.market?.industry || ''}
                        onChange={(e) => handleInputChange('market', 'industry', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Target Customers</Label>
                      <Input 
                        placeholder="e.g., Enterprise, SMB, Consumers"
                        className="bg-slate-700 border-slate-600 text-white"
                        value={formData.market?.targetCustomers || ''}
                        onChange={(e) => handleInputChange('market', 'targetCustomers', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Geographic Regions</Label>
                      <Input 
                        placeholder="e.g., North America, Europe, Global"
                        className="bg-slate-700 border-slate-600 text-white"
                        value={formData.market?.regions || ''}
                        onChange={(e) => handleInputChange('market', 'regions', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Pricing Model</Label>
                      <Input 
                        placeholder="e.g., SaaS ($50/month), License ($10k)"
                        className="bg-slate-700 border-slate-600 text-white"
                        value={formData.market?.pricingModel || ''}
                        onChange={(e) => handleInputChange('market', 'pricingModel', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center pt-6">
                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg font-medium min-w-[280px]"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analyzing Startup...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Start VC Analysis
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Overall Score Card */}
              <Card className="bg-gradient-to-r from-emerald-900/50 to-blue-900/50 border-slate-700">
                <CardHeader className="text-center">
                  <CardTitle className="text-white text-2xl mb-2">VC Readiness Score</CardTitle>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-6xl font-bold text-emerald-400">{analysisData.overallScore}</div>
                    <div className="text-slate-300">
                      <div className="text-lg font-medium">/100</div>
                      <Badge className={`${getScoreBg(analysisData.overallScore)} text-white`}>
                        {analysisData.fundingReadiness} Ready
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-slate-400 mt-2">
                    Estimated Valuation: <span className="text-emerald-400 font-semibold">{analysisData.valuation}</span>
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Radar Chart Placeholder */}
                <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      Performance Radar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Team</span>
                          <span className={`font-semibold ${getScoreColor(analysisData.teamScore)}`}>
                            {analysisData.teamScore}%
                          </span>
                        </div>
                        <Progress value={analysisData.teamScore} className="h-2" />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Technology</span>
                          <span className={`font-semibold ${getScoreColor(analysisData.techScore)}`}>
                            {analysisData.techScore}%
                          </span>
                        </div>
                        <Progress value={analysisData.techScore} className="h-2" />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Market</span>
                          <span className={`font-semibold ${getScoreColor(analysisData.marketScore)}`}>
                            {analysisData.marketScore}%
                          </span>
                        </div>
                        <Progress value={analysisData.marketScore} className="h-2" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Scalability</span>
                          <span className={`font-semibold ${getScoreColor(analysisData.scalabilityScore)}`}>
                            {analysisData.scalabilityScore}%
                          </span>
                        </div>
                        <Progress value={analysisData.scalabilityScore} className="h-2" />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Risk Assessment</span>
                          <span className={`font-semibold ${getScoreColor(analysisData.riskScore)}`}>
                            {analysisData.riskScore}%
                          </span>
                        </div>
                        <Progress value={analysisData.riskScore} className="h-2" />
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
                        <span className="text-white font-semibold">{analysisData.tam}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">SAM</span>
                        <span className="text-white font-semibold">{analysisData.sam}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">SOM</span>
                        <span className="text-emerald-400 font-semibold">{analysisData.som}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysisData.strengths?.map((strength, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium">{strength.title}</div>
                          <div className="text-slate-400 text-sm">{strength.description}</div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-slate-400 text-center py-4">
                        Strengths will be identified after analysis...
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Risks */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      Key Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysisData.risks?.map((risk, index) => {
                      const iconColor = risk.severity === 'high' ? 'text-red-400' : 
                                       risk.severity === 'medium' ? 'text-yellow-400' : 'text-orange-400';
                      return (
                        <div key={index} className="flex items-start gap-3">
                          <AlertTriangle className={`h-4 w-4 ${iconColor} mt-0.5 flex-shrink-0`} />
                          <div>
                            <div className="text-white font-medium">{risk.title}</div>
                            <div className="text-slate-400 text-sm">{risk.description}</div>
                          </div>
                        </div>
                      );
                    }) || (
                      <div className="text-slate-400 text-center py-4">
                        Risks will be assessed after analysis...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Comparable Companies */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-400" />
                    Comparable Startups
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Similar companies in the space with funding information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysisData.comparableCompanies?.map((company, index) => {
                      const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500'];
                      const bgColor = colors[index % colors.length];
                      
                      return (
                        <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                              {company.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-white font-medium">{company.name}</div>
                              <div className="text-slate-400 text-sm">{company.stage}</div>
                            </div>
                          </div>
                          <div className="text-emerald-400 font-semibold">{company.funding} raised</div>
                          <div className="text-slate-400 text-sm">{company.investors.join(', ')}</div>
                        </div>
                      );
                    }) || (
                      <div className="col-span-3 text-center text-slate-400 py-8">
                        Comparable companies will be shown after analysis...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Investment Memo */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-400" />
                    Investment Memo Draft
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    AI-generated investment summary for VCs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-700/50 rounded-lg p-4 text-slate-300 leading-relaxed">
                    <div className="whitespace-pre-wrap">
                      {analysisData.investmentMemo || 'Investment memo will be generated after analysis...'}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => exportUtils.exportMemo(analysisData, formData.team?.founders?.[0] || 'Startup')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Full Memo
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={() => exportUtils.exportSummary(analysisData, formData.team?.founders?.[0] || 'Startup')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Export Summary
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interactive" className="space-y-6">
              <div className="mb-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Download className="h-5 w-5 text-emerald-400" />
                      Export Options
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Download investor-ready materials in various formats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => exportUtils.exportMemo(analysisData, formData.team?.founders?.[0] || 'Startup')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Investment Memo
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => exportUtils.exportPitch(analysisData, formData.team?.founders?.[0] || 'Startup')}
                      >
                        <PieChart className="h-4 w-4 mr-2" />
                        Pitch Summary
                      </Button>
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => exportUtils.exportSummary(analysisData, formData.team?.founders?.[0] || 'Startup')}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Executive Summary
                      </Button>
                      <Button 
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={() => exportUtils.exportData(analysisData, formData.team?.founders?.[0] || 'Startup')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Raw Data (JSON)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pitch Deck Preview */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-400" />
                      Pitch Deck Preview
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      AI-annotated slides with key insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <PieChart className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-400">Upload pitch deck to see AI annotations</p>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Pitch Deck
                    </Button>
                  </CardContent>
                </Card>

                {/* Investor Q&A Simulator */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-purple-400" />
                      Investor Q&A Simulator
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Practice with AI-powered VC questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          VC
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-300">&ldquo;What&rsquo;s your biggest competitive risk and how do you plan to mitigate it?&rdquo;</p>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Q&A Session
                    </Button>
                  </CardContent>
                </Card>

                {/* Valuation Estimator */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-400" />
                      Valuation Estimator
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Rule-of-thumb valuation based on comparables
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Revenue Multiple</span>
                        <span className="text-emerald-400 font-semibold">8-12x</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Stage Adjustment</span>
                        <span className="text-blue-400 font-semibold">Series A</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Market Premium</span>
                        <span className="text-yellow-400 font-semibold">+25%</span>
                      </div>
                      <hr className="border-slate-600" />
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-white font-semibold">Estimated Valuation</span>
                        <span className="text-emerald-400 font-bold">{analysisData.valuation}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Detailed Analysis
                    </Button>
                  </CardContent>
                </Card>

                {/* Exit Scenarios */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-400" />
                      Exit Scenarios
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Potential exit paths and timelines
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white font-medium">Strategic Acquisition</span>
                          <Badge className="bg-emerald-500 text-white">High</Badge>
                        </div>
                        <div className="text-slate-400 text-sm">Google, Microsoft, Amazon (3-5 years)</div>
                      </div>
                      
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white font-medium">IPO</span>
                          <Badge className="bg-yellow-500 text-white">Medium</Badge>
                        </div>
                        <div className="text-slate-400 text-sm">Public offering (7-10 years)</div>
                      </div>
                      
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white font-medium">Private Equity</span>
                          <Badge className="bg-blue-500 text-white">Medium</Badge>
                        </div>
                        <div className="text-slate-400 text-sm">Growth capital (5-7 years)</div>
                      </div>
                    </div>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      <Star className="h-4 w-4 mr-2" />
                      Scenario Analysis
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </ViewContainer>
      </div>
    </AppLayout>
  );
};

export default VCLensPage;
