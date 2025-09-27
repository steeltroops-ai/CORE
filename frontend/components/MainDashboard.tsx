"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  ExternalLink,
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
  Rocket,
  Shield
} from "lucide-react";
import LoadingSpinner, { SkeletonCard, LazyLoadWrapper } from '@/components/LoadingSpinner';
import { TouchButton, SwipeGesture } from '@/components/TouchInteractions';
import ResponsiveImage from '@/components/ResponsiveImage';
import { createLazyComponent, memoryManagement, deviceOptimization } from '@/utils/performance';
const { debounce } = memoryManagement;
const { optimizeForDevice } = deviceOptimization;

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
  const [isOptimized, setIsOptimized] = useState(false);

  // Device optimization and performance monitoring
  useEffect(() => {
    const initializeOptimizations = async () => {
      try {
        await optimizeForDevice();
        setIsOptimized(true);
      } catch (error) {
        console.warn('Device optimization failed:', error);
      }
    };

    initializeOptimizations();
  }, []);

  // Debounced resize handler for responsive adjustments
  useEffect(() => {
    const handleResize = debounce(() => {
      // Trigger re-optimization on significant screen size changes
      if (window.innerWidth !== window.screen.width) {
        optimizeForDevice();
      }
    }, 250);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            <TouchButton
              onClick={() => setShowAchievements(true)}
              className="relative bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400 hover:from-yellow-500/25 hover:to-orange-500/25 hover:border-yellow-500/40 transition-all duration-200 group"
              size="lg"
              hapticFeedback={true}
            >
              <Award className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold">Awards</span>
              <Badge className="ml-2 bg-yellow-500/20 text-yellow-300 border-yellow-500/40">
                {unlockedAchievements}/{totalAchievements}
              </Badge>
              {unlockedAchievements > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              )}
            </TouchButton>
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

      {/* Key Metrics Grid - Responsive */}
      <LazyLoadWrapper fallback={<SkeletonCard />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400 truncate">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                Research Papers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-xl sm:text-2xl font-bold text-emerald-400">
                  {metrics.totalAnalyses}
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Analyzed</div>
                  <div className="text-xs text-emerald-300">+{metrics.activeProjects} active</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400 truncate">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                Similarity Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-xl sm:text-2xl font-bold text-blue-400">
                  {metrics.similaritySearches}
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Performed</div>
                  <div className="text-xs text-blue-300">High accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400 truncate">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                VC Evaluations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-xl sm:text-2xl font-bold text-purple-400">
                  {metrics.vcEvaluations}
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Completed</div>
                  <div className="text-xs text-purple-300">Investment ready</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400 truncate">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                GTM Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-xl sm:text-2xl font-bold text-orange-400">
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
      </LazyLoadWrapper>

      {/* Quick Actions - Responsive Grid */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <Zap className="h-5 w-5 text-emerald-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SwipeGesture
            onSwipeLeft={() => console.log('Swipe left on quick actions')}
            onSwipeRight={() => console.log('Swipe right on quick actions')}
            className="w-full"
          >
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {quickActions.map((action, index) => (
                <TouchButton
                  key={index}
                  onClick={action.action}
                  variant="ghost"
                  className={`h-20 sm:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2 border ${action.color} hover:bg-slate-800/50 transition-all duration-200 hover:scale-[1.02] min-h-touch p-2 group`}
                  hapticFeedback={true}
                >
                  <div className="p-2 rounded-lg bg-current/10">
                    <div className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0">{action.icon}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-xs sm:text-sm leading-tight">{action.title}</div>
                    <div className="text-xs opacity-70 hidden sm:block">{action.description}</div>
                  </div>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </TouchButton>
              ))}
            </div>
          </SwipeGesture>
        </CardContent>
      </Card>

      {/* Platform Tools - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {platformTools.map((tool, index) => (
          <TouchButton
            key={index}
            onClick={tool.action}
            className="p-0 h-auto bg-transparent border-0 hover:bg-transparent"
            hapticFeedback={true}
          >
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg w-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${tool.gradient}`}>
                      {tool.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-200">{tool.title}</CardTitle>
                      <CardDescription className="text-slate-400 text-sm">
                        {tool.description}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-slate-700/50 text-slate-300">
                    {tool.metrics}
                  </Badge>
                  <div className="text-xs text-slate-400">Click to explore</div>
                </div>
              </CardContent>
            </Card>
          </TouchButton>
        ))}
      </div>

      {/* Empty State for New Users */}
      {metrics.totalAnalyses === 0 && (
        <Card className="bg-slate-800/30 border-slate-700 border-dashed">
          <CardContent className="text-center py-12">
            <div className="mb-4">
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-200 mb-2">
                Welcome to CORE!
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Get started by uploading your first research paper to unlock powerful analysis tools and insights.
              </p>
            </div>
            <TouchButton 
              onClick={onUpload} 
              className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
              hapticFeedback={true}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload your first research paper
            </TouchButton>
          </CardContent>
        </Card>
      )}

      {/* Achievement Modal */}
      {showAchievements && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-200">
                  <Award className="h-5 w-5 text-yellow-400" />
                  Achievements
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAchievements(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ×
                </Button>
              </div>
              <CardDescription>
                Track your progress and unlock new achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border transition-all ${
                    achievement.unlocked
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-slate-700/30 border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        achievement.unlocked
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-slate-600/50 text-slate-400"
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`font-medium ${
                          achievement.unlocked ? "text-slate-200" : "text-slate-400"
                        }`}
                      >
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <div className="text-emerald-400">
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    )}
                  </div>
                  {achievement.maxProgress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-slate-400">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                      <Progress
                        value={(achievement.progress! / achievement.maxProgress) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;