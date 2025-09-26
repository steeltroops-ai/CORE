import asyncio
import logging
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
import json
from .claude_extraction_service import ExtractedResearchData, DocumentParts, claude_extraction_service
from .logic_mill import LogicMillClient

logger = logging.getLogger(__name__)

@dataclass
class EnhancedSimilarityResult:
    """Enhanced similarity search result with extraction context"""
    id: str
    score: float
    index: str
    title: str
    url: str
    summary: Optional[str]
    relevance_factors: Dict[str, float]
    extraction_confidence: float
    match_type: str  # 'title', 'abstract', 'technical', 'keyword'

@dataclass
class SearchOptimizationMetrics:
    """Metrics for search optimization"""
    total_search_terms: int
    weighted_terms_used: int
    confidence_boost_applied: float
    search_strategy: str
    processing_time: float

class EnhancedLogicMillService:
    """Enhanced Logic Mill service with Claude-powered extraction integration"""
    
    def __init__(self, logic_mill_client: Optional[LogicMillClient] = None):
        self.logic_mill_client = logic_mill_client
        self.extraction_service = claude_extraction_service
        self.search_cache = {}  # Cache for search results
    
    async def analyze_document_with_enhanced_search(
        self,
        content: str,
        document_type: str = "research_paper",
        search_indices: List[str] = None,
        max_results: int = 25
    ) -> Tuple[ExtractedResearchData, List[EnhancedSimilarityResult], SearchOptimizationMetrics]:
        """Analyze document and perform enhanced similarity search"""
        
        if search_indices is None:
            search_indices = ["patents", "publications"]
        
        start_time = asyncio.get_event_loop().time()
        
        # Step 1: Extract research parameters using Claude
        logger.info("Starting Claude-powered document analysis")
        extracted_data = await self.extraction_service.extract_research_parameters(
            content, document_type
        )
        
        # Step 2: Create optimized search strategy
        search_strategy = self._determine_search_strategy(extracted_data)
        logger.info(f"Using search strategy: {search_strategy}")
        
        # Step 3: Perform enhanced similarity search
        similarity_results = await self._perform_enhanced_similarity_search(
            extracted_data, search_indices, max_results, search_strategy
        )
        
        # Step 4: Calculate optimization metrics
        processing_time = asyncio.get_event_loop().time() - start_time
        optimization_metrics = self._calculate_optimization_metrics(
            extracted_data, similarity_results, search_strategy, processing_time
        )
        
        logger.info(f"Enhanced analysis completed in {processing_time:.2f}s with {len(similarity_results)} results")
        
        return extracted_data, similarity_results, optimization_metrics
    
    async def _perform_enhanced_similarity_search(
        self,
        extracted_data: ExtractedResearchData,
        indices: List[str],
        max_results: int,
        strategy: str
    ) -> List[EnhancedSimilarityResult]:
        """Perform similarity search with Claude-extracted optimization"""
        
        if not self.logic_mill_client:
            logger.warning("Logic Mill client not available, returning empty results")
            return []
        
        try:
            # Create weighted document parts
            document_parts = self.extraction_service.create_weighted_document_parts(extracted_data)
            
            # Build search queries based on strategy
            search_queries = self._build_search_queries(extracted_data, document_parts, strategy)
            
            all_results = []
            
            # Execute multiple search queries and combine results
            for query_name, query_data in search_queries.items():
                logger.info(f"Executing {query_name} search")
                
                try:
                    # Prepare document parts for Logic Mill API
                    api_parts = []
                    for part_name, (content, weight) in query_data['parts'].items():
                        if content.strip():  # Only include non-empty parts
                            api_parts.append({
                                'key': part_name,
                                'value': content
                            })
                    
                    if not api_parts:
                        logger.warning(f"No valid parts for {query_name} search")
                        continue
                    
                    # Call Logic Mill API
                    raw_results = await self.logic_mill_client.encode_document_and_similarity_search(
                        document_parts=api_parts,
                        indices=indices,
                        amount=max_results,
                        model='patspecter'
                    )
                    
                    # Enhance results with extraction context
                    enhanced_results = self._enhance_similarity_results(
                        raw_results, extracted_data, query_name, query_data['weight_boost']
                    )
                    
                    all_results.extend(enhanced_results)
                    
                except Exception as e:
                    logger.error(f"Error in {query_name} search: {e}")
                    continue
            
            # Deduplicate and rank results
            final_results = self._deduplicate_and_rank_results(all_results, max_results)
            
            return final_results
            
        except Exception as e:
            logger.error(f"Error in enhanced similarity search: {e}")
            return []
    
    def _determine_search_strategy(self, extracted_data: ExtractedResearchData) -> str:
        """Determine optimal search strategy based on extracted data quality"""
        
        confidence = extracted_data.confidence_score
        has_technical_keywords = len(extracted_data.technical_keywords) > 0
        has_patent_keywords = len(extracted_data.patent_keywords) > 0
        has_specifications = len(extracted_data.technical_specifications) > 0
        
        if confidence >= 0.8 and has_technical_keywords and has_patent_keywords:
            return "comprehensive"  # Use all available data with full weighting
        elif confidence >= 0.6 and (has_technical_keywords or has_patent_keywords):
            return "keyword_focused"  # Focus on extracted keywords
        elif confidence >= 0.4:
            return "title_abstract"  # Focus on title and abstract
        else:
            return "basic"  # Basic search with minimal optimization
    
    def _build_search_queries(
        self, 
        extracted_data: ExtractedResearchData, 
        document_parts: DocumentParts, 
        strategy: str
    ) -> Dict[str, Dict[str, Any]]:
        """Build multiple search queries based on strategy"""
        
        queries = {}
        
        if strategy == "comprehensive":
            # Primary query: Full document with high weights
            queries["primary"] = {
                "parts": {
                    "title": document_parts.title,
                    "abstract": document_parts.abstract,
                    "keywords": document_parts.keywords,
                    "technical_specs": document_parts.technical_specs
                },
                "weight_boost": 1.0
            }
            
            # Secondary query: Technical focus
            queries["technical"] = {
                "parts": {
                    "keywords": document_parts.keywords,
                    "technical_specs": document_parts.technical_specs,
                    "title": document_parts.title
                },
                "weight_boost": 0.8
            }
            
        elif strategy == "keyword_focused":
            # Keyword-optimized query
            queries["keyword_primary"] = {
                "parts": {
                    "keywords": document_parts.keywords,
                    "title": document_parts.title,
                    "abstract": document_parts.abstract
                },
                "weight_boost": 1.0
            }
            
        elif strategy == "title_abstract":
            # Title and abstract focused
            queries["title_abstract"] = {
                "parts": {
                    "title": document_parts.title,
                    "abstract": document_parts.abstract
                },
                "weight_boost": 1.0
            }
            
        else:  # basic strategy
            # Simple title-based search
            queries["basic"] = {
                "parts": {
                    "title": document_parts.title
                },
                "weight_boost": 1.0
            }
        
        return queries
    
    def _enhance_similarity_results(
        self,
        raw_results: List[Dict[str, Any]],
        extracted_data: ExtractedResearchData,
        query_type: str,
        weight_boost: float
    ) -> List[EnhancedSimilarityResult]:
        """Enhance raw similarity results with extraction context"""
        
        enhanced_results = []
        
        for result in raw_results:
            try:
                document = result.get('document', {})
                
                # Calculate relevance factors
                relevance_factors = self._calculate_relevance_factors(
                    result, extracted_data, query_type
                )
                
                # Determine match type
                match_type = self._determine_match_type(result, extracted_data)
                
                # Apply confidence boost
                boosted_score = result.get('score', 0.0) * weight_boost * extracted_data.confidence_score
                
                enhanced_result = EnhancedSimilarityResult(
                    id=str(result.get('id', '')),
                    score=boosted_score,
                    index=str(result.get('index', '')),
                    title=document.get('title', 'Untitled'),
                    url=document.get('url', ''),
                    summary=document.get('summary', ''),
                    relevance_factors=relevance_factors,
                    extraction_confidence=extracted_data.confidence_score,
                    match_type=match_type
                )
                
                enhanced_results.append(enhanced_result)
                
            except Exception as e:
                logger.error(f"Error enhancing result: {e}")
                continue
        
        return enhanced_results
    
    def _calculate_relevance_factors(
        self,
        result: Dict[str, Any],
        extracted_data: ExtractedResearchData,
        query_type: str
    ) -> Dict[str, float]:
        """Calculate relevance factors for result ranking"""
        
        factors = {
            'base_score': result.get('score', 0.0),
            'extraction_confidence': extracted_data.confidence_score,
            'query_type_weight': 1.0,
            'technology_match': 0.0,
            'domain_match': 0.0
        }
        
        # Adjust query type weight
        query_weights = {
            'primary': 1.0,
            'technical': 0.9,
            'keyword_primary': 0.8,
            'title_abstract': 0.7,
            'basic': 0.5
        }
        factors['query_type_weight'] = query_weights.get(query_type, 0.5)
        
        # Check for technology matches
        document = result.get('document', {})
        doc_title = document.get('title', '').lower()
        
        for tech in extracted_data.key_technologies:
            if tech.lower() in doc_title:
                factors['technology_match'] += 0.1
        
        # Check for domain matches
        if extracted_data.research_domain.lower() in doc_title:
            factors['domain_match'] = 0.2
        
        return factors
    
    def _determine_match_type(
        self,
        result: Dict[str, Any],
        extracted_data: ExtractedResearchData
    ) -> str:
        """Determine the type of match for categorization"""
        
        document = result.get('document', {})
        doc_title = document.get('title', '').lower()
        
        # Check for exact title matches
        if extracted_data.title.lower() in doc_title or doc_title in extracted_data.title.lower():
            return 'title'
        
        # Check for technical keyword matches
        for keyword in extracted_data.technical_keywords:
            if keyword.lower() in doc_title:
                return 'technical'
        
        # Check for patent keyword matches
        for keyword in extracted_data.patent_keywords:
            if keyword.lower() in doc_title:
                return 'keyword'
        
        # Default to abstract match
        return 'abstract'
    
    def _deduplicate_and_rank_results(
        self,
        all_results: List[EnhancedSimilarityResult],
        max_results: int
    ) -> List[EnhancedSimilarityResult]:
        """Deduplicate and rank results by enhanced score"""
        
        # Deduplicate by ID
        seen_ids = set()
        unique_results = []
        
        for result in all_results:
            if result.id not in seen_ids:
                seen_ids.add(result.id)
                unique_results.append(result)
        
        # Calculate final ranking score
        for result in unique_results:
            final_score = result.score
            
            # Apply relevance factor boosts
            for factor, value in result.relevance_factors.items():
                if factor != 'base_score':
                    final_score *= (1 + value * 0.1)  # Small boost for each factor
            
            result.score = final_score
        
        # Sort by final score and return top results
        unique_results.sort(key=lambda x: x.score, reverse=True)
        return unique_results[:max_results]
    
    def _calculate_optimization_metrics(
        self,
        extracted_data: ExtractedResearchData,
        results: List[EnhancedSimilarityResult],
        strategy: str,
        processing_time: float
    ) -> SearchOptimizationMetrics:
        """Calculate metrics for search optimization analysis"""
        
        total_terms = len(extracted_data.technical_keywords) + len(extracted_data.patent_keywords)
        weighted_terms = len([k for k in extracted_data.technical_keywords if k.strip()]) + \
                        len([k for k in extracted_data.patent_keywords if k.strip()])
        
        confidence_boost = extracted_data.confidence_score
        
        return SearchOptimizationMetrics(
            total_search_terms=total_terms,
            weighted_terms_used=weighted_terms,
            confidence_boost_applied=confidence_boost,
            search_strategy=strategy,
            processing_time=processing_time
        )
    
    async def validate_search_results(
        self,
        results: List[EnhancedSimilarityResult],
        extracted_data: ExtractedResearchData
    ) -> Dict[str, Any]:
        """Validate the quality and relevance of search results"""
        
        validation = {
            'total_results': len(results),
            'high_confidence_results': 0,
            'technology_matches': 0,
            'domain_matches': 0,
            'average_score': 0.0,
            'match_type_distribution': {},
            'quality_assessment': 'unknown'
        }
        
        if not results:
            validation['quality_assessment'] = 'no_results'
            return validation
        
        # Analyze results
        total_score = 0.0
        match_types = {}
        
        for result in results:
            total_score += result.score
            
            # Count high confidence results
            if result.extraction_confidence >= 0.7:
                validation['high_confidence_results'] += 1
            
            # Count technology matches
            if result.relevance_factors.get('technology_match', 0) > 0:
                validation['technology_matches'] += 1
            
            # Count domain matches
            if result.relevance_factors.get('domain_match', 0) > 0:
                validation['domain_matches'] += 1
            
            # Track match types
            match_type = result.match_type
            match_types[match_type] = match_types.get(match_type, 0) + 1
        
        validation['average_score'] = total_score / len(results)
        validation['match_type_distribution'] = match_types
        
        # Assess overall quality
        if validation['average_score'] >= 0.7 and validation['high_confidence_results'] >= len(results) * 0.5:
            validation['quality_assessment'] = 'high'
        elif validation['average_score'] >= 0.5 and validation['high_confidence_results'] >= len(results) * 0.3:
            validation['quality_assessment'] = 'medium'
        else:
            validation['quality_assessment'] = 'low'
        
        return validation
    
    def get_search_recommendations(
        self,
        extracted_data: ExtractedResearchData,
        optimization_metrics: SearchOptimizationMetrics,
        validation_results: Dict[str, Any]
    ) -> List[str]:
        """Generate recommendations for improving search results"""
        
        recommendations = []
        
        # Check extraction quality
        if extracted_data.confidence_score < 0.6:
            recommendations.append(
                "Consider manual review of extracted data - low extraction confidence detected"
            )
        
        # Check search term coverage
        if optimization_metrics.total_search_terms < 5:
            recommendations.append(
                "Document may benefit from additional technical keywords for better search precision"
            )
        
        # Check result quality
        if validation_results['quality_assessment'] == 'low':
            recommendations.append(
                "Search results show low relevance - consider refining document content or search strategy"
            )
        
        # Check technology matches
        if validation_results['technology_matches'] == 0:
            recommendations.append(
                "No technology-specific matches found - verify technical keyword extraction"
            )
        
        # Performance recommendations
        if optimization_metrics.processing_time > 10.0:
            recommendations.append(
                "Processing time is high - consider enabling result caching for similar documents"
            )
        
        return recommendations

# Factory function for creating service instances
def create_enhanced_logic_mill_service(logic_mill_client: Optional[LogicMillClient] = None) -> EnhancedLogicMillService:
    """Create an enhanced Logic Mill service instance"""
    return EnhancedLogicMillService(logic_mill_client)