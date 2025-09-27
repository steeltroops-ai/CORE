"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LuChartBar,
  LuSearch,
  LuUsers,
  LuHandshake,
  LuBot,
} from "react-icons/lu";

import { AgentConsole } from "../components/AgentConsole";
import { AnalysisRedirect } from "../components/AnalysisRedirect";
import { ClientOnly } from "../components/ClientOnly";
import MainDashboard from "../components/MainDashboard";

import { InsightTabs } from "../components/InsightTabs";
import { InsightsPanel } from "../components/InsightsPanel";
import { LicensingList } from "../components/LicensingList";
import { PatentTable } from "../components/PatentTable";
import { StakeholderPanel } from "../components/StakeholderPanel";
import { StatusStepper } from "../components/StatusStepper";
import { ViewContainer } from "../components/ViewContainer";
import { ViewHeader } from "../components/ViewHeader";
import { AnalysisView } from "../components/AnalysisView";
import InsightsIntegrated from "../components/InsightsIntegrated";

import {
  AnalysisSummary,
  fetchAnalysis,
  ingestResearch,
  requestNarration,
  sendAgentPrompt,
} from "../lib/api";

type StepKey = "ingest" | "retrieve" | "analyze" | "narrate";

type ViewKey =
  | "dashboard"
  | "insights"
  | "vc-lens"
  | "gtm-lab"
  | "assistant"
  | "research-papers"
  | "settings"
  | "help"
  | "patents"
  | "stakeholders"
  | "licensing"
  | "agent";

const POLL_INTERVAL = 4000;

export default function HomePage() {
  const [activeStep, setActiveStep] = useState<StepKey>("ingest");

  const [activeView, setActiveView] = useState<ViewKey>("dashboard");

  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [narrationStatus, setNarrationStatus] = useState<
    "idle" | "pending" | "ready"
  >("idle");



  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [targetAnalysisView, setTargetAnalysisView] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!analysisId) {
      return undefined;
    }

    const currentId = analysisId;

    let isCancelled = false;

    async function poll() {
      try {
        const data = await fetchAnalysis(currentId);

        if (!isCancelled) {
          setAnalysis(data);

          setActiveStep(data.status === "completed" ? "analyze" : "retrieve");
        }
      } catch (error) {
        // swallow until ready
      }
    }

    const interval = window.setInterval(poll, POLL_INTERVAL);

    void poll();

    return () => {
      isCancelled = true;

      window.clearInterval(interval);
    };
  }, [analysisId]);

  async function handleIngest(payload: {
    title: string;
    abstract: string;
    body?: string;
  }) {
    setIsSubmitting(true);

    try {
      setActiveStep("ingest");

      const response = await ingestResearch(payload);

      setAnalysisId(response.analysis_id);

      setAnalysis(null);

      setActiveStep("retrieve");

      setActiveView("dashboard");
    } finally {
      setIsSubmitting(false);
    }
  }



  function handleAnalysisNavigation(view: string) {
    if (!analysisId) {
      // If no document is uploaded, just show a message
      return;
    }

    setTargetAnalysisView(view);
    setIsAnalyzing(true);
  }

  function handleAnalysisComplete(analysisResult: any) {
    setAnalysis(analysisResult);
    setIsAnalyzing(false);
    setTargetAnalysisView(null);
  }

  async function handleAgentPrompt(message: string) {
    if (!analysisId) {
      return "Analysis not ready";
    }

    const reply = await sendAgentPrompt(analysisId, message);

    return reply;
  }

  async function handleNarrationRequest() {
    if (!analysisId) {
      return;
    }

    setNarrationStatus("pending");

    await requestNarration(analysisId);

    setNarrationStatus("ready");
  }

  const dashboardMetrics = useMemo(() => {
    // Calculate metrics based on analysis data or use defaults
    const baseMetrics = {
      totalAnalyses: analysisId ? 1 : 0,
      similaritySearches: analysisId ? 1 : 0,
      patentsDiscovered: analysis?.related_patents?.length || 0,
      vcEvaluations: 0, // Will be updated when VC analysis is implemented
      gtmStrategies: 0, // Will be updated when GTM analysis is implemented
      insightsGenerated: analysis ? 1 : 0,
      activeProjects: analysisId ? 1 : 0,
      successRate: analysis ? 95 : 0,
    };

    return baseMetrics;
  }, [analysis, analysisId]);

  return (
    <ClientOnly>
      <div className="w-full">
        {/* Main content area */}

        {/* Analysis Redirect Overlay */}
        {isAnalyzing && targetAnalysisView && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
              <AnalysisRedirect
                analysisId={analysisId}
                targetView={targetAnalysisView}
                onNavigate={(view) => {
                  setActiveView(view as ViewKey);
                  setIsAnalyzing(false);
                  setTargetAnalysisView(null);
                }}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6">
          {activeView === "dashboard" && (
            <MainDashboard
              metrics={dashboardMetrics}
              onNavigate={(view) => {
                if (view === "insights" || view === "vc-lens" || view === "gtm-lab") {
                  handleAnalysisNavigation(view);
                } else {
                  setActiveView(view as ViewKey);
                }
              }}
              onUpload={() => setActiveView("insights")}
            />
          )}

          {activeView === "insights" && (
            <ViewContainer
              icon={LuSearch}
              title="Research Insights"
              subtitle="Deep analysis of your research content"
            >
              <InsightsIntegrated
                analysisId={analysisId}
                isUploading={isSubmitting}
              />
            </ViewContainer>
          )}

          {activeView === "patents" && (
            <ViewContainer
              icon={LuSearch}
              title="Patent Radar"
              subtitle="Discover related patents and IP landscape"
            >
              <PatentTable
                title="Patent Radar"
                hits={analysis?.related_patents || []}
              />
            </ViewContainer>
          )}

          {activeView === "stakeholders" && (
            <ViewContainer
              icon={LuUsers}
              title="Stakeholder Network"
              subtitle="Key inventors, assignees, and institutions"
            >
              <StakeholderPanel
                inventors={analysis?.stakeholders?.inventors || []}
                assignees={analysis?.stakeholders?.assignees || []}
                institutions={analysis?.stakeholders?.institutions || []}
              />
            </ViewContainer>
          )}

          {activeView === "licensing" && (
            <ViewContainer
              icon={LuHandshake}
              title="Licensing Opportunities"
              subtitle="Commercialization and licensing prospects"
            >
              <LicensingList opportunities={[]} />
            </ViewContainer>
          )}

          {(activeView === "agent" || activeView === "assistant") && (
            <ViewContainer
              icon={LuBot}
              title="AI Assistant"
              subtitle="Intelligent analysis and research support"
            >
              <AgentConsole
                analysisId={analysisId}
                onSend={handleAgentPrompt}
              />
            </ViewContainer>
          )}

          {activeView === "vc-lens" && (
            <ViewContainer
              icon={LuChartBar}
              title="VC Lens - Startup Evaluation"
              subtitle="Investment analysis and startup evaluation tools"
            >
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-400">
                  VC evaluation dashboard coming soon...
                </p>
              </div>
            </ViewContainer>
          )}

          {activeView === "gtm-lab" && (
            <ViewContainer
              icon={LuChartBar}
              title="GTM Lab - Go-to-Market Strategy"
              subtitle="Strategic planning and market analysis tools"
            >
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-400">
                  Go-to-market strategy tools coming soon...
                </p>
              </div>
            </ViewContainer>
          )}

          {activeView === "research-papers" && (
            <ViewContainer
              icon={LuChartBar}
              title="Research Papers"
              subtitle="Upload and analyze research documents"
            >
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center mb-6">
                <h3 className="text-lg font-medium text-white mb-2">Upload Research Document</h3>
                <p className="text-slate-400 mb-4">Document upload functionality will be available soon.</p>
                <button 
                  disabled 
                  className="px-4 py-2 bg-slate-700 text-slate-400 rounded-lg cursor-not-allowed"
                >
                  Upload Document
                </button>
              </div>
              {analysis && <AnalysisView analysis={analysis} />}
            </ViewContainer>
          )}

          {activeView === "settings" && (
            <ViewContainer
              icon={LuChartBar}
              title="Settings"
              subtitle="Configure your CORE platform preferences"
            >
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-400">Settings panel coming soon...</p>
              </div>
            </ViewContainer>
          )}

          {activeView === "help" && (
            <ViewContainer
              icon={LuChartBar}
              title="Help & Documentation"
              subtitle="Get support and learn how to use CORE"
            >
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-400">
                  Help documentation coming soon...
                </p>
              </div>
            </ViewContainer>
          )}
        </div>
      </div>
    </ClientOnly>
  );
}
