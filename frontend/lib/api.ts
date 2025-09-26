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

// Similarity Search Types
export type SimilaritySearchResult = {
  id: string;
  title: string;
  url: string;
  score: number;
  index: string;
  similarity_percentage: number;
};

export type SimilaritySearchResponse = {
  success: boolean;
  error?: string;
  results: SimilaritySearchResult[];
  total_results: number;
  query_info: {
    title_words: number;
    abstract_words: number;
    indices: string[];
    model: string;
  };
};

export type ExtractAndSearchResponse = {
  success: boolean;
  error?: string;
  extraction_info: {
    original_title: string;
    original_abstract_words: number;
    used_claude_enhancement: boolean;
    final_abstract_words: number;
  };
  similarity_results: SimilaritySearchResult[];
  total_results: number;
  query_info: {
    title_words: number;
    abstract_words: number;
    indices: string[];
    model: string;
  };
};

// Similarity Search API Functions
export async function searchSimilarDocuments(payload: {
  title: string;
  abstract: string;
  amount?: number;
  indices?: string[];
}): Promise<SimilaritySearchResponse> {
  const response = await fetch("http://localhost:8000/similarity-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: payload.title,
      abstract: payload.abstract,
      amount: payload.amount || 25,
      indices: payload.indices || ["patents", "publications"]
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Similarity search failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function extractAndSearchDocuments(payload: {
  title: string;
  abstract: string;
  body?: string;
}): Promise<ExtractAndSearchResponse> {
  const response = await fetch("http://localhost:8000/extract-and-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error(`Extract and search failed: ${response.statusText}`);
  }
  
  return response.json();
}

// Validate text length for BERT token limits (420 words max)
export function validateTextLength(text: string, maxWords: number = 420): {
  text: string;
  wordCount: number;
  wasTruncated: boolean;
  isValid: boolean;
} {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  if (wordCount <= maxWords) {
    return {
      text,
      wordCount,
      wasTruncated: false,
      isValid: true
    };
  }
  
  // Truncate to max words
  const truncatedText = words.slice(0, maxWords).join(' ');
  return {
    text: truncatedText,
    wordCount: maxWords,
    wasTruncated: true,
    isValid: false
  };
}
