"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  BarChart3,
  Brain,
  Briefcase,
  Building,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  Globe,
  Lightbulb,
  Network,
  Plus,
  Search,
  Settings,
  Star,
  Target,
  TrendingUp,
  Upload,
  Users,
  Zap,
} from "lucide-react";

interface DashboardMetrics {
  totalAnalyses: number;
  similaritySearches: number;
  patentsDiscovered: number;
  vcEvaluations: number;
  gtmStrategies: number;
  insightsGenerated: number;
  activeProjects: number;
  successRate: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface MainDashboardProps {
  metrics?: DashboardMetrics;
  onNavigate: (view: string) => void;
  onUpload: () => void;
  className?: string;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  metrics = {
    totalAnalyses: 0,
    similaritySearches: 0,
    patentsDiscovered: 0,
    vcEvaluations: 0,
    gtmStrategies: 0,
    insightsGenerated: 0,
    activeProjects: 0,
    successRate: 0,
  },
  onNavigate,
  onUpload,
  className = "",
}) => {
  const [showAchievements, setShowAchievements] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const achievements: Achievement[] = [
    {
      id: "first-analysis",
      title: "First Steps",
      description: "Complete your first research analysis",
      icon: <FileText className="h-4 w-4" />,
      unlocked: metrics.totalAnalyses > 0,
      progress: Math.min(metrics.totalAnalyses, 1),
      maxProgress: 1,
    },
    {
      id: "patent-hunter",
      title: "Patent Hunter",
      description: "Discover 50+ related patents",
      icon: <Search className="h-4 w-4" />,
      unlocked: metrics.patentsDiscovered >= 50,
      progress: Math.min(metrics.patentsDiscovered, 50),
      maxProgress: 50,
    },
    {
      id: "vc-analyst",
      title: "VC Analyst",
      description: "Complete 10 startup evaluations",
      icon: <TrendingUp className="h-4 w-4" />,
      unlocked: metrics.vcEvaluations >= 10,
      progress: Math.min(metrics.vcEvaluations, 10),
      maxProgress: 10,
    },
    {
      id: "strategy-master",
      title: "Strategy Master",
      description: "Generate 5 GTM strategies",
      icon: <Target className="h-4 w-4" />,
      unlocked: metrics.gtmStrategies >= 5,
      progress: Math.min(metrics.gtmStrategies, 5),
      maxProgress: 5,
    },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const quickActions = [
    {
      title: "Upload Research",
      description: "Analyze new research paper",
      icon: <Upload className="h-5 w-5" />,
      action: onUpload,
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "VC Analysis",
      description: "Evaluate startup potential",
      icon: <TrendingUp className="h-5 w-5" />,
      action: () => onNavigate("vc-lens"),
      color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    {
      title: "GTM Strategy",
      description: "Create go-to-market plan",
      icon: <Target className="h-5 w-5" />,
      action: () => onNavigate("gtm-lab"),
      color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
    {
      title: "AI Assistant",
      description: "Get research insights",
      icon: <Brain className="h-5 w-5" />,
      action: () => onNavigate("assistant"),
      color: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    },
  ];

  const platformTools = [
    {
      title: "Research Insights",
      description: "Deep analysis of research content",
      icon: <Search className="h-6 w-6" />,
      metrics: `${metrics.totalAnalyses} analyses`,
      action: () => onNavigate("insights"),
      gradient: "from-emerald-500/20 to-emerald-600/20",
    },
    {
      title: "VC Lens",
      description: "Startup evaluation & investment analysis",
      icon: <TrendingUp className="h-6 w-6" />,
      metrics: `${metrics.vcEvaluations} evaluations`,
      action: () => onNavigate("vc-lens"),
      gradient: "from-blue-500/20 to-blue-600/20",
    },
    {
      title: "GTM Lab",
      description: "Go-to-market strategy development",
      icon: <Target className="h-6 w-6" />,
      metrics: `${metrics.gtmStrategies} strategies`,
      action: () => onNavigate("gtm-lab"),
      gradient: "from-purple-500/20 to-purple-600/20",
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 p-6">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {getGreeting()}, welcome to CORE
              </h1>
              <p className="text-slate-400">
                Your comprehensive research commercialization platform
              </p>
            </div>
            
            {/* Award Button */}
            <Button
              onClick={() => setShowAchievements(true)}
              className="relative bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400 hover:from-yellow-500/25 hover:to-orange-500/25 hover:border-yellow-500/40 transition-all duration-200 group"
              size="lg"
            >
              <Award className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold">Awards</span>
              <Badge className="ml-2 bg-yellow-500/20 text-yellow-300 border-yellow-500/40">
                {unlockedAchievements}/{totalAchievements}
              </Badge>
              {unlockedAchievements > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              )}
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {metrics.totalAnalyses}
              </div>
              <div className="text-xs text-slate-400">Total Analyses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {metrics.patentsDiscovered}
              </div>
              <div className="text-xs text-slate-400">Patents Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {metrics.insightsGenerated}
              </div>
              <div className="text-xs text-slate-400">Insights Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {metrics.successRate}%
              </div>
              <div className="text-xs text-slate-400">Success Rate</div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-xl" />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <FileText className="h-4 w-4" />
              Research Papers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-emerald-400">
                {metrics.totalAnalyses}
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Analyzed</div>
                <div className="text-xs text-emerald-300">+{metrics.activeProjects} active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <Search className="h-4 w-4" />
              Similarity Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-400">
                {metrics.similaritySearches}
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Performed</div>
                <div className="text-xs text-blue-300">High accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <Building className="h-4 w-4" />
              VC Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-400">
                {metrics.vcEvaluations}
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Completed</div>
                <div className="text-xs text-purple-300">Investment ready</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <Target className="h-4 w-4" />
              GTM Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-orange-400">
                {metrics.gtmStrategies}
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Generated</div>
                <div className="text-xs text-orange-300">Market ready</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <Zap className="h-5 w-5 text-emerald-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-center gap-3 border ${action.color} hover:bg-slate-800/50 transition-all duration-200 group`}
              >
                <div className="p-2 rounded-lg bg-current/10">
                  {action.icon}
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-70">{action.description}</div>
                </div>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {platformTools.map((tool, index) => (
          <Card
            key={index}
            className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200 cursor-pointer group overflow-hidden"
            onClick={tool.action}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-700/50 group-hover:bg-slate-600/70 transition-colors duration-200">
                    {tool.icon}
                  </div>
                  <div>
                    <div className="text-slate-200 font-semibold">{tool.title}</div>
                    <div className="text-xs text-slate-400">{tool.description}</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-200 transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
                  {tool.metrics}
                </Badge>
                <div className="text-xs text-slate-400">Click to explore</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <Clock className="h-5 w-5 text-emerald-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.totalAnalyses > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <FileText className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-200">Research Analysis Completed</div>
                  <div className="text-xs text-slate-400">Latest analysis finished successfully</div>
                </div>
                <div className="text-xs text-slate-400">Just now</div>
              </div>
              
              {metrics.patentsDiscovered > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Search className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-200">Patents Discovered</div>
                    <div className="text-xs text-slate-400">{metrics.patentsDiscovered} related patents found</div>
                  </div>
                  <div className="text-xs text-slate-400">2 min ago</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-4">No recent activity</div>
              <Button onClick={onUpload} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
                <Upload className="h-4 w-4 mr-2" />
                Upload your first research paper
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements Modal */}
      {showAchievements && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-yellow-400" />
                  <span className="text-slate-200">Achievements</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAchievements(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      achievement.unlocked
                        ? "bg-yellow-500/10 border-yellow-500/30"
                        : "bg-slate-700/30 border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          achievement.unlocked
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-slate-600/50 text-slate-400"
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            achievement.unlocked ? "text-yellow-300" : "text-slate-300"
                          }`}
                        >
                          {achievement.title}
                        </div>
                        <div className="text-sm text-slate-400">
                          {achievement.description}
                        </div>
                        {achievement.maxProgress && (
                          <div className="mt-2">
                            <Progress
                              value={(achievement.progress! / achievement.maxProgress) * 100}
                              className="h-1.5"
                            />
                            <div className="text-xs text-slate-400 mt-1">
                              {achievement.progress}/{achievement.maxProgress}
                            </div>
                          </div>
                        )}
                      </div>
                      {achievement.unlocked && (
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;