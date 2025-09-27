"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LuLoader,
  LuCircleCheck,
  LuTriangleAlert,
  LuArrowRight,
  LuSearch,
  LuEye,
  LuUsers,
  LuHandshake,
  LuChartBar,
  LuFlaskConical,
  LuBot,
} from "react-icons/lu";

type AnalysisRedirectProps = {
  analysisId: string | null;
  targetView: string;
  onNavigate: (view: string) => void;
  onAnalysisComplete?: (analysis: any) => void;
  className?: string;
};

type AnalysisStatus = "idle" | "processing" | "completed" | "error";

type AnalysisStep = {
  id: string;
  label: string;
  description: string;
  status: "pending" | "processing" | "completed" | "error";
};

type ViewConfig = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  estimatedTime: string;
};

const viewConfigs: Record<string, ViewConfig> = {
  insights: {
    id: "insights",
    title: "Research Insights",
    description: "Analyzing document content and extracting key insights",
    icon: LuSearch,
    color: "emerald",
    estimatedTime: "2-3 minutes",
  },
  patents: {
    id: "patents",
    title: "Patent Radar",
    description: "Discovering related patents and IP landscape",
    icon: LuEye,
    color: "blue",
    estimatedTime: "3-4 minutes",
  },
  stakeholders: {
    id: "stakeholders",
    title: "Stakeholder Network",
    description: "Identifying key inventors, assignees, and institutions",
    icon: LuUsers,
    color: "purple",
    estimatedTime: "2-3 minutes",
  },
  licensing: {
    id: "licensing",
    title: "Licensing Opportunities",
    description: "Finding commercialization and licensing prospects",
    icon: LuHandshake,
    color: "orange",
    estimatedTime: "4-5 minutes",
  },
  "vc-lens": {
    id: "vc-lens",
    title: "VC Lens Analysis",
    description: "Evaluating startup potential and investment opportunities",
    icon: LuChartBar,
    color: "green",
    estimatedTime: "3-4 minutes",
  },
  "gtm-lab": {
    id: "gtm-lab",
    title: "GTM Strategy",
    description: "Developing go-to-market strategy and recommendations",
    icon: LuFlaskConical,
    color: "indigo",
    estimatedTime: "5-6 minutes",
  },
  assistant: {
    id: "assistant",
    title: "AI Assistant",
    description: "Preparing AI assistant with document context",
    icon: LuBot,
    color: "emerald",
    estimatedTime: "1-2 minutes",
  },
};

export function AnalysisRedirect({
  analysisId,
  targetView,
  onNavigate,
  onAnalysisComplete,
  className = "",
}: AnalysisRedirectProps) {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const viewConfig = viewConfigs[targetView] || viewConfigs.insights;

  const analysisSteps: AnalysisStep[] = [
    {
      id: "ingest",
      label: "Document Processing",
      description: "Extracting and parsing document content",
      status: "pending",
    },
    {
      id: "analyze",
      label: "Content Analysis",
      description: "Analyzing technical content and extracting insights",
      status: "pending",
    },
    {
      id: "search",
      label: "Knowledge Search",
      description: "Searching related patents and publications",
      status: "pending",
    },
    {
      id: "generate",
      label: `${viewConfig.title} Generation`,
      description: viewConfig.description,
      status: "pending",
    },
  ];

  const [steps, setSteps] = useState<AnalysisStep[]>(analysisSteps);

  const simulateStepProgress = useCallback((
    duration: number,
    stepIndex: number,
    targetProgress: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const startProgress = progress;

      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        const currentProgress =
          startProgress + (targetProgress - startProgress) * progressRatio;

        setProgress(currentProgress);

        // Update time remaining
        const remainingSteps = steps.length - stepIndex - 1;
        const avgStepTime = 3.5; // seconds
        const remainingTime = Math.max(
          0,
          remainingSteps * avgStepTime + (duration - elapsed) / 1000
        );

        if (remainingTime > 60) {
          setTimeRemaining(`${Math.ceil(remainingTime / 60)} min remaining`);
        } else {
          setTimeRemaining(`${Math.ceil(remainingTime)} sec remaining`);
        }

        if (progressRatio < 1) {
          requestAnimationFrame(updateProgress);
        } else {
          resolve();
        }
      };

      updateProgress();
    });
  }, [progress, steps.length, setProgress, setTimeRemaining]);

  const startAnalysis = useCallback(async () => {
    setStatus("processing");
    setError(null);
    setProgress(0);
    setCurrentStep(0);

    try {
      // Simulate analysis process
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);

        // Update current step to processing
        setSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            status:
              index === i ? "processing" : index < i ? "completed" : "pending",
          }))
        );

        // Simulate step processing time
        const stepDuration = 2000 + Math.random() * 3000; // 2-5 seconds per step
        const stepProgress = ((i + 1) / steps.length) * 100;

        await simulateStepProgress(stepDuration, i, stepProgress);

        // Mark step as completed
        setSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            status: index <= i ? "completed" : "pending",
          }))
        );
      }

      // Simulate analysis result
      const mockResult = {
        id: analysisId,
        title: "Analysis Complete",
        novelty_score: 0.75 + Math.random() * 0.2,
        scores: {
          technical_merit: 0.7 + Math.random() * 0.3,
          commercial_potential: 0.6 + Math.random() * 0.4,
          market_readiness: 0.5 + Math.random() * 0.4,
          competitive_advantage: 0.65 + Math.random() * 0.35,
        },
        related_patents: Array.from(
          { length: Math.floor(Math.random() * 10) + 5 },
          (_, i) => ({ id: i })
        ),
        related_publications: Array.from(
          { length: Math.floor(Math.random() * 8) + 3 },
          (_, i) => ({ id: i })
        ),
        stakeholders: {
          inventors: Array.from(
            { length: Math.floor(Math.random() * 5) + 2 },
            (_, i) => ({ id: i })
          ),
          assignees: Array.from(
            { length: Math.floor(Math.random() * 3) + 1 },
            (_, i) => ({ id: i })
          ),
          institutions: Array.from(
            { length: Math.floor(Math.random() * 4) + 1 },
            (_, i) => ({ id: i })
          ),
        },
        created_at: new Date().toISOString(),
      };

      setAnalysisResult(mockResult);
      setStatus("completed");
      setProgress(100);

      if (onAnalysisComplete) {
        onAnalysisComplete(mockResult);
      }

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        onNavigate(targetView);
      }, 2000);
    } catch (err) {
      setError("Analysis failed. Please try again.");
      setStatus("error");
      setSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          status:
            index === currentStep
              ? "error"
              : index < currentStep
              ? "completed"
              : "pending",
        }))
      );
    }
  }, [analysisId, targetView, onNavigate, onAnalysisComplete, steps.length, simulateStepProgress, currentStep]);

  useEffect(() => {
    if (!analysisId || status !== "idle") return;

    startAnalysis();
  }, [analysisId, targetView, startAnalysis, status]);

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, any> = {
      emerald: {
        text: "text-emerald-300",
        icon: "text-emerald-400",
        bg: "bg-emerald-500",
      },
      blue: { text: "text-blue-300", icon: "text-blue-400", bg: "bg-blue-500" },
      purple: {
        text: "text-purple-300",
        icon: "text-purple-400",
        bg: "bg-purple-500",
      },
      orange: {
        text: "text-orange-300",
        icon: "text-orange-400",
        bg: "bg-orange-500",
      },
      green: {
        text: "text-green-300",
        icon: "text-green-400",
        bg: "bg-green-500",
      },
      indigo: {
        text: "text-indigo-300",
        icon: "text-indigo-400",
        bg: "bg-indigo-500",
      },
    };
    return colorMap[color] || colorMap.emerald;
  };

  const getStepIcon = (step: AnalysisStep) => {
    switch (step.status) {
      case "processing":
        return <LuLoader className="animate-spin text-emerald-400" size={16} />;
      case "completed":
        return <LuCircleCheck className="text-emerald-400" size={16} />;
      case "error":
        return <LuTriangleAlert className="text-red-400" size={16} />;
      default:
        return (
          <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
        );
    }
  };

  if (status === "idle") {
    return null;
  }

  const colors = getColorClasses(viewConfig.color);
  const IconComponent = viewConfig.icon;

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <IconComponent size={24} className={colors.icon} />
        <div>
          <h3 className={`text-xl font-semibold ${colors.text}`}>
            {status === "completed"
              ? "Analysis Complete!"
              : `Generating ${viewConfig.title}`}
          </h3>
          <p className="text-slate-400 text-sm">
            {status === "completed"
              ? "Redirecting to results..."
              : viewConfig.description}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-300 text-sm font-medium">
            {Math.round(progress)}% Complete
          </span>
          {status === "processing" && timeRemaining && (
            <span className="text-slate-500 text-xs">{timeRemaining}</span>
          )}
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${colors.bg}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Analysis Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              step.status === "processing"
                ? "bg-slate-800/50 border border-slate-700"
                : step.status === "completed"
                ? "bg-emerald-500/5 border border-emerald-500/20"
                : step.status === "error"
                ? "bg-red-500/5 border border-red-500/20"
                : "bg-slate-900/30"
            }`}
          >
            {getStepIcon(step)}
            <div className="flex-1">
              <p
                className={`font-medium text-sm ${
                  step.status === "completed"
                    ? "text-emerald-300"
                    : step.status === "error"
                    ? "text-red-300"
                    : step.status === "processing"
                    ? "text-slate-200"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </p>
              <p className="text-slate-500 text-xs">{step.description}</p>
            </div>
            {step.status === "processing" && (
              <LuLoader className="animate-spin text-slate-400" size={14} />
            )}
          </div>
        ))}
      </div>

      {/* Status Messages */}
      {status === "completed" && (
        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-300">
            <LuCircleCheck size={16} />
            <span className="font-medium">
              Analysis completed successfully!
            </span>
          </div>
          <p className="text-emerald-400/80 text-sm mt-1">
            Redirecting to {viewConfig.title} in a moment...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-300">
            <LuTriangleAlert size={16} />
            <span className="font-medium">Analysis failed</span>
          </div>
          {error && <p className="text-red-400/80 text-sm mt-1">{error}</p>}
          <button
            onClick={startAnalysis}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      )}
    </div>
  );
}
