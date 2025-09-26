import axios from 'axios';

// Enhanced extraction API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types for enhanced extraction
export interface EnhancedExtractionRequest {
  content: string;
  document_type?: string;
  use_claude_extraction?: boolean;
  search_indices?: string[];
  max_results?: number;
}

export interface ExtractedResearchData {
  title: string;
  abstract: string;
  key_technologies: string[];
  research_domain: string;
  methodology: string[];
  findings: string[];
  applications: string[];
  technical_keywords: string[];
  innovation_aspects: string[];
  commercial_potential: {
    market_size?: string;
    competitive_advantage?: string;
    barriers?: string;
  };
  technology_classification: string;
  innovation_level: string;
  commercial_readiness: string;
  patent_keywords: string[];
  market_applications: string[];
  technical_specifications: Record<string, any>;
  confidence_score: number;
  extraction_quality: 'high' | 'medium' | 'low';
  extraction_logs: string[];
}

export interface EnhancedSimilarityResult {
  id: string;
  score: number;
  index: string;
  title: string;
  url: string;
  summary?: string;
  relevance_factors: Record<string, number>;
  extraction_confidence: number;
  match_type: 'title' | 'abstract' | 'technical' | 'keyword';
}

export interface SearchOptimizationMetrics {
  total_search_terms: number;
  weighted_terms_used: number;
  confidence_boost_applied: number;
  search_strategy: string;
  processing_time: number;
}

export interface ValidationResults {
  extraction_validation: {
    is_valid: boolean;
    issues: string[];
    recommendations: string[];
    completeness_score: number;
  };
  search_validation: {
    total_results: number;
    high_confidence_results: number;
    technology_matches: number;
    domain_matches: number;
    average_score: number;
    match_type_distribution: Record<string, number>;
    quality_assessment: 'high' | 'medium' | 'low' | 'no_results';
  };
}

export interface EnhancedExtractionResponse {
  analysis_id: string;
  status: string;
  extracted_data: ExtractedResearchData;
  similarity_results: EnhancedSimilarityResult[];
  optimization_metrics: SearchOptimizationMetrics;
  validation_results: ValidationResults;
  recommendations: string[];
}

// Create axios instance with retry configuration
const createApiClient = () => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds for Claude processing
  });

  // Add retry interceptor
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config;
      
      // Retry on network errors or 5xx status codes
      if (
        (!error.response || (error.response.status >= 500 && error.response.status <= 599)) &&
        config &&
        !config._retry
      ) {
        config._retry = true;
        config._retryCount = (config._retryCount || 0) + 1;
        
        if (config._retryCount <= 2) {
          // Exponential backoff: 2s, 4s
          const delay = Math.pow(2, config._retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return client(config);
        }
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient();

/**
 * Enhanced document extraction using Claude API integration
 */
export async function enhancedDocumentExtraction(
  request: EnhancedExtractionRequest,
  onProgress?: (progress: { stage: string; progress: number; message: string }) => void
): Promise<EnhancedExtractionResponse> {
  try {
    onProgress?.({
      stage: 'initializing',
      progress: 10,
      message: 'Initializing Claude-powered extraction...'
    });

    // Validate request
    if (!request.content || request.content.trim().length < 10) {
      throw new Error('Document content is too short for meaningful extraction');
    }

    onProgress?.({
      stage: 'extracting',
      progress: 30,
      message: 'Analyzing document with Claude AI...'
    });

    // Call enhanced extraction API
    const response = await apiClient.post<EnhancedExtractionResponse>('/ingest/enhanced', {
      content: request.content,
      document_type: request.document_type || 'research_paper',
      use_claude_extraction: request.use_claude_extraction !== false,
      search_indices: request.search_indices || ['patents', 'publications'],
      max_results: request.max_results || 25
    });

    onProgress?.({
      stage: 'processing',
      progress: 70,
      message: 'Processing similarity search results...'
    });

    const result = response.data;

    // Validate response
    if (!result.analysis_id) {
      throw new Error('Invalid response from extraction service');
    }

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: `Extraction completed with ${result.extracted_data.extraction_quality} quality`
    });

    return result;

  } catch (error) {
    console.error('Enhanced extraction error:', error);
    
    // Provide detailed error information
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 422) {
        throw new Error('Invalid document format or content');
      } else if (error.response?.status === 503) {
        throw new Error('Claude API service temporarily unavailable');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Extraction timeout - document may be too large or complex');
      }
    }
    
    throw new Error(`Enhanced extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract critical search parameters from document content
 */
export async function extractSearchParameters(
  content: string,
  documentType: string = 'research_paper'
): Promise<{
  technical_keywords: string[];
  patent_keywords: string[];
  technology_classification: string;
  innovation_level: string;
  commercial_readiness: string;
  confidence_score: number;
}> {
  try {
    const result = await enhancedDocumentExtraction({
      content,
      document_type: documentType,
      use_claude_extraction: true,
      max_results: 5 // Minimal results for parameter extraction only
    });

    return {
      technical_keywords: result.extracted_data.technical_keywords,
      patent_keywords: result.extracted_data.patent_keywords,
      technology_classification: result.extracted_data.technology_classification,
      innovation_level: result.extracted_data.innovation_level,
      commercial_readiness: result.extracted_data.commercial_readiness,
      confidence_score: result.extracted_data.confidence_score
    };

  } catch (error) {
    console.error('Search parameter extraction error:', error);
    
    // Return fallback parameters
    return {
      technical_keywords: [],
      patent_keywords: [],
      technology_classification: 'Unknown',
      innovation_level: 'unknown',
      commercial_readiness: 'unknown',
      confidence_score: 0.1
    };
  }
}

/**
 * Validate extracted data quality
 */
export function validateExtractionQuality(
  extractedData: ExtractedResearchData
): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  qualityScore: number;
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let qualityScore = 0;

  // Check required fields
  if (!extractedData.title || extractedData.title.length < 5) {
    issues.push('Title is missing or too short');
    recommendations.push('Verify document title extraction');
  } else {
    qualityScore += 20;
  }

  if (!extractedData.abstract || extractedData.abstract.length < 20) {
    issues.push('Abstract is missing or too short');
    recommendations.push('Consider manual abstract entry');
  } else {
    qualityScore += 25;
  }

  // Check technical content
  if (extractedData.key_technologies.length === 0) {
    issues.push('No key technologies identified');
    recommendations.push('Manual technology review recommended');
  } else {
    qualityScore += 15;
  }

  if (extractedData.technical_keywords.length < 3) {
    issues.push('Insufficient technical keywords for optimal search');
    recommendations.push('Consider adding manual keywords');
  } else {
    qualityScore += 15;
  }

  // Check commercial indicators
  if (extractedData.commercial_readiness === 'unknown') {
    issues.push('Commercial readiness not determined');
    recommendations.push('Manual commercial assessment needed');
  } else {
    qualityScore += 10;
  }

  // Check confidence score
  if (extractedData.confidence_score < 0.5) {
    issues.push('Low extraction confidence');
    recommendations.push('Manual review strongly recommended');
  } else if (extractedData.confidence_score >= 0.8) {
    qualityScore += 15;
  } else {
    qualityScore += 10;
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
    qualityScore: Math.min(qualityScore, 100)
  };
}

/**
 * Format extracted data for Logic Mill API consumption
 */
export function formatForLogicMillApi(
  extractedData: ExtractedResearchData
): {
  parts: Array<{ key: string; value: string; weight: number }>;
  searchStrategy: string;
} {
  const parts: Array<{ key: string; value: string; weight: number }> = [];

  // High priority parts
  if (extractedData.title) {
    parts.push({
      key: 'title',
      value: extractedData.title,
      weight: 1.0
    });
  }

  if (extractedData.abstract) {
    parts.push({
      key: 'abstract',
      value: extractedData.abstract,
      weight: 0.9
    });
  }

  // Technical keywords (high weight for search precision)
  if (extractedData.technical_keywords.length > 0) {
    parts.push({
      key: 'technical_keywords',
      value: extractedData.technical_keywords.join(' '),
      weight: 0.8
    });
  }

  // Patent keywords (high weight for patent searches)
  if (extractedData.patent_keywords.length > 0) {
    parts.push({
      key: 'patent_keywords',
      value: extractedData.patent_keywords.join(' '),
      weight: 0.7
    });
  }

  // Technical specifications (medium weight)
  const specsText = Object.entries(extractedData.technical_specifications)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' ');
  
  if (specsText) {
    parts.push({
      key: 'technical_specifications',
      value: specsText,
      weight: 0.6
    });
  }

  // Applications and findings (lower weight)
  if (extractedData.applications.length > 0) {
    parts.push({
      key: 'applications',
      value: extractedData.applications.join(' '),
      weight: 0.4
    });
  }

  // Determine search strategy based on data quality
  let searchStrategy = 'basic';
  if (extractedData.confidence_score >= 0.8 && extractedData.technical_keywords.length >= 5) {
    searchStrategy = 'comprehensive';
  } else if (extractedData.confidence_score >= 0.6 && extractedData.technical_keywords.length >= 3) {
    searchStrategy = 'keyword_focused';
  } else if (extractedData.confidence_score >= 0.4) {
    searchStrategy = 'title_abstract';
  }

  return {
    parts,
    searchStrategy
  };
}

/**
 * Get extraction recommendations based on quality assessment
 */
export function getExtractionRecommendations(
  extractedData: ExtractedResearchData,
  validationResults: ValidationResults
): string[] {
  const recommendations: string[] = [];

  // Extraction quality recommendations
  if (extractedData.extraction_quality === 'low') {
    recommendations.push('Consider manual review and editing of extracted content');
  }

  if (extractedData.confidence_score < 0.6) {
    recommendations.push('Low confidence extraction - verify key technical terms');
  }

  // Search optimization recommendations
  if (validationResults.search_validation.quality_assessment === 'low') {
    recommendations.push('Search results show low relevance - consider refining technical keywords');
  }

  if (validationResults.search_validation.technology_matches === 0) {
    recommendations.push('No technology-specific matches found - verify technology classification');
  }

  // Content completeness recommendations
  if (extractedData.key_technologies.length === 0) {
    recommendations.push('Add key technologies manually for better search precision');
  }

  if (extractedData.patent_keywords.length < 3) {
    recommendations.push('Consider adding more patent-specific keywords');
  }

  // Commercial readiness recommendations
  if (extractedData.commercial_readiness === 'unknown') {
    recommendations.push('Assess commercial readiness level for better market analysis');
  }

  return recommendations;
}

/**
 * Cache management for extraction results
 */
class ExtractionCache {
  private cache = new Map<string, { data: EnhancedExtractionResponse; timestamp: number }>();
  private readonly TTL = 30 * 60 * 1000; // 30 minutes

  set(key: string, data: EnhancedExtractionResponse): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): EnhancedExtractionResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
export const extractionCache = new ExtractionCache();

/**
 * Enhanced extraction with caching
 */
export async function cachedEnhancedExtraction(
  request: EnhancedExtractionRequest,
  onProgress?: (progress: { stage: string; progress: number; message: string }) => void
): Promise<EnhancedExtractionResponse> {
  // Create cache key from content hash
  const cacheKey = btoa(request.content.substring(0, 100)).replace(/[^a-zA-Z0-9]/g, '');
  
  // Check cache first
  const cached = extractionCache.get(cacheKey);
  if (cached) {
    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Using cached extraction results'
    });
    return cached;
  }

  // Perform extraction
  const result = await enhancedDocumentExtraction(request, onProgress);
  
  // Cache the result
  extractionCache.set(cacheKey, result);
  
  return result;
}