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
import { DashboardCards } from "../components/DashboardCards";

import { DocumentUpload } from "../components/DocumentUpload";
import { ChatSidebar } from "../components/ChatSidebar";
import { InsightTabs } from "../components/InsightTabs";
import { InsightsPanel } from "../components/InsightsPanel";
import { LicensingList } from "../components/LicensingList";
import { PatentTable } from "../components/PatentTable";
import { Sidebar } from "../components/Sidebar";
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

  const [audioUrl] = useState<string | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

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

  function handleDocumentUpload(data: {
    title: string;
    abstract: string;
    body?: string;
    file?: File;
    url?: string;
  }) {
    handleIngest({
      title: data.title,
      abstract: data.abstract,
      body: data.body,
    });
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
    if (!analysis) {
      return null;
    }

    return {
      novelty: analysis.novelty_score,

      scores: analysis.scores,

      patentsTracked: analysis.related_patents.length,

      publicationsTracked: analysis.related_publications.length,

      stakeholderCount:
        analysis.stakeholders.inventors.length +
        analysis.stakeholders.assignees.length +
        analysis.stakeholders.institutions.length,
    };
  }, [analysis]);

  return (
    <ClientOnly>
      <div className="flex h-screen bg-slate-950 text-slate-200">
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => setActiveView(view as ViewKey)}
          onSidebarStateChange={setIsSidebarCollapsed}
        />

        {/* Main content area with dynamic margins */}
        <main
          className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "ml-16" : "ml-64"
          } ${isChatOpen ? "mr-96" : "mr-0"}`}
        >
          <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <LuChartBar className="text-slate-950" size={20} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-emerald-300">
                      {activeView === "dashboard" && "Dashboard"}
                      {activeView === "insights" && "Insights"}
                      {activeView === "vc-lens" && "VC Lens"}
                      {activeView === "gtm-lab" && "GTM Lab"}
                      {(activeView === "assistant" || activeView === "agent") &&
                        "Assistant"}
                      {activeView === "research-papers" && "Research Papers"}
                      {activeView === "patents" && "Patent Radar"}
                      {activeView === "stakeholders" && "Stakeholder Network"}
                      {activeView === "licensing" && "Licensing Opportunities"}
                      {activeView === "settings" && "Settings"}
                      {activeView === "help" && "Help"}
                    </h1>
                    <p className="text-sm text-slate-400">
                      Commercialization & Research Evaluator
                    </p>
                  </div>
                </div>
                {analysisId && (
                  <div className="hidden md:flex items-center gap-2 ml-8 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-300 font-medium">
                      Analysis Active
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <StatusStepper activeStep={activeStep} />
                {analysisId && (
                  <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400">
                    <span>ID: {analysisId.slice(0, 8)}...</span>
                    <span>•</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>
          </header>

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
            {activeView === "dashboard" &&
              (analysisId ? (
                <ViewContainer
                  icon={LuChartBar}
                  title="Tech Transfer Dashboard"
                  subtitle="Comprehensive analysis and insights for your research"
                >
                  <AnalysisView analysis={analysis} />
                </ViewContainer>
              ) : (
                <DashboardCards
                  onDocumentUpload={handleDocumentUpload}
                  onNavigate={handleAnalysisNavigation}
                  isUploading={isSubmitting}
                  hasDocument={!!analysisId}
                />
              ))}

            {activeView === "insights" && (
              <ViewContainer
                icon={LuSearch}
                title="Research Insights"
                subtitle="Deep analysis of your research content"
              >
                <InsightsIntegrated analysisId={analysisId} />
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
                <DocumentUpload
                  onUpload={handleDocumentUpload}
                  isUploading={isSubmitting}
                  className="mb-6"
                />
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
                  <p className="text-slate-400">
                    Settings panel coming soon...
                  </p>
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

          <footer className="border-t border-slate-800 bg-slate-900/30 p-4 text-center text-xs text-slate-500">
            CORE Platform v1.0 | Hackathon Demo | Max Planck Logic Mill
            Integration
          </footer>
        </main>

        {/* Chat Sidebar Component */}
        <ChatSidebar
          currentPage={activeView}
          uploadedResearch={analysis ? [analysis.title] : []}
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
        />
      </div>
    </ClientOnly>
  );
}
