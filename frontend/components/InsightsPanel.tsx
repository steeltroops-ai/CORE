"use client";

import { useMemo } from "react";
import {
  LuTrendingUp,
  LuTrendingDown,
  LuMinus,
  LuEye,
  LuUsers,
  LuBuilding,
  LuFileText,
  LuStar,
  LuTarget,
  LuDollarSign,
  LuClock,
  LuChartBar,
  LuChartPie,
  LuActivity,
} from "react-icons/lu";

type InsightsPanelProps = {
  analysis: {
    novelty_score?: number;
    scores?: {
      technical_merit?: number;
      commercial_potential?: number;
      market_readiness?: number;
      competitive_advantage?: number;
    };
    related_patents?: any[];
    related_publications?: any[];
    stakeholders?: {
      inventors?: any[];
      assignees?: any[];
      institutions?: any[];
    };
    title?: string;
    created_at?: string;
  } | null;
  className?: string;
};

type InsightCard = {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  description: string;
};

type ScoreMetric = {
  label: string;
  value: number;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

export function InsightsPanel({
  analysis,
  className = "",
}: InsightsPanelProps) {
  const insights = useMemo(() => {
    if (!analysis) return [];

    const cards: InsightCard[] = [];

    // Novelty Score
    if (analysis.novelty_score !== undefined) {
      cards.push({
        id: "novelty",
        title: "Novelty Score",
        value: `${Math.round(analysis.novelty_score * 100)}%`,
        change:
          analysis.novelty_score > 0.7
            ? 15
            : analysis.novelty_score > 0.4
            ? 0
            : -10,
        icon: LuStar,
        color:
          analysis.novelty_score > 0.7
            ? "emerald"
            : analysis.novelty_score > 0.4
            ? "yellow"
            : "red",
        description: "Research innovation potential",
      });
    }

    // Patent Coverage
    if (analysis.related_patents) {
      cards.push({
        id: "patents",
        title: "Related Patents",
        value: analysis.related_patents.length,
        icon: LuFileText,
        color: "blue",
        description: "Similar patents identified",
      });
    }

    // Publications
    if (analysis.related_publications) {
      cards.push({
        id: "publications",
        title: "Publications",
        value: analysis.related_publications.length,
        icon: LuEye,
        color: "purple",
        description: "Related research papers",
      });
    }

    // Stakeholder Count
    if (analysis.stakeholders) {
      const totalStakeholders =
        (analysis.stakeholders.inventors?.length || 0) +
        (analysis.stakeholders.assignees?.length || 0) +
        (analysis.stakeholders.institutions?.length || 0);

      cards.push({
        id: "stakeholders",
        title: "Key Stakeholders",
        value: totalStakeholders,
        icon: LuUsers,
        color: "orange",
        description: "Inventors, assignees & institutions",
      });
    }

    return cards;
  }, [analysis]);

  const scoreMetrics = useMemo(() => {
    if (!analysis?.scores) return [];

    const metrics: ScoreMetric[] = [];

    if (analysis.scores.technical_merit !== undefined) {
      metrics.push({
        label: "Technical Merit",
        value: analysis.scores.technical_merit,
        color: "emerald",
        icon: LuChartBar,
      });
    }

    if (analysis.scores.commercial_potential !== undefined) {
      metrics.push({
        label: "Commercial Potential",
        value: analysis.scores.commercial_potential,
        color: "blue",
        icon: LuDollarSign,
      });
    }

    if (analysis.scores.market_readiness !== undefined) {
      metrics.push({
        label: "Market Readiness",
        value: analysis.scores.market_readiness,
        color: "purple",
        icon: LuTarget,
      });
    }

    if (analysis.scores.competitive_advantage !== undefined) {
      metrics.push({
        label: "Competitive Edge",
        value: analysis.scores.competitive_advantage,
        color: "orange",
        icon: LuActivity,
      });
    }

    return metrics;
  }, [analysis?.scores]);

  const getTrendIcon = (change?: number) => {
    if (!change) return LuMinus;
    return change > 0 ? LuTrendingUp : LuTrendingDown;
  };

  const getTrendColor = (change?: number) => {
    if (!change) return "text-slate-400";
    return change > 0 ? "text-emerald-400" : "text-red-400";
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, any> = {
      emerald: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        text: "text-emerald-300",
        icon: "text-emerald-400",
      },
      blue: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-300",
        icon: "text-blue-400",
      },
      purple: {
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        text: "text-purple-300",
        icon: "text-purple-400",
      },
      orange: {
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        text: "text-orange-300",
        icon: "text-orange-400",
      },
      yellow: {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        text: "text-yellow-300",
        icon: "text-yellow-400",
      },
      red: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-300",
        icon: "text-red-400",
      },
    };

    return colorMap[color] || colorMap.emerald;
  };

  const getScoreColor = (value: number) => {
    if (value >= 0.8) return "emerald";
    if (value >= 0.6) return "blue";
    if (value >= 0.4) return "yellow";
    return "red";
  };

  if (!analysis) {
    return (
      <div
        className={`rounded-xl border border-slate-800 bg-slate-900/50 p-6 ${className}`}
      >
        <div className="text-center py-8">
          <LuChartPie className="text-slate-600 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">
            No Analysis Available
          </h3>
          <p className="text-slate-500 text-sm">
            Upload a document to see insights and analysis results
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LuChartPie className="text-emerald-300" size={24} />
          <h3 className="text-xl font-semibold text-emerald-300">
            Analysis Insights
          </h3>
        </div>

        {analysis.created_at && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <LuClock size={16} />
            <span>
              Updated {new Date(analysis.created_at).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight) => {
            const colors = getColorClasses(insight.color);
            const IconComponent = insight.icon;
            const TrendIcon = getTrendIcon(insight.change);
            const trendColor = getTrendColor(insight.change);

            return (
              <div
                key={insight.id}
                className={`rounded-lg border p-4 ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <IconComponent size={20} className={colors.icon} />
                  {insight.change !== undefined && (
                    <div
                      className={`flex items-center gap-1 text-xs ${trendColor}`}
                    >
                      <TrendIcon size={12} />
                      <span>{Math.abs(insight.change)}%</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className={`text-2xl font-bold ${colors.text}`}>
                    {insight.value}
                  </p>
                  <p className="text-slate-300 font-medium text-sm">
                    {insight.title}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Score Metrics */}
      {scoreMetrics.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h4 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <LuChartBar size={20} className="text-emerald-400" />
            Performance Scores
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scoreMetrics.map((metric) => {
              const scoreColor = getScoreColor(metric.value);
              const colors = getColorClasses(scoreColor);
              const IconComponent = metric.icon;
              const percentage = Math.round(metric.value * 100);

              return (
                <div key={metric.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent size={16} className={colors.icon} />
                      <span className="text-slate-300 font-medium text-sm">
                        {metric.label}
                      </span>
                    </div>
                    <span className={`font-bold ${colors.text}`}>
                      {percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        scoreColor === "emerald"
                          ? "bg-emerald-500"
                          : scoreColor === "blue"
                          ? "bg-blue-500"
                          : scoreColor === "yellow"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis Summary */}
      {analysis.title && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h4 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <LuFileText size={20} className="text-emerald-400" />
            Document Summary
          </h4>

          <div className="space-y-2">
            <p className="text-slate-300 font-medium">{analysis.title}</p>
            <p className="text-slate-500 text-sm">
              Analysis completed with {insights.length} key metrics identified
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
