export type StakeholderMap = {
  inventors: string[];
  assignees: string[];
  institutions: string[];
};

export type DocumentHit = {
  id: string;
  index: string;
  title: string;
  summary?: string;
  score: number;
  url?: string;
  inventors: string[];
  assignees: string[];
  institutions: string[];
};

export type AnalysisSummary = {
  analysis_id: string;
  title: string;
  abstract: string;
  novelty_score: number;
  related_patents: DocumentHit[];
  related_publications: DocumentHit[];
  stakeholders: StakeholderMap;
  licensing_opportunities: string[];
  retrieval_count: number;
  scores?: Record<string, number>;
  status: string;
};

export async function ingestResearch(payload: {
  title: string;
  abstract: string;
  body?: string;
}): Promise<{ analysis_id: string }> {
  const response = await fetch("http://localhost:8000/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to ingest research");
  }
  return response.json();
}

export async function fetchAnalysis(analysisId: string): Promise<AnalysisSummary> {
  const response = await fetch(`http://localhost:8000/analysis/${analysisId}`);
  if (!response.ok) {
    throw new Error("Analysis not ready");
  }
  return response.json();
}

export async function sendAgentPrompt(analysisId: string, message: string): Promise<string> {
  const response = await fetch(`http://localhost:8000/agent/${analysisId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    throw new Error("Agent request failed");
  }
  const data = await response.json();
  return data.agent_response;
}

export async function requestNarration(analysisId: string): Promise<void> {
  const response = await fetch(`http://localhost:8000/analysis/${analysisId}/narrate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Narration request failed");
  }
}
