import asyncio
import logging
import json
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from anthropic import Anthropic
from app.core.config import get_settings

logger = logging.getLogger(__name__)

@dataclass
class ExtractedResearchData:
    """Structured research data extracted by Claude"""
    title: str
    abstract: str
    key_technologies: List[str]
    research_domain: str
    methodology: List[str]
    findings: List[str]
    applications: List[str]
    technical_keywords: List[str]
    innovation_aspects: List[str]
    commercial_potential: Dict[str, Any]
    technology_classification: str
    innovation_level: str
    commercial_readiness: str
    patent_keywords: List[str]
    market_applications: List[str]
    technical_specifications: Dict[str, Any]
    confidence_score: float
    extraction_quality: str
    extraction_logs: List[str]

@dataclass
class DocumentParts:
    """Weighted document parts for Logic Mill API"""
    title: Tuple[str, float]  # (content, weight)
    abstract: Tuple[str, float]
    body: Tuple[str, float]
    keywords: Tuple[str, float]
    technical_specs: Tuple[str, float]

class ClaudeExtractionService:
    """Service for Claude-powered document analysis and parameter extraction"""
    
    def __init__(self):
        self.settings = get_settings()
        self.client = None
        self._initialize_client()
        self.extraction_cache = {}  # Simple in-memory cache
    
    def _initialize_client(self):
        """Initialize the Anthropic client"""
        try:
            if not self.settings.claude_api_key:
                logger.warning("Claude API key not configured for extraction service")
                return
            
            self.client = Anthropic(
                api_key=self.settings.claude_api_key
            )
            logger.info("Claude extraction service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Claude extraction service: {e}")
            self.client = None
    
    async def extract_research_parameters(
        self, 
        content: str, 
        document_type: str = "research_paper",
        use_cache: bool = True
    ) -> ExtractedResearchData:
        """Extract critical research parameters from document content using Claude"""
        
        # Check cache first
        cache_key = f"{hash(content)}_{document_type}"
        if use_cache and cache_key in self.extraction_cache:
            logger.info("Using cached extraction results")
            return self.extraction_cache[cache_key]
        
        if not self.client:
            logger.warning("Claude client not available, using fallback extraction")
            return self._fallback_extraction(content)
        
        try:
            extraction_logs = ["Starting Claude-powered extraction"]
            
            # Extract basic research data
            basic_data = await self._extract_basic_research_data(content)
            extraction_logs.append("Basic research data extracted")
            
            # Extract technical parameters
            technical_data = await self._extract_technical_parameters(content)
            extraction_logs.append("Technical parameters extracted")
            
            # Extract commercial indicators
            commercial_data = await self._extract_commercial_indicators(content)
            extraction_logs.append("Commercial indicators extracted")
            
            # Extract search-optimized keywords
            search_keywords = await self._extract_search_keywords(content)
            extraction_logs.append("Search keywords extracted")
            
            # Calculate confidence score
            confidence_score = self._calculate_confidence_score(
                basic_data, technical_data, commercial_data
            )
            
            # Determine extraction quality
            quality = self._determine_extraction_quality(confidence_score)
            
            # Combine all extracted data
            extracted_data = ExtractedResearchData(
                title=basic_data.get('title', ''),
                abstract=basic_data.get('abstract', ''),
                key_technologies=technical_data.get('key_technologies', []),
                research_domain=basic_data.get('research_domain', ''),
                methodology=basic_data.get('methodology', []),
                findings=basic_data.get('findings', []),
                applications=commercial_data.get('applications', []),
                technical_keywords=search_keywords.get('technical_keywords', []),
                innovation_aspects=technical_data.get('innovation_aspects', []),
                commercial_potential=commercial_data.get('commercial_potential', {}),
                technology_classification=technical_data.get('classification', ''),
                innovation_level=technical_data.get('innovation_level', ''),
                commercial_readiness=commercial_data.get('readiness_level', ''),
                patent_keywords=search_keywords.get('patent_keywords', []),
                market_applications=commercial_data.get('market_applications', []),
                technical_specifications=technical_data.get('specifications', {}),
                confidence_score=confidence_score,
                extraction_quality=quality,
                extraction_logs=extraction_logs
            )
            
            # Cache the results
            if use_cache:
                self.extraction_cache[cache_key] = extracted_data
            
            logger.info(f"Successfully extracted research parameters with {quality} quality")
            return extracted_data
            
        except Exception as e:
            logger.error(f"Error in Claude extraction: {e}")
            return self._fallback_extraction(content)
    
    async def _extract_basic_research_data(self, content: str) -> Dict[str, Any]:
        """Extract basic research information using Claude"""
        
        prompt = f"""
Analyze the following research document and extract the basic research information in JSON format:

Document Content:
{content[:4000]}  # Limit content to avoid token limits

Please extract and return a JSON object with the following fields:
- title: The main title of the research
- abstract: A concise abstract or summary
- research_domain: The primary research field (e.g., "Artificial Intelligence", "Biotechnology", "Materials Science")
- methodology: List of research methods used
- findings: Key research findings or results

Return only valid JSON without any additional text.
"""
        
        try:
            response = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=1500,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = response.content[0].text.strip()
            # Clean up response to ensure valid JSON
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]
            
            return json.loads(response_text)
            
        except Exception as e:
            logger.error(f"Error extracting basic research data: {e}")
            return self._fallback_basic_data(content)
    
    async def _extract_technical_parameters(self, content: str) -> Dict[str, Any]:
        """Extract technical parameters and innovation indicators"""
        
        prompt = f"""
Analyze the following research document and extract technical parameters in JSON format:

Document Content:
{content[:4000]}

Please extract and return a JSON object with the following fields:
- key_technologies: List of main technologies mentioned
- classification: Technology category (AI/ML, Biotech, Materials, Energy, etc.)
- innovation_level: "breakthrough", "significant", "incremental", or "unknown"
- innovation_aspects: List of novel or innovative elements
- specifications: Object with technical specifications and performance metrics

Return only valid JSON without any additional text.
"""
        
        try:
            response = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=1500,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = response.content[0].text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]
            
            return json.loads(response_text)
            
        except Exception as e:
            logger.error(f"Error extracting technical parameters: {e}")
            return self._fallback_technical_data()
    
    async def _extract_commercial_indicators(self, content: str) -> Dict[str, Any]:
        """Extract commercial potential and market readiness indicators"""
        
        prompt = f"""
Analyze the following research document for commercial potential in JSON format:

Document Content:
{content[:4000]}

Please extract and return a JSON object with the following fields:
- applications: List of potential commercial applications
- market_applications: List of specific market sectors or use cases
- readiness_level: "research", "prototype", "pilot", "commercial", or "unknown"
- commercial_potential: Object with market_size, competitive_advantage, barriers fields

Return only valid JSON without any additional text.
"""
        
        try:
            response = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=1500,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = response.content[0].text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]
            
            return json.loads(response_text)
            
        except Exception as e:
            logger.error(f"Error extracting commercial indicators: {e}")
            return self._fallback_commercial_data()
    
    async def _extract_search_keywords(self, content: str) -> Dict[str, Any]:
        """Extract optimized keywords for similarity search"""
        
        prompt = f"""
Analyze the following research document and extract search-optimized keywords in JSON format:

Document Content:
{content[:4000]}

Please extract and return a JSON object with the following fields:
- technical_keywords: List of 10-15 most important technical terms for similarity search
- patent_keywords: List of 8-12 keywords that would be useful for patent landscape searches

Focus on specific, technical terms that would help find similar research or patents.
Return only valid JSON without any additional text.
"""
        
        try:
            response = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = response.content[0].text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]
            
            return json.loads(response_text)
            
        except Exception as e:
            logger.error(f"Error extracting search keywords: {e}")
            return {'technical_keywords': [], 'patent_keywords': []}
    
    def create_weighted_document_parts(self, extracted_data: ExtractedResearchData) -> DocumentParts:
        """Create weighted document parts optimized for Logic Mill API"""
        
        # High weight for title and abstract (most important for similarity)
        title_weight = 1.0
        abstract_weight = 0.9
        
        # Medium weight for technical content
        keywords_weight = 0.7
        specs_weight = 0.6
        
        # Lower weight for body content
        body_weight = 0.4
        
        # Combine technical keywords for search optimization
        combined_keywords = ' '.join([
            *extracted_data.technical_keywords,
            *extracted_data.patent_keywords,
            *extracted_data.key_technologies
        ])
        
        # Combine technical specifications
        specs_text = ' '.join([
            f"{k}: {v}" for k, v in extracted_data.technical_specifications.items()
        ])
        
        # Create body content from findings and applications
        body_content = ' '.join([
            *extracted_data.findings,
            *extracted_data.applications,
            *extracted_data.methodology
        ])
        
        return DocumentParts(
            title=(extracted_data.title, title_weight),
            abstract=(extracted_data.abstract, abstract_weight),
            body=(body_content, body_weight),
            keywords=(combined_keywords, keywords_weight),
            technical_specs=(specs_text, specs_weight)
        )
    
    def _calculate_confidence_score(
        self, 
        basic_data: Dict[str, Any], 
        technical_data: Dict[str, Any], 
        commercial_data: Dict[str, Any]
    ) -> float:
        """Calculate confidence score based on extraction completeness"""
        
        score = 0.0
        max_score = 10.0
        
        # Basic data completeness (40% of score)
        if basic_data.get('title'): score += 1.0
        if basic_data.get('abstract'): score += 1.5
        if basic_data.get('research_domain'): score += 1.0
        if basic_data.get('methodology'): score += 0.5
        
        # Technical data completeness (40% of score)
        if technical_data.get('key_technologies'): score += 1.0
        if technical_data.get('classification'): score += 1.0
        if technical_data.get('innovation_level'): score += 1.0
        if technical_data.get('specifications'): score += 1.0
        
        # Commercial data completeness (20% of score)
        if commercial_data.get('applications'): score += 1.0
        if commercial_data.get('readiness_level'): score += 1.0
        
        return min(score / max_score, 1.0)
    
    def _determine_extraction_quality(self, confidence_score: float) -> str:
        """Determine extraction quality based on confidence score"""
        if confidence_score >= 0.8:
            return "high"
        elif confidence_score >= 0.6:
            return "medium"
        else:
            return "low"
    
    def _fallback_extraction(self, content: str) -> ExtractedResearchData:
        """Fallback extraction when Claude is not available"""
        logger.warning("Using fallback extraction method")
        
        # Simple text analysis fallback
        lines = content.split('\n')
        title = lines[0] if lines else "Untitled Document"
        
        return ExtractedResearchData(
            title=title,
            abstract="Manual review required - Claude extraction unavailable",
            key_technologies=[],
            research_domain="Unknown",
            methodology=[],
            findings=[],
            applications=[],
            technical_keywords=[],
            innovation_aspects=[],
            commercial_potential={},
            technology_classification="Unknown",
            innovation_level="unknown",
            commercial_readiness="unknown",
            patent_keywords=[],
            market_applications=[],
            technical_specifications={},
            confidence_score=0.1,
            extraction_quality="low",
            extraction_logs=["Fallback extraction used - Claude unavailable"]
        )
    
    def _fallback_basic_data(self, content: str) -> Dict[str, Any]:
        """Fallback for basic data extraction"""
        lines = content.split('\n')
        return {
            'title': lines[0] if lines else "Untitled",
            'abstract': "Manual review required",
            'research_domain': "Unknown",
            'methodology': [],
            'findings': []
        }
    
    def _fallback_technical_data(self) -> Dict[str, Any]:
        """Fallback for technical data extraction"""
        return {
            'key_technologies': [],
            'classification': "Unknown",
            'innovation_level': "unknown",
            'innovation_aspects': [],
            'specifications': {}
        }
    
    def _fallback_commercial_data(self) -> Dict[str, Any]:
        """Fallback for commercial data extraction"""
        return {
            'applications': [],
            'market_applications': [],
            'readiness_level': "unknown",
            'commercial_potential': {
                'market_size': "Unknown",
                'competitive_advantage': "To be determined",
                'barriers': "Analysis required"
            }
        }
    
    async def validate_extraction_quality(self, extracted_data: ExtractedResearchData) -> Dict[str, Any]:
        """Validate the quality of extracted data"""
        
        validation_results = {
            'is_valid': True,
            'issues': [],
            'recommendations': [],
            'completeness_score': 0.0
        }
        
        # Check required fields
        if not extracted_data.title or len(extracted_data.title) < 5:
            validation_results['issues'].append("Title is missing or too short")
            validation_results['is_valid'] = False
        
        if not extracted_data.abstract or len(extracted_data.abstract) < 20:
            validation_results['issues'].append("Abstract is missing or too short")
            validation_results['recommendations'].append("Consider manual abstract entry")
        
        if not extracted_data.key_technologies:
            validation_results['issues'].append("No key technologies identified")
            validation_results['recommendations'].append("Manual technology review recommended")
        
        if extracted_data.confidence_score < 0.5:
            validation_results['issues'].append("Low extraction confidence")
            validation_results['recommendations'].append("Manual review strongly recommended")
        
        # Calculate completeness score
        completeness_factors = [
            bool(extracted_data.title),
            bool(extracted_data.abstract),
            bool(extracted_data.key_technologies),
            bool(extracted_data.research_domain != "Unknown"),
            bool(extracted_data.technical_keywords),
            bool(extracted_data.applications)
        ]
        
        validation_results['completeness_score'] = sum(completeness_factors) / len(completeness_factors)
        
        return validation_results

# Global instance
claude_extraction_service = ClaudeExtractionService()