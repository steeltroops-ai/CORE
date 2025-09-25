from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
from collections import defaultdict, Counter
import statistics

import requests

logger = logging.getLogger(__name__)


class LogicMillError(RuntimeError):
    pass


@dataclass
class SimilarityRequest:
    text: str
    indices: List[str]
    amount: int = 10
    model: str = "patspecter"

@dataclass
class NoveltyAssessment:
    novelty_score: float
    confidence_interval: Tuple[float, float]
    prior_art_landscape: List[Dict[str, Any]]
    freedom_to_operate_risk: str
    claims_analysis: List[Dict[str, Any]]

@dataclass
class CompetitiveIntelligence:
    inventor_network: Dict[str, Any]
    institution_mapping: Dict[str, List[str]]
    patent_portfolio_analysis: Dict[str, Any]
    collaboration_networks: List[Dict[str, Any]]
    market_position: Dict[str, Any]


class LogicMillClient:
    """Thin wrapper around the Logic Mill GraphQL API."""

    def __init__(self, endpoint: str, token: Optional[str]) -> None:
        self.endpoint = endpoint
        self.token = token

    def _post(self, query: str, variables: Dict[str, Any]) -> Dict[str, Any]:
        if not self.token:
            raise LogicMillError("Logic Mill token missing")

        headers = {
            "Authorization": f"Bearer {self.token}",
            "content-type": "application/json",
        }
        response = requests.post(
            self.endpoint,
            json={"query": query, "variables": variables},
            headers=headers,
            timeout=30,
        )
        if response.status_code != 200:
            logger.error("Logic Mill error: %s", response.text)
            raise LogicMillError(f"Logic Mill request failed with {response.status_code}")
        body = response.json()
        if "errors" in body:
            logger.error("Logic Mill GraphQL errors: %s", body["errors"])
            raise LogicMillError("Logic Mill returned errors")
        return body

    def similarity_search(self, request: SimilarityRequest) -> List[Dict[str, Any]]:
        query = """
        query SimilaritySearch($text: String!, $indices: [String!], $amount: Int, $model: String!) {
          SimilaritySearch(
            text: $text
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
              abstract
              assignees
              applicants
              inventors
              owners
              organizations
            }
          }
        }
        """

        variables = {
            "text": request.text,
            "indices": request.indices,
            "amount": request.amount,
            "model": request.model,
        }

        payload = self._post(query, variables)
        results = payload.get("data", {}).get("SimilaritySearch", [])
        return results

    def advanced_novelty_assessment(self, request: SimilarityRequest) -> NoveltyAssessment:
        """Perform advanced novelty assessment with confidence intervals and risk analysis"""
        try:
            results = self.similarity_search(request)
            
            if not results:
                return self._fallback_novelty_assessment()
            
            # Calculate novelty score with confidence intervals
            scores = [hit.get('score', 0.0) for hit in results]
            novelty_score = 1.0 - max(scores) if scores else 0.5
            
            # Calculate confidence interval (95%)
            if len(scores) > 1:
                mean_score = statistics.mean(scores)
                std_dev = statistics.stdev(scores) if len(scores) > 1 else 0.1
                margin = 1.96 * std_dev / (len(scores) ** 0.5)
                confidence_interval = (max(0, mean_score - margin), min(1, mean_score + margin))
            else:
                confidence_interval = (novelty_score - 0.1, novelty_score + 0.1)
            
            # Assess freedom-to-operate risk
            highest_score = max(scores) if scores else 0.0
            if highest_score > 0.8:
                fto_risk = "HIGH - Strong similarity to existing patents"
            elif highest_score > 0.6:
                fto_risk = "MEDIUM - Moderate similarity detected"
            else:
                fto_risk = "LOW - Limited prior art overlap"
            
            # Create prior art landscape
            prior_art_landscape = []
            for hit in results[:5]:  # Top 5 most similar
                doc = hit.get('document', {})
                prior_art_landscape.append({
                    'id': hit.get('id', ''),
                    'title': doc.get('title', ''),
                    'score': hit.get('score', 0.0),
                    'type': hit.get('index', ''),
                    'assignees': doc.get('assignees', []),
                    'year': self._extract_year_from_id(hit.get('id', ''))
                })
            
            # Analyze claims overlap
            claims_analysis = self._analyze_claims_overlap(results)
            
            return NoveltyAssessment(
                novelty_score=novelty_score,
                confidence_interval=confidence_interval,
                prior_art_landscape=prior_art_landscape,
                freedom_to_operate_risk=fto_risk,
                claims_analysis=claims_analysis
            )
            
        except Exception as e:
            logger.error(f"Error in advanced novelty assessment: {e}")
            return self._fallback_novelty_assessment()
    
    def competitive_intelligence_analysis(self, request: SimilarityRequest) -> CompetitiveIntelligence:
        """Perform comprehensive competitive intelligence analysis"""
        try:
            results = self.similarity_search(request)
            
            if not results:
                return self._fallback_competitive_intelligence()
            
            # Build inventor network
            inventor_network = self._build_inventor_network(results)
            
            # Map institutions and organizations
            institution_mapping = self._map_institutions(results)
            
            # Analyze patent portfolios
            patent_portfolio_analysis = self._analyze_patent_portfolios(results)
            
            # Identify collaboration networks
            collaboration_networks = self._identify_collaborations(results)
            
            # Assess market position
            market_position = self._assess_market_position(results)
            
            return CompetitiveIntelligence(
                inventor_network=inventor_network,
                institution_mapping=institution_mapping,
                patent_portfolio_analysis=patent_portfolio_analysis,
                collaboration_networks=collaboration_networks,
                market_position=market_position
            )
            
        except Exception as e:
             logger.error(f"Error in competitive intelligence analysis: {e}")
             return self._fallback_competitive_intelligence()
    
    def _extract_year_from_id(self, doc_id: str) -> Optional[int]:
        """Extract year from document ID if possible"""
        try:
            # Try to extract year from various ID formats
            if '-' in doc_id:
                parts = doc_id.split('-')
                for part in parts:
                    if part.isdigit() and len(part) == 4 and 1900 <= int(part) <= 2030:
                        return int(part)
            return None
        except:
            return None
    
    def _analyze_claims_overlap(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze potential claims overlap with prior art"""
        claims_analysis = []
        for hit in results[:3]:  # Top 3 most similar
            doc = hit.get('document', {})
            claims_analysis.append({
                'patent_id': hit.get('id', ''),
                'title': doc.get('title', ''),
                'overlap_score': hit.get('score', 0.0),
                'risk_level': 'HIGH' if hit.get('score', 0.0) > 0.7 else 'MEDIUM' if hit.get('score', 0.0) > 0.5 else 'LOW',
                'assignees': doc.get('assignees', [])
            })
        return claims_analysis
    
    def _build_inventor_network(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Build inventor network from search results"""
        inventors = defaultdict(list)
        connections = defaultdict(int)
        
        for hit in results:
            doc = hit.get('document', {})
            doc_inventors = doc.get('inventors', [])
            doc_id = hit.get('id', '')
            
            for inventor in doc_inventors:
                inventors[inventor].append({
                    'document_id': doc_id,
                    'title': doc.get('title', ''),
                    'score': hit.get('score', 0.0)
                })
                
                # Count co-inventor connections
                for co_inventor in doc_inventors:
                    if inventor != co_inventor:
                        key = tuple(sorted([inventor, co_inventor]))
                        connections[key] += 1
        
        # Find top inventors and connections
        top_inventors = sorted(inventors.items(), key=lambda x: len(x[1]), reverse=True)[:10]
        top_connections = sorted(connections.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            'top_inventors': [{'name': name, 'patent_count': len(patents), 'patents': patents[:3]} 
                           for name, patents in top_inventors],
            'key_collaborations': [{'inventors': list(pair), 'collaboration_count': count} 
                                 for pair, count in top_connections],
            'network_density': len(connections) / max(len(inventors), 1)
        }
    
    def _map_institutions(self, results: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """Map institutions and their associated patents/publications"""
        institution_map = defaultdict(list)
        
        for hit in results:
            doc = hit.get('document', {})
            organizations = doc.get('organizations', []) + doc.get('assignees', [])
            
            for org in organizations:
                if org:  # Skip empty strings
                    institution_map[org].append({
                        'document_id': hit.get('id', ''),
                        'title': doc.get('title', ''),
                        'type': hit.get('index', ''),
                        'score': hit.get('score', 0.0)
                    })
        
        # Sort by number of documents
        sorted_institutions = dict(sorted(institution_map.items(), 
                                        key=lambda x: len(x[1]), reverse=True))
        
        return sorted_institutions
    
    def _analyze_patent_portfolios(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze patent portfolios of key assignees"""
        assignee_portfolios = defaultdict(list)
        
        for hit in results:
            if hit.get('index') == 'patents':  # Only analyze patents
                doc = hit.get('document', {})
                assignees = doc.get('assignees', [])
                
                for assignee in assignees:
                    if assignee:
                        assignee_portfolios[assignee].append({
                            'patent_id': hit.get('id', ''),
                            'title': doc.get('title', ''),
                            'similarity_score': hit.get('score', 0.0)
                        })
        
        # Calculate portfolio strength
        portfolio_analysis = {}
        for assignee, patents in assignee_portfolios.items():
            avg_similarity = sum(p['similarity_score'] for p in patents) / len(patents)
            portfolio_analysis[assignee] = {
                'patent_count': len(patents),
                'avg_similarity': avg_similarity,
                'strength': 'HIGH' if avg_similarity > 0.6 else 'MEDIUM' if avg_similarity > 0.4 else 'LOW',
                'top_patents': patents[:3]
            }
        
        return portfolio_analysis
    
    def _identify_collaborations(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify research collaboration networks"""
        collaborations = []
        org_pairs = defaultdict(int)
        
        for hit in results:
            doc = hit.get('document', {})
            orgs = doc.get('organizations', []) + doc.get('assignees', [])
            orgs = [org for org in orgs if org]  # Remove empty strings
            
            # Find organization pairs in the same document
            for i, org1 in enumerate(orgs):
                for org2 in orgs[i+1:]:
                    if org1 != org2:
                        key = tuple(sorted([org1, org2]))
                        org_pairs[key] += 1
        
        # Convert to collaboration list
        for (org1, org2), count in sorted(org_pairs.items(), key=lambda x: x[1], reverse=True)[:10]:
            collaborations.append({
                'organizations': [org1, org2],
                'collaboration_count': count,
                'strength': 'STRONG' if count > 2 else 'MODERATE' if count > 1 else 'WEAK'
            })
        
        return collaborations
    
    def _assess_market_position(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Assess market position based on patent landscape"""
        patent_results = [hit for hit in results if hit.get('index') == 'patents']
        publication_results = [hit for hit in results if hit.get('index') == 'publications']
        
        # Calculate market indicators
        patent_density = len(patent_results) / max(len(results), 1)
        avg_patent_similarity = sum(hit.get('score', 0.0) for hit in patent_results) / max(len(patent_results), 1)
        
        # Assess competitive landscape
        if avg_patent_similarity > 0.7:
            competitive_intensity = 'HIGH'
        elif avg_patent_similarity > 0.5:
            competitive_intensity = 'MEDIUM'
        else:
            competitive_intensity = 'LOW'
        
        return {
            'patent_density': patent_density,
            'competitive_intensity': competitive_intensity,
            'market_maturity': 'MATURE' if patent_density > 0.6 else 'EMERGING',
            'innovation_opportunity': 'LIMITED' if avg_patent_similarity > 0.8 else 'MODERATE' if avg_patent_similarity > 0.6 else 'HIGH',
            'key_players': list(set([assignee for hit in patent_results 
                                   for assignee in hit.get('document', {}).get('assignees', [])]))[:5]
        }
    
    def _fallback_novelty_assessment(self) -> NoveltyAssessment:
        """Fallback novelty assessment when API is unavailable"""
        return NoveltyAssessment(
            novelty_score=0.6,
            confidence_interval=(0.4, 0.8),
            prior_art_landscape=[],
            freedom_to_operate_risk="MEDIUM - Unable to assess due to API unavailability",
            claims_analysis=[]
        )
    
    def _fallback_competitive_intelligence(self) -> CompetitiveIntelligence:
        """Fallback competitive intelligence when API is unavailable"""
        return CompetitiveIntelligence(
            inventor_network={'top_inventors': [], 'key_collaborations': [], 'network_density': 0.0},
            institution_mapping={},
            patent_portfolio_analysis={},
            collaboration_networks=[],
            market_position={'competitive_intensity': 'UNKNOWN', 'market_maturity': 'UNKNOWN'}
        )


def logic_mill_available(token: Optional[str]) -> bool:
    return bool(token)


def get_fallback_hits() -> List[Dict[str, Any]]:
    """Curated sample results based on Max Planck research themes for offline use."""
    return [
        {
            "id": "EP-3216540-A1",
            "score": 0.78,
            "index": "patents",
            "document": {
                "title": "Systems and methods for adaptive catalyst membranes",
                "url": "https://example.com/patent/EP-3216540-A1",
                "abstract": "A catalyst membrane architecture for electrolysis stacks featuring adaptive pore structures.",
                "assignees": ["Max Planck Gesellschaft"],
                "applicants": ["Max Planck Institute for Innovation and Competition"],
                "inventors": ["Anna Schmidt", "Lukas Meyer"],
                "owners": ["MPG"],
                "organizations": ["MPG Innovation"],
            },
        },
        {
            "id": "US-2024029181-A1",
            "score": 0.72,
            "index": "patents",
            "document": {
                "title": "Electrolytic cell with real-time degradation estimation",
                "url": "https://example.com/patent/US-2024029181-A1",
                "abstract": "Electrolytic cell hardware featuring ML-driven degradation estimation for hydrogen production.",
                "assignees": ["GreenHydro GmbH"],
                "applicants": ["TU Munich"],
                "inventors": ["Nora Klein"],
                "owners": ["GreenHydro GmbH"],
                "organizations": ["TU Munich"],
            },
        },
        {
            "id": "W2531412717",
            "score": 0.68,
            "index": "publications",
            "document": {
                "title": "Catalyst durability in proton-exchange membrane electrolysers",
                "url": "https://example.com/publication/W2531412717",
                "abstract": "Study exploring degradation mitigation strategies in PEM electrolysers using adaptive catalysts.",
                "assignees": [],
                "applicants": [],
                "inventors": ["Dr. Elisa Hoffmann"],
                "owners": [],
                "organizations": ["Max Planck Institute", "Technical University Munich"],
            },
        },
        {
            "id": "W2531413001",
            "score": 0.61,
            "index": "publications",
            "document": {
                "title": "Machine learning for early detection of electrolyser failure",
                "url": "https://example.com/publication/W2531413001",
                "abstract": "Machine learning workflow predicting failure patterns in electrolyser membranes.",
                "assignees": [],
                "applicants": [],
                "inventors": ["Prof. Julia Werner"],
                "owners": [],
                "organizations": ["Fraunhofer"],
            },
        },
    ]
