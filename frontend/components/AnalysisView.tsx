"use client";

import { AnalysisSummary } from "../lib/api";
import { InsightsPanel } from "./InsightsPanel";
import { InsightTabs } from "./InsightTabs";
import { PatentTable } from "./PatentTable";
import { StakeholderPanel } from "./StakeholderPanel";

type AnalysisViewProps = {
  analysis: AnalysisSummary | null;
  className?: string;
};

export function AnalysisView({ analysis, className = "" }: AnalysisViewProps) {
  if (!analysis) {
    return (
      <div className={`bg-slate-900/50 border border-slate-800 rounded-lg p-8 text-center ${className}`}>
        <p className="text-slate-400">No analysis data available. Please upload a document first.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <InsightsPanel analysis={analysis} className="mb-6" />
      <InsightTabs analysis={analysis} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PatentTable title="Related Patents" hits={analysis?.related_patents || []} />
        <StakeholderPanel 
          inventors={analysis?.stakeholders?.inventors || []} 
          assignees={analysis?.stakeholders?.assignees || []} 
          institutions={analysis?.stakeholders?.institutions || []} 
        />
      </div>
    </div>
  );
}