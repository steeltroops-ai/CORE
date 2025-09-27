from __future__ import annotations

import logging
from uuid import uuid4
from typing import Dict, Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

from ..core.config import get_settings
from ..models.analysis import AnalysisRecord
from ..services.logic_mill import LogicMillClient, logic_mill_available, SimilarityRequest
from ..services.tech_transfer import run_tech_transfer_analysis
from ..services.claude_service import claude_service
from ..services.similarity_search_service import similarity_search_service
from ..services.claude_extraction_service import claude_extraction_service
from ..services.enhanced_logic_mill_service import create_enhanced_logic_mill_service

router = APIRouter()

ANALYSIS_DB: Dict[str, AnalysisRecord] = {}

# Initialize with sample data for demo purposes
def _initialize_sample_data():
    """Initialize ANALYSIS_DB with sample data for demo purposes"""
    from ..models.analysis import TechTransferAnalysis, StakeholderMap, DocumentHit
    
    # Create sample tech transfer analysis
    sample_patents = [
        DocumentHit(
            id="US123456",
            index="patents",
            title="Advanced Catalyst Membrane for Electrolysis",
            summary="A novel membrane design for improved electrolysis efficiency",
            score=0.85,
            url="https://patents.google.com/patent/US123456",
            inventors=["Dr. Smith", "Dr. Johnson"],
            assignees=["Tech Corp"]
        )
    ]
    
    sample_publications = [
        DocumentHit(
            id="pub001",
            index="publications",
            title="Membrane Technology in Renewable Energy",
            summary="Review of membrane applications in clean energy",
            score=0.78,
            url="https://example.com/publication/001",
            inventors=["Prof. Wilson"],
            institutions=["MIT"]
        )
    ]
    
    sample_stakeholders = StakeholderMap(
        inventors=["Dr. Smith", "Dr. Johnson"],
        assignees=["Tech Corp"],
        institutions=["MIT", "Stanford"]
    )
    
    sample_tech_transfer = TechTransferAnalysis(
        novelty_score=0.75,
        top_patents=sample_patents,
        top_publications=sample_publications,
        stakeholders=sample_stakeholders,
        licensing_opportunities=[
            "Partnership opportunity with Tech Corp",
            "Licensing potential with Clean Energy Inc"
        ],
        retrieval_count=25
    )
    
    # Create sample analysis record
    sample_record = AnalysisRecord(
        analysis_id="demo-sample-analysis",
        title="Adaptive Catalyst Membranes for Electrolysis",
        abstract="We present a catalyst membrane design that adjusts porosity under load to reduce degradation and improve efficiency in electrolysis applications.",
        tech_transfer=sample_tech_transfer
    )
    
    ANALYSIS_DB["demo-sample-analysis"] = sample_record
    logger.info("Sample analysis data initialized")

# Initialize sample data on module load
_initialize_sample_data()


class IngestRequest(BaseModel):
    title: str
    abstract: str
    body: str | None = None


class EnhancedIngestRequest(BaseModel):
    content: str
    document_type: str = "research_paper"
    use_claude_extraction: bool = True
    search_indices: List[str] = ["patents", "publications"]
    max_results: int = 25


class IngestResponse(BaseModel):
    analysis_id: str
    status: str


class EnhancedIngestResponse(BaseModel):
    analysis_id: str
    status: str
    extracted_data: Dict[str, Any]
    similarity_results: List[Dict[str, Any]]
    optimization_metrics: Dict[str, Any]
    validation_results: Dict[str, Any]
    recommendations: List[str]


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    conversation_history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    success: bool
    response: Optional[str] = None
    error: Optional[str] = None
    usage: Optional[Dict[str, int]] = None

class Track1InsightsRequest(BaseModel):
    analysis_id: str
    include_competitive: bool = True
    include_strategic: bool = True
    include_commercialization: bool = True

class NoveltyAssessmentResponse(BaseModel):
    analysis_id: str
    novelty_score: float
    confidence_interval: List[float]
    prior_art_landscape: List[Dict[str, Any]]
    freedom_to_operate_risk: str
    claims_analysis: List[Dict[str, Any]]

class CompetitiveIntelligenceResponse(BaseModel):
    analysis_id: str
    inventor_network: Dict[str, Any]
    institution_mapping: Dict[str, Any]
    patent_portfolio_analysis: Dict[str, Any]
    collaboration_networks: List[Dict[str, Any]]
    market_position: Dict[str, Any]

class StrategicInsightsResponse(BaseModel):
    analysis_id: str
    recommendations: List[Dict[str, Any]]
    risk_assessment: Dict[str, Any]
    regulatory_considerations: List[Dict[str, Any]]
    market_timing_analysis: Dict[str, Any]
    partnership_recommendations: List[Dict[str, Any]]

class CommercializationResponse(BaseModel):
    analysis_id: str
    licensing_leads: List[Dict[str, Any]]
    market_readiness: Dict[str, Any]
    ip_protection_roadmap: List[Dict[str, Any]]
    technology_transfer_pathways: List[Dict[str, Any]]
    revenue_potential: Dict[str, Any]


def get_logic_mill_client() -> LogicMillClient | None:
    settings = get_settings()
    if logic_mill_available(settings.logic_mill_token):
        return LogicMillClient(settings.logic_mill_endpoint, settings.logic_mill_token)
    return None


@router.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok", "service": "core-backend", "tracks": "tech-transfer"}


@router.post("/ingest", response_model=IngestResponse)
async def ingest(
    payload: IngestRequest,
    client: LogicMillClient | None = Depends(get_logic_mill_client),
) -> IngestResponse:
    analysis_id = str(uuid4())
    tech_transfer = run_tech_transfer_analysis(
        title=payload.title,
        abstract=f"{payload.abstract}\n\n{payload.body or ''}",
        client=client,
    )
    record = AnalysisRecord(
        analysis_id=analysis_id,
        title=payload.title,
        abstract=payload.abstract,
        tech_transfer=tech_transfer,
    )
    ANALYSIS_DB[analysis_id] = record
    return IngestResponse(analysis_id=analysis_id, status="completed")


@router.post("/ingest/enhanced", response_model=EnhancedIngestResponse)
async def enhanced_ingest(
    payload: EnhancedIngestRequest,
    client: LogicMillClient | None = Depends(get_logic_mill_client),
) -> EnhancedIngestResponse:
    """Enhanced document ingestion with Claude-powered extraction and optimized similarity search"""
    
    analysis_id = str(uuid4())
    
    try:
        # Create enhanced Logic Mill service
        enhanced_service = create_enhanced_logic_mill_service(client)
        
        # Perform enhanced analysis with Claude extraction
        extracted_data, similarity_results, optimization_metrics = await enhanced_service.analyze_document_with_enhanced_search(
            content=payload.content,
            document_type=payload.document_type,
            search_indices=payload.search_indices,
            max_results=payload.max_results
        )
        
        # Validate extraction quality
        extraction_validation = await claude_extraction_service.validate_extraction_quality(extracted_data)
        
        # Validate search results
        search_validation = await enhanced_service.validate_search_results(similarity_results, extracted_data)
        
        # Get recommendations
        recommendations = enhanced_service.get_search_recommendations(
            extracted_data, optimization_metrics, search_validation
        )
        
        # Create traditional tech transfer analysis for compatibility
        tech_transfer = run_tech_transfer_analysis(
            title=extracted_data.title,
            abstract=extracted_data.abstract,
            client=client,
        )
        
        # Store analysis record
        record = AnalysisRecord(
            analysis_id=analysis_id,
            title=extracted_data.title,
            abstract=extracted_data.abstract,
            tech_transfer=tech_transfer,
        )
        ANALYSIS_DB[analysis_id] = record
        
        # Convert results to serializable format
        serialized_results = []
        for result in similarity_results:
            serialized_results.append({
                'id': result.id,
                'score': result.score,
                'index': result.index,
                'title': result.title,
                'url': result.url,
                'summary': result.summary,
                'relevance_factors': result.relevance_factors,
                'extraction_confidence': result.extraction_confidence,
                'match_type': result.match_type
            })
        
        # Prepare extracted data for response
        extracted_data_dict = {
            'title': extracted_data.title,
            'abstract': extracted_data.abstract,
            'key_technologies': extracted_data.key_technologies,
            'research_domain': extracted_data.research_domain,
            'methodology': extracted_data.methodology,
            'findings': extracted_data.findings,
            'applications': extracted_data.applications,
            'technical_keywords': extracted_data.technical_keywords,
            'innovation_aspects': extracted_data.innovation_aspects,
            'commercial_potential': extracted_data.commercial_potential,
            'technology_classification': extracted_data.technology_classification,
            'innovation_level': extracted_data.innovation_level,
            'commercial_readiness': extracted_data.commercial_readiness,
            'patent_keywords': extracted_data.patent_keywords,
            'market_applications': extracted_data.market_applications,
            'technical_specifications': extracted_data.technical_specifications,
            'confidence_score': extracted_data.confidence_score,
            'extraction_quality': extracted_data.extraction_quality,
            'extraction_logs': extracted_data.extraction_logs
        }
        
        # Prepare optimization metrics
        metrics_dict = {
            'total_search_terms': optimization_metrics.total_search_terms,
            'weighted_terms_used': optimization_metrics.weighted_terms_used,
            'confidence_boost_applied': optimization_metrics.confidence_boost_applied,
            'search_strategy': optimization_metrics.search_strategy,
            'processing_time': optimization_metrics.processing_time
        }
        
        # Combine validation results
        combined_validation = {
            'extraction_validation': extraction_validation,
            'search_validation': search_validation
        }
        
        logger.info(f"Enhanced analysis completed for {analysis_id} with {len(similarity_results)} results")
        
        return EnhancedIngestResponse(
            analysis_id=analysis_id,
            status="completed",
            extracted_data=extracted_data_dict,
            similarity_results=serialized_results,
            optimization_metrics=metrics_dict,
            validation_results=combined_validation,
            recommendations=recommendations
        )
        
    except Exception as e:
        logger.error(f"Error in enhanced ingest: {e}")
        
        # Fallback to basic analysis
        lines = payload.content.split('\n')
        title = lines[0] if lines else "Untitled Document"
        abstract = "\n".join(lines[1:3]) if len(lines) > 1 else "No abstract available"
        
        tech_transfer = run_tech_transfer_analysis(
            title=title,
            abstract=abstract,
            client=client,
        )
        
        record = AnalysisRecord(
            analysis_id=analysis_id,
            title=title,
            abstract=abstract,
            tech_transfer=tech_transfer,
        )
        ANALYSIS_DB[analysis_id] = record
        
        return EnhancedIngestResponse(
            analysis_id=analysis_id,
            status="completed_with_fallback",
            extracted_data={'title': title, 'abstract': abstract, 'error': str(e)},
            similarity_results=[],
            optimization_metrics={'error': str(e)},
            validation_results={'error': str(e)},
            recommendations=["Enhanced extraction failed - manual review recommended"]
        )


def _get_record_or_404(analysis_id: str) -> AnalysisRecord:
    record = ANALYSIS_DB.get(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="analysis not found")
    return record


@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str) -> Dict[str, Any]:
    record = _get_record_or_404(analysis_id)
    tt = record.tech_transfer
    return {
        "analysis_id": record.analysis_id,
        "title": record.title,
        "abstract": record.abstract,
        "novelty_score": tt.novelty_score,
        "related_patents": [hit.dict() for hit in tt.top_patents],
        "related_publications": [hit.dict() for hit in tt.top_publications],
        "stakeholders": tt.stakeholders.dict(),
        "licensing_opportunities": tt.licensing_opportunities,
        "retrieval_count": tt.retrieval_count,
        "status": record.status,
    }


@router.get("/analysis/{analysis_id}/tech-transfer")
async def get_tech_transfer(analysis_id: str) -> Dict[str, Any]:
    record = _get_record_or_404(analysis_id)
    tt = record.tech_transfer
    return {
        "analysis_id": record.analysis_id,
        "novelty_score": tt.novelty_score,
        "top_patents": [hit.dict() for hit in tt.top_patents],
        "top_publications": [hit.dict() for hit in tt.top_publications],
        "stakeholders": tt.stakeholders.dict(),
        "licensing_opportunities": tt.licensing_opportunities,
    }


@router.get("/analysis/{analysis_id}/vc")
async def get_vc_scores(analysis_id: str) -> Dict[str, Any]:
    _ = _get_record_or_404(analysis_id)
    return {
        "analysis_id": analysis_id,
        "message": "Track 2 (VC Analyst) not yet implemented. Focus currently on Tech Transfer track.",
    }


@router.get("/analysis/{analysis_id}/gtm")
async def get_gtm(analysis_id: str) -> Dict[str, Any]:
    _ = _get_record_or_404(analysis_id)
    return {
        "analysis_id": analysis_id,
        "message": "Track 3 (Product & GTM Generator) not yet implemented. Focus currently on Tech Transfer track.",
    }


@router.post("/analysis/{analysis_id}/narrate")
async def narrate(analysis_id: str) -> Dict[str, Any]:
    _ = _get_record_or_404(analysis_id)
    return {
        "analysis_id": analysis_id,
        "status": "pending",
        "message": "ElevenLabs narration job stubbed; integrate during polish phase.",
        "audio_url": None,
    }


@router.post("/agent/{analysis_id}")
async def agent_reply(analysis_id: str, prompt: Dict[str, str]) -> Dict[str, Any]:
    record = _get_record_or_404(analysis_id)
    question = prompt.get("message", "")
    tt = record.tech_transfer
    response_lines = [
        "I analyzed your submission using Logic Mill-style similarity search.",
        f"Novelty looks like {tt.novelty_score:.2f} (lower score means closer prior art).",
    ]
    if tt.top_patents:
        response_lines.append(
            f"Closest patent: {tt.top_patents[0].title} (score {tt.top_patents[0].score:.2f})."
        )
    if tt.licensing_opportunities:
        response_lines.append(f"Consider outreach to {tt.licensing_opportunities[0].split(' with ')[-1]}.")
    if question:
        response_lines.append(f"(Stub response to your question: '{question}')")
    return {
        "analysis_id": analysis_id,
        "agent_response": " \n".join(response_lines),
        "citations": [hit.url for hit in tt.top_patents[:2] if hit.url],
    }


@router.get("/analysis/{analysis_id}/track1/novelty", response_model=NoveltyAssessmentResponse)
async def get_novelty_assessment(
    analysis_id: str,
    client: LogicMillClient | None = Depends(get_logic_mill_client)
) -> NoveltyAssessmentResponse:
    """Get advanced novelty assessment for Track 1 insights"""
    record = _get_record_or_404(analysis_id)
    
    if not client:
        # Return basic novelty data from existing analysis
        tt = record.tech_transfer
        return NoveltyAssessmentResponse(
            analysis_id=analysis_id,
            novelty_score=tt.novelty_score,
            confidence_interval=[max(0, tt.novelty_score - 0.1), min(1, tt.novelty_score + 0.1)],
            prior_art_landscape=[],
            freedom_to_operate_risk="MEDIUM - Limited analysis available",
            claims_analysis=[]
        )
    
    # Perform advanced novelty assessment
    request = SimilarityRequest(
        text=f"{record.title}\n{record.abstract}",
        indices=["patents", "publications"],
        amount=20
    )
    
    novelty_assessment = client.advanced_novelty_assessment(request)
    
    return NoveltyAssessmentResponse(
        analysis_id=analysis_id,
        novelty_score=novelty_assessment.novelty_score,
        confidence_interval=list(novelty_assessment.confidence_interval),
        prior_art_landscape=novelty_assessment.prior_art_landscape,
        freedom_to_operate_risk=novelty_assessment.freedom_to_operate_risk,
        claims_analysis=novelty_assessment.claims_analysis
    )

@router.get("/analysis/{analysis_id}/track1/competitive", response_model=CompetitiveIntelligenceResponse)
async def get_competitive_intelligence(
    analysis_id: str,
    client: LogicMillClient | None = Depends(get_logic_mill_client)
) -> CompetitiveIntelligenceResponse:
    """Get competitive intelligence analysis for Track 1 insights"""
    record = _get_record_or_404(analysis_id)
    
    if not client:
        # Return basic competitive data from existing analysis
        return CompetitiveIntelligenceResponse(
            analysis_id=analysis_id,
            inventor_network={'top_inventors': [], 'key_collaborations': [], 'network_density': 0.0},
            institution_mapping={},
            patent_portfolio_analysis={},
            collaboration_networks=[],
            market_position={'competitive_intensity': 'UNKNOWN', 'market_maturity': 'UNKNOWN'}
        )
    
    # Perform competitive intelligence analysis
    request = SimilarityRequest(
        text=f"{record.title}\n{record.abstract}",
        indices=["patents", "publications"],
        amount=30
    )
    
    competitive_intel = client.competitive_intelligence_analysis(request)
    
    return CompetitiveIntelligenceResponse(
        analysis_id=analysis_id,
        inventor_network=competitive_intel.inventor_network,
        institution_mapping=competitive_intel.institution_mapping,
        patent_portfolio_analysis=competitive_intel.patent_portfolio_analysis,
        collaboration_networks=competitive_intel.collaboration_networks,
        market_position=competitive_intel.market_position
    )

@router.get("/analysis/{analysis_id}/track1/strategic", response_model=StrategicInsightsResponse)
async def get_strategic_insights(analysis_id: str) -> StrategicInsightsResponse:
    """Get AI-powered strategic insights for Track 1"""
    record = _get_record_or_404(analysis_id)
    
    # Prepare technology data for Claude analysis
    tech_data = {
        'title': record.title,
        'abstract': record.abstract,
        'novelty_score': record.tech_transfer.novelty_score,
        'stakeholders': record.tech_transfer.stakeholders.dict(),
        'related_patents': [hit.dict() for hit in record.tech_transfer.top_patents],
        'related_publications': [hit.dict() for hit in record.tech_transfer.top_publications]
    }
    
    # Generate strategic insights using Claude
    strategic_insights = await claude_service.generate_strategic_insights(tech_data)
    
    return StrategicInsightsResponse(
        analysis_id=analysis_id,
        recommendations=strategic_insights.recommendations,
        risk_assessment=strategic_insights.risk_assessment,
        regulatory_considerations=strategic_insights.regulatory_considerations,
        market_timing_analysis=strategic_insights.market_timing_analysis,
        partnership_recommendations=strategic_insights.partnership_recommendations
    )

@router.get("/analysis/{analysis_id}/track1/commercialization", response_model=CommercializationResponse)
async def get_commercialization_analysis(analysis_id: str) -> CommercializationResponse:
    """Get commercialization opportunities analysis for Track 1"""
    record = _get_record_or_404(analysis_id)
    
    # Prepare technology data for Claude analysis
    tech_data = {
        'title': record.title,
        'abstract': record.abstract,
        'novelty_score': record.tech_transfer.novelty_score,
        'related_patents': [hit.dict() for hit in record.tech_transfer.top_patents],
        'licensing_opportunities': record.tech_transfer.licensing_opportunities
    }
    
    # Generate commercialization analysis using Claude
    commercialization_analysis = await claude_service.generate_commercialization_analysis(tech_data)
    
    return CommercializationResponse(
        analysis_id=analysis_id,
        licensing_leads=commercialization_analysis.licensing_leads,
        market_readiness=commercialization_analysis.market_readiness,
        ip_protection_roadmap=commercialization_analysis.ip_protection_roadmap,
        technology_transfer_pathways=commercialization_analysis.technology_transfer_pathways,
        revenue_potential=commercialization_analysis.revenue_potential
    )

@router.get("/analysis/{analysis_id}/track1/comprehensive")
async def get_comprehensive_track1_insights(
    analysis_id: str,
    client: LogicMillClient | None = Depends(get_logic_mill_client)
) -> Dict[str, Any]:
    """Get comprehensive Track 1 insights combining all analysis types"""
    record = _get_record_or_404(analysis_id)
    
    # Prepare base technology data
    tech_data = {
        'title': record.title,
        'abstract': record.abstract,
        'novelty_score': record.tech_transfer.novelty_score,
        'stakeholders': record.tech_transfer.stakeholders.dict(),
        'related_patents': [hit.dict() for hit in record.tech_transfer.top_patents],
        'related_publications': [hit.dict() for hit in record.tech_transfer.top_publications],
        'licensing_opportunities': record.tech_transfer.licensing_opportunities
    }
    
    # Initialize results
    results = {
        'analysis_id': analysis_id,
        'title': record.title,
        'abstract': record.abstract,
        'basic_analysis': {
            'novelty_score': record.tech_transfer.novelty_score,
            'stakeholders': record.tech_transfer.stakeholders.dict(),
            'licensing_opportunities': record.tech_transfer.licensing_opportunities
        }
    }
    
    # Get advanced novelty assessment if Logic Mill is available
    if client:
        request = SimilarityRequest(
            text=f"{record.title}\n{record.abstract}",
            indices=["patents", "publications"],
            amount=25
        )
        
        novelty_assessment = client.advanced_novelty_assessment(request)
        competitive_intel = client.competitive_intelligence_analysis(request)
        
        results['novelty_assessment'] = {
            'novelty_score': novelty_assessment.novelty_score,
            'confidence_interval': list(novelty_assessment.confidence_interval),
            'prior_art_landscape': novelty_assessment.prior_art_landscape,
            'freedom_to_operate_risk': novelty_assessment.freedom_to_operate_risk,
            'claims_analysis': novelty_assessment.claims_analysis
        }
        
        results['competitive_intelligence'] = {
            'inventor_network': competitive_intel.inventor_network,
            'institution_mapping': competitive_intel.institution_mapping,
            'patent_portfolio_analysis': competitive_intel.patent_portfolio_analysis,
            'collaboration_networks': competitive_intel.collaboration_networks,
            'market_position': competitive_intel.market_position
        }
    
    # Get Claude-powered insights
    try:
        strategic_insights = await claude_service.generate_strategic_insights(tech_data)
        commercialization_analysis = await claude_service.generate_commercialization_analysis(tech_data)
        
        results['strategic_insights'] = {
            'recommendations': strategic_insights.recommendations,
            'risk_assessment': strategic_insights.risk_assessment,
            'regulatory_considerations': strategic_insights.regulatory_considerations,
            'market_timing_analysis': strategic_insights.market_timing_analysis,
            'partnership_recommendations': strategic_insights.partnership_recommendations
        }
        
        results['commercialization'] = {
            'licensing_leads': commercialization_analysis.licensing_leads,
            'market_readiness': commercialization_analysis.market_readiness,
            'ip_protection_roadmap': commercialization_analysis.ip_protection_roadmap,
            'technology_transfer_pathways': commercialization_analysis.technology_transfer_pathways,
            'revenue_potential': commercialization_analysis.revenue_potential
        }
    except Exception as e:
        logger.error(f"Error generating Claude insights: {e}")
        results['strategic_insights'] = {'error': 'Strategic insights unavailable'}
        results['commercialization'] = {'error': 'Commercialization analysis unavailable'}
    
    return results

@router.post("/chat", response_model=ChatResponse)
async def chat_with_claude(payload: ChatRequest) -> ChatResponse:
    """Chat endpoint for Claude API integration"""
    try:
        # Convert conversation history to the format expected by Claude service
        history = None
        if payload.conversation_history:
            history = [
                {"role": msg.role, "content": msg.content}
                for msg in payload.conversation_history
            ]
        
        # Call Claude service
        result = await claude_service.send_message(
            message=payload.message,
            context=payload.context,
            conversation_history=history
        )
        
        return ChatResponse(
            success=result["success"],
            response=result["response"],
            error=result["error"],
            usage=result.get("usage")
        )
    
    except Exception as e:
        return ChatResponse(
            success=False,
            response=None,
            error=f"Internal server error: {str(e)}"
        )


@router.get("/chat/health")
async def chat_health_check() -> Dict[str, Any]:
    """Health check endpoint for Claude API"""
    return await claude_service.health_check()


# Similarity Search Endpoints
class SimilaritySearchRequest(BaseModel):
    title: str
    abstract: str
    amount: int = 25
    indices: List[str] = ["patents", "publications"]


class SimilaritySearchResponse(BaseModel):
    success: bool
    error: str | None = None
    results: List[Dict[str, Any]] = []
    total_results: int = 0
    query_info: Dict[str, Any] = {}


@router.post("/similarity-search", response_model=SimilaritySearchResponse)
async def search_similar_documents(payload: SimilaritySearchRequest) -> SimilaritySearchResponse:
    """Search for similar documents using Logic Mill API with exact implementation from example"""
    try:
        # Perform similarity search using the service
        search_results = await similarity_search_service.search_similar_documents(
            title=payload.title,
            abstract=payload.abstract,
            amount=payload.amount,
            indices=payload.indices
        )
        
        return SimilaritySearchResponse(
            success=search_results["success"],
            error=search_results["error"],
            results=search_results["results"],
            total_results=search_results.get("total_results", 0),
            query_info=search_results.get("query_info", {})
        )
        
    except Exception as e:
        logger.error(f"Error in similarity search endpoint: {e}")
        return SimilaritySearchResponse(
            success=False,
            error=f"Internal server error: {str(e)}",
            results=[],
            total_results=0,
            query_info={}
        )


@router.post("/extract-and-search")
async def extract_and_search_documents(payload: IngestRequest) -> Dict[str, Any]:
    """Extract document content using Claude AI and perform similarity search"""
    try:
        # Use Claude AI to enhance/validate the extracted content
        enhanced_content = await claude_service.send_message(
            message=f"Please analyze and improve this document content for research similarity search. Extract the most important technical details, key innovations, and research contributions.\n\nTitle: {payload.title}\n\nAbstract: {payload.abstract}\n\nBody: {payload.body or 'No additional content'}",
            context="You are helping to prepare document content for academic and patent similarity search. Focus on technical accuracy and key research contributions."
        )
        
        # Use the original or enhanced content for similarity search
        title = payload.title
        abstract = payload.abstract
        
        # If Claude enhancement was successful, use enhanced abstract
        if enhanced_content.get("success") and enhanced_content.get("response"):
            # Extract enhanced abstract from Claude response
            claude_response = enhanced_content["response"]
            if "Enhanced Abstract:" in claude_response:
                enhanced_abstract = claude_response.split("Enhanced Abstract:")[1].strip()
                if enhanced_abstract and len(enhanced_abstract) > 50:  # Use enhanced if substantial
                    abstract = enhanced_abstract
        
        # Perform similarity search
        search_results = await similarity_search_service.search_similar_documents(
            title=title,
            abstract=abstract,
            amount=25,
            indices=["patents", "publications"]
        )
        
        # Format results for display
        formatted_results = similarity_search_service.format_results_for_display(search_results)
        
        return {
            "success": search_results["success"],
            "error": search_results["error"],
            "extraction_info": {
                "original_title": payload.title,
                "original_abstract_words": len(payload.abstract.split()),
                "used_claude_enhancement": enhanced_content.get("success", False),
                "final_abstract_words": len(abstract.split())
            },
            "similarity_results": formatted_results,
            "total_results": len(formatted_results),
            "query_info": search_results.get("query_info", {})
        }
        
    except Exception as e:
        logger.error(f"Error in extract and search endpoint: {e}")
        return {
            "success": False,
            "error": f"Internal server error: {str(e)}",
            "extraction_info": {},
            "similarity_results": [],
            "total_results": 0,
            "query_info": {}
        }

