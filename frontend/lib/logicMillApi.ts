import axios from 'axios';

// Logic Mill API Configuration
const LOGIC_MILL_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJBUEkiLCJleHAiOjI2Mjk3MjQxMzksImlhdCI6MTc1ODgxMjEzOSwiaXNzIjoiTE9HSUMtTUlMTCIsImp0aSI6IjI0MDdlODI1LWIwNzMtNDNjNC1hYzliLTdiMTJjNWMwMTFlNiIsIm5iZiI6MTc1ODgxMjEzOSwicGF5bG9hZCI6eyJ0b2tlbk5hbWUiOiJEZWZhdWx0IEFQSSBUb2tlbiJ9LCJzdWIiOiI1OGMzOTBmYS00NGJhLTQ0NTYtOTY2Ny05ZjE1ZDgyYjc0M2MifQ.BEf4C6r3vb0Hj-qjzxOVKPEmt3mDm8_k5QY91p-aRtE";
const LOGIC_MILL_URL = 'https://api.logic-mill.net/api/v1/graphql/';

// Types for Logic Mill API
export interface DocumentPart {
  key: string;
  value: string;
}

export interface EncodeObject {
  id: string;
  parts: DocumentPart[];
}

export interface SimilaritySearchResult {
  id: string;
  score: number;
  index: string;
  document: {
    title: string;
    url: string;
    PatspecterEmbedding: number[];
  };
}

export interface LogicMillResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

// Create axios instance with retry configuration
const createLogicMillClient = () => {
  const client = axios.create({
    baseURL: LOGIC_MILL_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LOGIC_MILL_TOKEN}`,
    },
    timeout: 30000, // 30 seconds timeout
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
        
        if (config._retryCount <= 3) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, config._retryCount - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return client(config);
        }
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

const logicMillClient = createLogicMillClient();

/**
 * Encode a single document using Logic Mill API
 */
export async function encodeDocument(
  documentData: EncodeObject,
  model: string = 'patspecter'
): Promise<number[]> {
  const query = `
    query encodeDocument($data: EncodeObject, $model: String!) {
      encodeDocument(data: $data, model: $model)
    }
  `;

  const variables = {
    model,
    data: documentData,
  };

  try {
    const response = await logicMillClient.post<LogicMillResponse<{ encodeDocument: number[] }>>('', {
      query,
      variables,
    });

    if (response.data.errors) {
      throw new Error(`Logic Mill API Error: ${response.data.errors.map(e => e.message).join(', ')}`);
    }

    return response.data.data.encodeDocument;
  } catch (error) {
    console.error('Error encoding document:', error);
    throw new Error(`Failed to encode document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encode multiple documents using Logic Mill API
 */
export async function encodeMultipleDocuments(
  documentsData: EncodeObject[],
  model: string = 'patspecter'
): Promise<number[][]> {
  const query = `
    query encodeDocuments($data: [EncodeObject], $model: String!) {
      encodeDocuments(data: $data, model: $model)
    }
  `;

  const variables = {
    model,
    data: documentsData,
  };

  try {
    const response = await logicMillClient.post<LogicMillResponse<{ encodeDocuments: number[][] }>>('', {
      query,
      variables,
    });

    if (response.data.errors) {
      throw new Error(`Logic Mill API Error: ${response.data.errors.map(e => e.message).join(', ')}`);
    }

    return response.data.data.encodeDocuments;
  } catch (error) {
    console.error('Error encoding multiple documents:', error);
    throw new Error(`Failed to encode documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Perform similarity search with document encoding
 */
export async function encodeDocumentAndSimilaritySearch(
  documentParts: DocumentPart[],
  indices: string[] = ['patents', 'publications'],
  amount: number = 25,
  model: string = 'patspecter'
): Promise<SimilaritySearchResult[]> {
  const query = `
    query embedDocumentAndSimilaritySearch($data: [EncodeDocumentPart], $indices: [String], $amount: Int, $model: String!) {
      encodeDocumentAndSimilaritySearch(
        data: $data
        indices: $indices
        amount: $amount
        model: $model
      ) {
        id
        score
        index
        document {
          title
          url
          PatspecterEmbedding
        }
      }
    }
  `;

  const variables = {
    model,
    data: documentParts,
    amount,
    indices,
  };

  try {
    const response = await logicMillClient.post<LogicMillResponse<{ encodeDocumentAndSimilaritySearch: SimilaritySearchResult[] }>>('', {
      query,
      variables,
    });

    if (response.data.errors) {
      throw new Error(`Logic Mill API Error: ${response.data.errors.map(e => e.message).join(', ')}`);
    }

    return response.data.data.encodeDocumentAndSimilaritySearch;
  } catch (error) {
    console.error('Error performing similarity search:', error);
    throw new Error(`Failed to perform similarity search: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate similarity between documents
 */
export async function calculateDocumentSimilarity(
  documentsData: EncodeObject[],
  similarityMetric: 'cosine' | 'euclidean' = 'cosine',
  model: string = 'patspecter'
): Promise<{
  similarities: number[];
  xs: { id: string }[];
  ys: { id: string }[];
}> {
  const query = `
    query encodeDocumentAndSimilarityCalculation($data: [EncodeObject], $similarityMetric: similarityMetric, $model: String!) {
      encodeDocumentAndSimilarityCalculation(
        data: $data
        similarityMetric: $similarityMetric
        model: $model
      ) {
        similarities
        xs {
          id
        }
        ys {
          id
        }
      }
    }
  `;

  const variables = {
    model,
    similarityMetric,
    data: documentsData,
  };

  try {
    const response = await logicMillClient.post<LogicMillResponse<{ encodeDocumentAndSimilarityCalculation: any }>>('', {
      query,
      variables,
    });

    if (response.data.errors) {
      throw new Error(`Logic Mill API Error: ${response.data.errors.map(e => e.message).join(', ')}`);
    }

    return response.data.data.encodeDocumentAndSimilarityCalculation;
  } catch (error) {
    console.error('Error calculating document similarity:', error);
    throw new Error(`Failed to calculate similarity: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieve documents by IDs from Logic Mill database
 */
export async function retrieveDocumentsByIds(
  documentIds: Array<{ index: string; id: string }>
): Promise<Array<{
  id: string;
  url: string;
  PatspecterEmbedding: number[];
}>> {
  const query = `
    query Documents($data: [DatabaseSearchDocument]) {
      Documents(data: $data) {
        id
        url
        PatspecterEmbedding
      }
    }
  `;

  const variables = {
    data: documentIds,
  };

  try {
    const response = await logicMillClient.post<LogicMillResponse<{ Documents: any[] }>>('', {
      query,
      variables,
    });

    if (response.data.errors) {
      throw new Error(`Logic Mill API Error: ${response.data.errors.map(e => e.message).join(', ')}`);
    }

    return response.data.data.Documents;
  } catch (error) {
    console.error('Error retrieving documents:', error);
    throw new Error(`Failed to retrieve documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Format document for Logic Mill API submission
 */
export function formatDocumentForLogicMill(
  title: string,
  abstract: string,
  body?: string,
  documentId?: string
): EncodeObject {
  const parts: DocumentPart[] = [
    { key: 'title', value: title },
    { key: 'abstract', value: abstract },
  ];

  if (body && body.trim()) {
    parts.push({ key: 'body', value: body });
  }

  return {
    id: documentId || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    parts,
  };
}

/**
 * Format multiple documents for batch processing
 */
export function formatMultipleDocumentsForLogicMill(
  documents: Array<{
    title: string;
    abstract: string;
    body?: string;
    id?: string;
  }>
): EncodeObject[] {
  return documents.map(doc => 
    formatDocumentForLogicMill(doc.title, doc.abstract, doc.body, doc.id)
  );
}

/**
 * Validate document data before API submission
 */
export function validateDocumentData(title: string, abstract: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!abstract || abstract.trim().length === 0) {
    errors.push('Abstract is required');
  }

  if (title && title.length > 500) {
    errors.push('Title must be less than 500 characters');
  }

  if (abstract && abstract.length > 5000) {
    errors.push('Abstract must be less than 5000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

const logicMillApi = {
  encodeDocument,
  encodeMultipleDocuments,
  encodeDocumentAndSimilaritySearch,
  calculateDocumentSimilarity,
  retrieveDocumentsByIds,
  formatDocumentForLogicMill,
  formatMultipleDocumentsForLogicMill,
  validateDocumentData,
};

export default logicMillApi;