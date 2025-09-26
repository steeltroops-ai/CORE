import * as cheerio from 'cheerio';
import axios from 'axios';

// Dynamic import for PDF.js to avoid SSR issues
let pdfjsLib: any = null;

// Initialize PDF.js only in browser environment
const initPdfJs = async () => {
  if (typeof window !== 'undefined' && !pdfjsLib) {
    try {
      pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    } catch (error) {
      console.error('Failed to load PDF.js:', error);
      throw new Error('PDF processing is not available in this environment');
    }
  }
  return pdfjsLib;
};

export interface ExtractedContent {
  title: string;
  abstract: string;
  body: string;
  authors?: string[];
  doi?: string;
  url?: string;
  extractionMethod: 'pdf' | 'url' | 'manual';
  confidence: 'high' | 'medium' | 'low';
}

export interface ExtractionProgress {
  stage: 'loading' | 'parsing' | 'extracting' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
}

/**
 * Extract text content from PDF file
 */
export async function extractPdfContent(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<ExtractedContent> {
  try {
    onProgress?.({
      stage: 'loading',
      progress: 10,
      message: 'Loading PDF file...'
    });

    // Try to use PDF.js for extraction, fallback to manual input if not available
    try {
      // Initialize PDF.js
      const pdfLib = await initPdfJs();
      if (!pdfLib) {
        throw new Error('PDF.js is not available');
      }

      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      onProgress?.({
        stage: 'parsing',
        progress: 30,
        message: 'Parsing PDF structure...'
      });

      // Load PDF document
      const pdf = await pdfLib.getDocument({ data: arrayBuffer }).promise;
      
      onProgress?.({
        stage: 'extracting',
        progress: 50,
        message: 'Extracting text content...'
      });

      let fullText = '';
      const numPages = pdf.numPages;
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
        
        // Update progress
        const progress = 50 + (pageNum / numPages) * 30;
        onProgress?.({
          stage: 'extracting',
          progress,
          message: `Extracting page ${pageNum} of ${numPages}...`
        });
      }

      onProgress?.({
        stage: 'processing',
        progress: 85,
        message: 'Processing extracted content...'
      });

      // Parse the extracted text to identify title, abstract, and body
      const parsedContent = parsePdfText(fullText, file.name);
      
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'PDF extraction completed successfully'
      });

      return {
        ...parsedContent,
        extractionMethod: 'pdf',
        confidence: parsedContent.abstract ? 'high' : 'medium'
      };

    } catch (pdfError) {
      // Fallback to basic file info extraction
      onProgress?.({
        stage: 'processing',
        progress: 80,
        message: 'PDF text extraction not available, using file metadata...'
      });

      const fallbackContent = createFallbackPdfContent(file);
      
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'PDF file processed - manual content entry required'
      });

      return {
        ...fallbackContent,
        extractionMethod: 'pdf',
        confidence: 'low'
      };
    }

  } catch (error) {
    onProgress?.({
      stage: 'error',
      progress: 0,
      message: `PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
    
    throw new Error(`Failed to process PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create fallback content when PDF text extraction is not available
 */
function createFallbackPdfContent(file: File): Omit<ExtractedContent, 'extractionMethod' | 'confidence'> {
  const fileName = file.name.replace('.pdf', '').replace(/[_-]/g, ' ');
  
  return {
    title: fileName,
    abstract: 'Please manually enter the abstract for this PDF document. Automatic text extraction is not available in this environment.',
    body: `PDF file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)\n\nPlease review and edit the title and abstract before analysis.`,
  };
}

/**
 * Parse extracted PDF text to identify sections
 */
function parsePdfText(text: string, filename: string): Omit<ExtractedContent, 'extractionMethod' | 'confidence'> {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let title = '';
  let abstract = '';
  let body = '';
  let authors: string[] = [];
  
  // Try to extract title (usually the first significant line)
  if (lines.length > 0) {
    title = lines[0];
    
    // If title seems too short or generic, try the next few lines
    if (title.length < 10) {
      for (let i = 1; i < Math.min(5, lines.length); i++) {
        if (lines[i].length > title.length && lines[i].length > 10) {
          title = lines[i];
          break;
        }
      }
    }
  }
  
  // Fallback to filename if no good title found
  if (!title || title.length < 5) {
    title = filename.replace('.pdf', '').replace(/[_-]/g, ' ');
  }
  
  // Look for abstract section
  const abstractKeywords = ['abstract', 'summary', 'overview'];
  let abstractStartIndex = -1;
  let abstractEndIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (abstractKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
      abstractStartIndex = i + 1;
      break;
    }
  }
  
  if (abstractStartIndex > -1) {
    // Find end of abstract (usually before "Introduction", "1.", or similar)
    const endKeywords = ['introduction', '1.', 'keywords', 'key words', 'background'];
    
    for (let i = abstractStartIndex; i < Math.min(abstractStartIndex + 20, lines.length); i++) {
      const line = lines[i].toLowerCase();
      
      if (endKeywords.some(keyword => line.startsWith(keyword)) || 
          (line.match(/^\d+\./) && line.length < 100)) {
        abstractEndIndex = i;
        break;
      }
    }
    
    if (abstractEndIndex === -1) {
      abstractEndIndex = Math.min(abstractStartIndex + 10, lines.length);
    }
    
    abstract = lines.slice(abstractStartIndex, abstractEndIndex).join(' ');
  }
  
  // If no abstract found, use first few paragraphs as abstract
  if (!abstract && lines.length > 5) {
    const firstParagraphs = lines.slice(1, Math.min(6, lines.length));
    abstract = firstParagraphs.join(' ');
    
    // Limit abstract length
    if (abstract.length > 500) {
      abstract = abstract.substring(0, 500) + '...';
    }
  }
  
  // Body is the remaining text
  body = text;
  
  // Try to extract authors (look for common patterns)
  const authorPatterns = [
    /authors?:\s*([^\n]+)/i,
    /by\s+([^\n]+)/i,
    /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:,\s*[A-Z][a-z]+\s+[A-Z][a-z]+)*)/m
  ];
  
  for (const pattern of authorPatterns) {
    const match = text.match(pattern);
    if (match) {
      authors = match[1].split(',').map(author => author.trim());
      break;
    }
  }
  
  return {
    title: title.trim(),
    abstract: abstract.trim(),
    body: body.trim(),
    authors: authors.length > 0 ? authors : undefined
  };
}

/**
 * Extract content from URL
 */
export async function extractUrlContent(
  url: string,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<ExtractedContent> {
  try {
    onProgress?.({
      stage: 'loading',
      progress: 20,
      message: 'Fetching URL content...'
    });

    // Fetch the webpage
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    onProgress?.({
      stage: 'parsing',
      progress: 50,
      message: 'Parsing webpage content...'
    });

    const $ = cheerio.load(response.data);
    
    onProgress?.({
      stage: 'extracting',
      progress: 70,
      message: 'Extracting structured content...'
    });

    // Extract content based on URL type
    let extractedContent: Omit<ExtractedContent, 'extractionMethod' | 'confidence'>;
    
    if (url.includes('arxiv.org')) {
      extractedContent = extractArxivContent($, url);
    } else if (url.includes('pubmed.ncbi.nlm.nih.gov') || url.includes('ncbi.nlm.nih.gov')) {
      extractedContent = extractPubMedContent($, url);
    } else if (url.includes('doi.org') || url.includes('dx.doi.org')) {
      extractedContent = extractDoiContent($, url);
    } else {
      extractedContent = extractGenericContent($, url);
    }

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'URL content extraction completed'
    });

    return {
      ...extractedContent,
      url,
      extractionMethod: 'url',
      confidence: extractedContent.abstract ? 'high' : 'medium'
    };

  } catch (error) {
    onProgress?.({
      stage: 'error',
      progress: 0,
      message: `URL extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
    
    throw new Error(`Failed to extract URL content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract content from arXiv papers
 */
function extractArxivContent($: cheerio.CheerioAPI, url: string): Omit<ExtractedContent, 'extractionMethod' | 'confidence'> {
  const title = $('h1.title').text().replace('Title:', '').trim() || 
                $('meta[name="citation_title"]').attr('content') || 
                $('title').text().trim();
  
  const abstract = $('blockquote.abstract').text().replace('Abstract:', '').trim() || 
                   $('meta[name="description"]').attr('content') || '';
  
  const authors = $('div.authors a').map((_, el) => $(el).text().trim()).get() ||
                  $('meta[name="citation_author"]').map((_, el) => $(el).attr('content')).get() || [];
  
  const body = $('body').text().trim();
  
  return {
    title,
    abstract,
    body,
    authors: authors.length > 0 ? authors : undefined,
    url
  };
}

/**
 * Extract content from PubMed articles
 */
function extractPubMedContent($: cheerio.CheerioAPI, url: string): Omit<ExtractedContent, 'extractionMethod' | 'confidence'> {
  const title = $('h1.heading-title').text().trim() || 
                $('meta[name="citation_title"]').attr('content') || 
                $('title').text().trim();
  
  const abstract = $('#eng-abstract p').text().trim() || 
                   $('div.abstract-content p').text().trim() || 
                   $('meta[name="description"]').attr('content') || '';
  
  const authors = $('div.authors-list a').map((_, el) => $(el).text().trim()).get() ||
                  $('meta[name="citation_author"]').map((_, el) => $(el).attr('content')).get() || [];
  
  const doi = $('meta[name="citation_doi"]').attr('content') || 
              $('a[href*="doi.org"]').attr('href')?.replace('https://doi.org/', '') || undefined;
  
  const body = $('body').text().trim();
  
  return {
    title,
    abstract,
    body,
    authors: authors.length > 0 ? authors : undefined,
    doi,
    url
  };
}

/**
 * Extract content from DOI links
 */
function extractDoiContent($: cheerio.CheerioAPI, url: string): Omit<ExtractedContent, 'extractionMethod' | 'confidence'> {
  const title = $('h1').first().text().trim() || 
                $('meta[name="citation_title"]').attr('content') || 
                $('meta[property="og:title"]').attr('content') || 
                $('title').text().trim();
  
  const abstract = $('div.abstract p').text().trim() || 
                   $('section.abstract p').text().trim() || 
                   $('meta[name="description"]').attr('content') || 
                   $('meta[property="og:description"]').attr('content') || '';
  
  const authors = $('meta[name="citation_author"]').map((_, el) => $(el).attr('content')).get() || 
                  $('span.author').map((_, el) => $(el).text().trim()).get() || [];
  
  const doi = url.includes('doi.org') ? url.split('doi.org/')[1] : undefined;
  
  const body = $('body').text().trim();
  
  return {
    title,
    abstract,
    body,
    authors: authors.length > 0 ? authors : undefined,
    doi,
    url
  };
}

/**
 * Extract content from generic academic websites
 */
function extractGenericContent($: cheerio.CheerioAPI, url: string): Omit<ExtractedContent, 'extractionMethod' | 'confidence'> {
  // Try multiple selectors for title
  const title = $('h1').first().text().trim() || 
                $('meta[name="citation_title"]').attr('content') || 
                $('meta[property="og:title"]').attr('content') || 
                $('title').text().trim() || 
                'Untitled Document';
  
  // Try multiple selectors for abstract/description
  const abstract = $('div.abstract').text().trim() || 
                   $('section.abstract').text().trim() || 
                   $('div.summary').text().trim() || 
                   $('meta[name="description"]').attr('content') || 
                   $('meta[property="og:description"]').attr('content') || 
                   '';
  
  // Try to find authors
  const authors = $('meta[name="citation_author"]').map((_, el) => $(el).attr('content')).get() || 
                  $('span.author, .author-name, .authors').map((_, el) => $(el).text().trim()).get() || [];
  
  // Get main content
  const body = $('main').text().trim() || 
               $('article').text().trim() || 
               $('div.content').text().trim() || 
               $('body').text().trim();
  
  return {
    title,
    abstract,
    body,
    authors: authors.length > 0 ? authors : undefined,
    url
  };
}

/**
 * Validate extracted content quality
 */
export function validateExtractedContent(content: ExtractedContent): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  if (!content.title || content.title.length < 5) {
    issues.push('Title is too short or missing');
    suggestions.push('Please provide a descriptive title for the document');
  }
  
  if (!content.abstract || content.abstract.length < 50) {
    issues.push('Abstract is too short or missing');
    suggestions.push('Please provide a comprehensive abstract (at least 50 characters)');
  }
  
  if (content.title && content.title.length > 200) {
    issues.push('Title is too long');
    suggestions.push('Consider shortening the title to under 200 characters');
  }
  
  if (content.abstract && content.abstract.length > 2000) {
    issues.push('Abstract is too long');
    suggestions.push('Consider shortening the abstract to under 2000 characters');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Clean and normalize extracted text
 */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .replace(/[^\w\s.,;:!?()\[\]{}"'-]/g, '') // Remove special characters
    .trim();
}

export default {
  extractPdfContent,
  extractUrlContent,
  validateExtractedContent,
  cleanExtractedText
};