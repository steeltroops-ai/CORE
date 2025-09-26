"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Cpu,
  Database,
  Brain,
  BarChart3,
  Network,
  Briefcase,
  Target,
  Timer,
  Activity,
  Zap,
  ArrowRight,
} from "lucide-react";

interface ProcessingStage {
  id: string;
  name: string;
  description: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  duration?: number;
  startTime?: number;
  endTime?: number;
  result?: any;
  apiCalls?: number;
  tokensUsed?: number;
  errorMessage?: string;
}

interface ProcessingPipelineProps {
  stages: ProcessingStage[];
  isProcessing: boolean;
  showTechnicalDetails?: boolean;
  className?: string;
}

const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({
  stages,
  isProcessing,
  showTechnicalDetails = false,
  className = "",
}) => {
  const getStageIcon = (stage: ProcessingStage) => {
    const iconProps = { size: 20 };
    
    switch (stage.id) {
      case "extract":
        return <Cpu {...iconProps} />;
      case "logic_mill":
        return <Database {...iconProps} />;
      case "claude":
        return <Brain {...iconProps} />;
      case "novelty":
        return <BarChart3 {...iconProps} />;
      case "competitive":
        return <Network {...iconProps} />;
      case "commercialization":
        return <Briefcase {...iconProps} />;
      case "strategic":
        return <Target {...iconProps} />;
      default:
        return <Activity {...iconProps} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-emerald-400" size={16} />;
      case "processing":
        return (
          <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
        );
      case "error":
        return <AlertTriangle className="text-red-400" size={16} />;
      default:
        return <Clock className="text-slate-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
      case "processing":
        return "text-blue-300 bg-blue-500/10 border-blue-500/20";
      case "error":
        return "text-red-300 bg-red-500/10 border-red-500/20";
      default:
        return "text-slate-400 bg-slate-800/30 border-slate-700";
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "--";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const completedStages = stages.filter(s => s.status === 'completed').length;
  const totalStages = stages.length;
  const overallProgress = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  return (
    <Card className={`bg-slate-900/50 border-slate-800 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isProcessing ? (
                <div className="animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
              ) : (
                <Zap className="text-emerald-400" size={20} />
              )}
              <CardTitle className="text-slate-200">
                {isProcessing ? "Processing Pipeline" : "Analysis Pipeline"}
              </CardTitle>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
              {completedStages}/{totalStages} Complete
            </Badge>
          </div>
          
          {isProcessing && (
            <div className="text-right">
              <div className="text-sm text-slate-400 mb-1">
                Overall Progress
              </div>
              <div className="flex items-center gap-2">
                <Progress value={overallProgress} className="w-24 h-2" />
                <span className="text-sm text-slate-300 min-w-[3rem]">
                  {overallProgress.toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.id}>
              <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 ${getStatusColor(stage.status)}`}>
                {/* Stage Icon */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className={`p-2 rounded-lg ${
                      stage.status === 'completed' ? 'bg-emerald-500/20' :
                      stage.status === 'processing' ? 'bg-blue-500/20' :
                      stage.status === 'error' ? 'bg-red-500/20' :
                      'bg-slate-700/50'
                    }`}>
                      {getStageIcon(stage)}
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      {getStatusIcon(stage.status)}
                    </div>
                  </div>
                </div>

                {/* Stage Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {stage.name}
                    </h4>
                    {stage.status === 'processing' && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Timer size={12} />
                        {stage.progress}%
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-400 mb-2">
                    {stage.description}
                  </p>

                  {/* Progress Bar */}
                  {stage.status === 'processing' && (
                    <Progress 
                      value={stage.progress} 
                      className="h-1.5 mb-2"
                    />
                  )}

                  {/* Technical Details */}
                  {showTechnicalDetails && (
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {stage.duration && (
                        <span className="flex items-center gap-1">
                          <Timer size={10} />
                          {formatDuration(stage.duration)}
                        </span>
                      )}
                      {stage.apiCalls !== undefined && (
                        <span className="flex items-center gap-1">
                          <Activity size={10} />
                          {stage.apiCalls} API calls
                        </span>
                      )}
                      {stage.tokensUsed !== undefined && stage.tokensUsed > 0 && (
                        <span className="flex items-center gap-1">
                          <Zap size={10} />
                          {stage.tokensUsed.toLocaleString()} tokens
                        </span>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {stage.status === 'error' && stage.errorMessage && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
                      {stage.errorMessage}
                    </div>
                  )}
                </div>

                {/* Connection Arrow */}
                {index < stages.length - 1 && (
                  <div className="flex-shrink-0">
                    <ArrowRight 
                      className={`${
                        stage.status === 'completed' ? 'text-emerald-400' : 'text-slate-600'
                      }`} 
                      size={16} 
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline Summary */}
        {!isProcessing && completedStages > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-emerald-300">
                  {completedStages}
                </div>
                <div className="text-xs text-slate-400">Stages Complete</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-300">
                  {stages.reduce((sum, s) => sum + (s.apiCalls || 0), 0)}
                </div>
                <div className="text-xs text-slate-400">API Calls</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-purple-300">
                  {stages.reduce((sum, s) => sum + (s.tokensUsed || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">Tokens Used</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-yellow-300">
                  {formatDuration(stages.reduce((sum, s) => sum + (s.duration || 0), 0))}
                </div>
                <div className="text-xs text-slate-400">Total Time</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessingPipeline;