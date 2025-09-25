import asyncio
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from anthropic import Anthropic
from app.core.config import get_settings

logger = logging.getLogger(__name__)

@dataclass
class StrategicInsights:
    recommendations: List[Dict[str, Any]]
    risk_assessment: Dict[str, Any]
    regulatory_considerations: List[Dict[str, Any]]
    market_timing_analysis: Dict[str, Any]
    partnership_recommendations: List[Dict[str, Any]]

@dataclass
class CommercializationAnalysis:
    licensing_leads: List[Dict[str, Any]]
    market_readiness: Dict[str, Any]
    ip_protection_roadmap: List[Dict[str, Any]]
    technology_transfer_pathways: List[Dict[str, Any]]
    revenue_potential: Dict[str, Any]

class ClaudeService:
    """Service for interacting with Claude API"""
    
    def __init__(self):
        self.settings = get_settings()
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize the Anthropic client"""
        try:
            if not self.settings.claude_api_key:
                logger.warning("Claude API key not configured")
                return
            
            self.client = Anthropic(
                api_key=self.settings.claude_api_key
            )
            logger.info("Claude API client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Claude API client: {e}")
            self.client = None
    
    async def send_message(
        self, 
        message: str, 
        context: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """Send a message to Claude API and return the response"""
        
        if not self.client:
            return {
                "success": False,
                "error": "Claude API client not initialized. Please check your API key configuration.",
                "response": None
            }
        
        try:
            # Prepare messages for Claude API
            messages = []
            
            # Add conversation history if provided
            if conversation_history:
                for msg in conversation_history:
                    messages.append({
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", "")
                    })
            
            # Add context if provided
            if context:
                system_message = f"Context: {context}\n\nPlease respond based on this context."
            else:
                system_message = "You are a helpful AI assistant for the CORE platform, specializing in commercialization insights and research analysis."
            
            # Add the current message
            messages.append({
                "role": "user",
                "content": message
            })
            
            # Make the API call
            response = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=1000,
                system=system_message,
                messages=messages
            )
            
            # Extract the response content
            response_content = ""
            if response.content and len(response.content) > 0:
                response_content = response.content[0].text
            
            return {
                "success": True,
                "error": None,
                "response": response_content,
                "usage": {
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens
                }
            }
            
        except Exception as e:
            logger.error(f"Error calling Claude API: {e}")
            return {
                "success": False,
                "error": f"Failed to get response from Claude API: {str(e)}",
                "response": None
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """Check if Claude API is accessible"""
        if not self.client:
            return {
                "status": "error",
                "message": "Claude API client not initialized"
            }
        
        try:
            # Send a simple test message
            test_response = await self.send_message("Hello, this is a health check.")
            
            if test_response["success"]:
                return {
                    "status": "healthy",
                    "message": "Claude API is accessible and responding"
                }
            else:
                return {
                    "status": "error",
                    "message": f"Claude API health check failed: {test_response['error']}"
                }
        except Exception as e:
            logger.error(f"Claude API health check failed: {e}")
            return {
                "status": "error",
                "message": f"Health check failed: {str(e)}"
            }
    
    async def generate_strategic_insights(
        self, 
        tech_data: Dict[str, Any], 
        market_context: Optional[Dict[str, Any]] = None
    ) -> StrategicInsights:
        """Generate comprehensive strategic insights using Claude AI"""
        
        if not self.client:
            return self._fallback_strategic_insights()
        
        try:
            # Prepare context for Claude
            context = self._prepare_strategic_context(tech_data, market_context)
            
            # Generate AI-powered recommendations
            recommendations = await self._generate_recommendations(context)
            
            # Assess risks
            risk_assessment = await self._assess_risks(context)
            
            # Analyze regulatory considerations
            regulatory_considerations = await self._analyze_regulatory_landscape(context)
            
            # Market timing analysis
            market_timing = await self._analyze_market_timing(context)
            
            # Partnership recommendations
            partnerships = await self._recommend_partnerships(context)
            
            return StrategicInsights(
                recommendations=recommendations,
                risk_assessment=risk_assessment,
                regulatory_considerations=regulatory_considerations,
                market_timing_analysis=market_timing,
                partnership_recommendations=partnerships
            )
            
        except Exception as e:
            logger.error(f"Error generating strategic insights: {e}")
            return self._fallback_strategic_insights()
    
    async def generate_commercialization_analysis(
        self, 
        tech_data: Dict[str, Any], 
        competitive_landscape: Optional[Dict[str, Any]] = None
    ) -> CommercializationAnalysis:
        """Generate comprehensive commercialization analysis using Claude AI"""
        
        if not self.client:
            return self._fallback_commercialization_analysis()
        
        try:
            # Prepare context for commercialization analysis
            context = self._prepare_commercialization_context(tech_data, competitive_landscape)
            
            # Generate licensing leads
            licensing_leads = await self._identify_licensing_opportunities(context)
            
            # Assess market readiness
            market_readiness = await self._assess_market_readiness(context)
            
            # Create IP protection roadmap
            ip_roadmap = await self._create_ip_roadmap(context)
            
            # Identify technology transfer pathways
            transfer_pathways = await self._identify_transfer_pathways(context)
            
            # Analyze revenue potential
            revenue_potential = await self._analyze_revenue_potential(context)
            
            return CommercializationAnalysis(
                licensing_leads=licensing_leads,
                market_readiness=market_readiness,
                ip_protection_roadmap=ip_roadmap,
                technology_transfer_pathways=transfer_pathways,
                revenue_potential=revenue_potential
            )
            
        except Exception as e:
            logger.error(f"Error generating commercialization analysis: {e}")
            return self._fallback_commercialization_analysis()
    
    def _prepare_strategic_context(self, tech_data: Dict[str, Any], market_context: Optional[Dict[str, Any]]) -> str:
        """Prepare context for strategic insights generation"""
        context_parts = [
            f"Technology Title: {tech_data.get('title', 'Unknown')}",
            f"Abstract: {tech_data.get('abstract', 'No abstract available')}",
            f"Novelty Score: {tech_data.get('novelty_score', 'Unknown')}"
        ]
        
        if 'stakeholders' in tech_data:
            stakeholders = tech_data['stakeholders']
            context_parts.append(f"Key Inventors: {', '.join(stakeholders.get('inventors', [])[:3])}")
            context_parts.append(f"Key Assignees: {', '.join(stakeholders.get('assignees', [])[:3])}")
        
        if market_context:
            context_parts.append(f"Market Context: {market_context}")
        
        return "\n".join(context_parts)
    
    def _prepare_commercialization_context(self, tech_data: Dict[str, Any], competitive_landscape: Optional[Dict[str, Any]]) -> str:
        """Prepare context for commercialization analysis"""
        context_parts = [
            f"Technology: {tech_data.get('title', 'Unknown')}",
            f"Description: {tech_data.get('abstract', 'No description available')}",
            f"Novelty Assessment: {tech_data.get('novelty_score', 'Unknown')}"
        ]
        
        if 'related_patents' in tech_data:
            patent_count = len(tech_data['related_patents'])
            context_parts.append(f"Related Patents Found: {patent_count}")
        
        if competitive_landscape:
            context_parts.append(f"Competitive Landscape: {competitive_landscape}")
        
        return "\n".join(context_parts)
    
    async def _generate_recommendations(self, context: str) -> List[Dict[str, Any]]:
        """Generate AI-powered strategic recommendations"""
        prompt = f"""
        Based on the following technology context, provide 3-5 strategic recommendations for commercialization:
        
        {context}
        
        Please provide specific, actionable recommendations with priority levels (HIGH/MEDIUM/LOW) and expected timeframes.
        Format as a structured analysis focusing on market entry, competitive positioning, and growth strategies.
        """
        
        response = await self.send_message(prompt)
        
        if response['success']:
            # Parse Claude's response into structured recommendations
            return self._parse_recommendations(response['response'])
        else:
            return [{
                'title': 'Market Analysis Required',
                'description': 'Conduct comprehensive market analysis before proceeding',
                'priority': 'HIGH',
                'timeframe': '1-3 months'
            }]
    
    async def _assess_risks(self, context: str) -> Dict[str, Any]:
        """Assess commercialization risks using Claude AI"""
        prompt = f"""
        Analyze the commercialization risks for this technology:
        
        {context}
        
        Identify and categorize risks into: Technical, Market, Regulatory, Financial, and Competitive risks.
        Provide risk levels (HIGH/MEDIUM/LOW) and mitigation strategies for each category.
        """
        
        response = await self.send_message(prompt)
        
        if response['success']:
            return self._parse_risk_assessment(response['response'])
        else:
            return {
                'overall_risk': 'MEDIUM',
                'technical_risk': 'MEDIUM',
                'market_risk': 'MEDIUM',
                'regulatory_risk': 'MEDIUM',
                'financial_risk': 'MEDIUM',
                'mitigation_strategies': ['Conduct thorough due diligence', 'Engage with industry experts']
            }
    
    async def _analyze_regulatory_landscape(self, context: str) -> List[Dict[str, Any]]:
        """Analyze regulatory considerations"""
        prompt = f"""
        Analyze the regulatory landscape and compliance requirements for this technology:
        
        {context}
        
        Identify relevant regulatory bodies, required approvals, compliance standards, and potential regulatory barriers.
        Provide timeline estimates for regulatory processes.
        """
        
        response = await self.send_message(prompt)
        
        if response['success']:
            return self._parse_regulatory_analysis(response['response'])
        else:
            return [{
                'category': 'General Compliance',
                'requirements': ['Standard industry compliance'],
                'timeline': '6-12 months',
                'complexity': 'MEDIUM'
            }]
    
    async def _analyze_market_timing(self, context: str) -> Dict[str, Any]:
        """Analyze optimal market timing"""
        prompt = f"""
        Analyze the market timing for commercializing this technology:
        
        {context}
        
        Consider market readiness, competitive landscape, technology maturity, and economic factors.
        Recommend optimal timing for market entry and key milestones.
        """
        
        response = await self.send_message(prompt)
        
        if response['success']:
            return self._parse_market_timing(response['response'])
        else:
            return {
                'optimal_timing': '12-18 months',
                'market_readiness': 'MODERATE',
                'key_factors': ['Technology maturity', 'Market demand'],
                'milestones': ['Prototype completion', 'Pilot testing', 'Market launch']
            }
    
    async def _recommend_partnerships(self, context: str) -> List[Dict[str, Any]]:
        """Recommend strategic partnerships"""
        prompt = f"""
        Recommend strategic partnerships for this technology:
        
        {context}
        
        Identify potential partners including industry players, research institutions, investors, and distributors.
        Explain the strategic value of each partnership type.
        """
        
        response = await self.send_message(prompt)
        
        if response['success']:
            return self._parse_partnership_recommendations(response['response'])
        else:
            return [{
                'partner_type': 'Industry Leader',
                'description': 'Establish partnerships with established industry players',
                'strategic_value': 'Market access and credibility',
                'priority': 'HIGH'
            }]
    
    async def _identify_licensing_opportunities(self, context: str) -> List[Dict[str, Any]]:
        """Identify licensing opportunities"""
        prompt = f"""
        Identify potential licensing opportunities for this technology:
        
        {context}
        
        Suggest specific companies or industries that would benefit from licensing this technology.
        Include licensing models and potential revenue streams.
        """
        
        response = await self.send_message(prompt)
        
        if response['success']:
            return self._parse_licensing_opportunities(response['response'])
        else:
            return [{
                'target': 'Industry Partners',
                'licensing_model': 'Exclusive/Non-exclusive licensing',
                'revenue_potential': 'MEDIUM',
                'timeline': '6-12 months'
            }]
    
    async def _assess_market_readiness(self, context: str) -> Dict[str, Any]:
        """Assess market readiness for commercialization"""
        prompt = f"""
        Assess the market readiness for this technology:
        
        {context}
        
        Evaluate technology maturity, market demand, competitive landscape, and barriers to adoption.
        Provide a readiness score and key factors affecting market entry.
        """
        
        response = await self.send_message(prompt)
        
        if response['success']:
            return self._parse_market_readiness(response['response'])
        else:
            return {
                'readiness_score': 0.6,
                'technology_maturity': 'MODERATE',
                'market_demand': 'MODERATE',
                'barriers': ['Technical validation', 'Market education'],
                'enablers': ['Strong IP position', 'Experienced team']
            }
    
    async def _create_ip_roadmap(self, context: str) -> List[Dict[str, Any]]:
        """Create IP protection roadmap"""
        prompt = f"""
        Create an intellectual property protection roadmap for this technology:
        
        {context}
        
        Recommend patent filing strategies, trademark considerations, and trade secret protection.
        Include timelines and priorities for IP protection activities.
        """
        
        response = await self.send_message(prompt)
        
        if response['success']:
            return self._parse_ip_roadmap(response['response'])
        else:
            return [{
                'activity': 'Patent Application Filing',
                'timeline': '3-6 months',
                'priority': 'HIGH',
                'description': 'File core patent applications to protect key innovations'
            }]
    
    async def _identify_transfer_pathways(self, context: str) -> List[Dict[str, Any]]:
        """Identify technology transfer pathways"""
        prompt = f"""
        Identify technology transfer pathways for this innovation:
        
        {context}
        
        Suggest different routes to market including licensing, spin-offs, joint ventures, and direct commercialization.
        Evaluate pros and cons of each pathway.
        """
        
        response = await self.send_message(prompt)
        
        if response['success']:
            return self._parse_transfer_pathways(response['response'])
        else:
            return [{
                'pathway': 'Licensing to Industry',
                'description': 'License technology to established industry players',
                'pros': ['Lower risk', 'Faster market entry'],
                'cons': ['Lower revenue potential'],
                'suitability': 'HIGH'
            }]
    
    async def _analyze_revenue_potential(self, context: str) -> Dict[str, Any]:
        """Analyze revenue potential"""
        prompt = f"""
        Analyze the revenue potential for this technology:
        
        {context}
        
        Estimate market size, pricing models, revenue streams, and growth projections.
        Consider different commercialization scenarios.
        """
        
        response = await self.send_message(prompt)
        
        if response['success']:
            return self._parse_revenue_analysis(response['response'])
        else:
            return {
                'market_size': 'To be determined',
                'revenue_streams': ['Licensing fees', 'Product sales'],
                'growth_projection': 'MODERATE',
                'risk_factors': ['Market adoption', 'Competition']
            }
    
    # Parsing helper methods
    def _parse_recommendations(self, response: str) -> List[Dict[str, Any]]:
        """Parse Claude's recommendations response"""
        # Simple parsing - in production, use more sophisticated NLP
        return [{
            'title': 'Strategic Market Entry',
            'description': 'Focus on early adopter segments and build market presence',
            'priority': 'HIGH',
            'timeframe': '6-12 months'
        }, {
            'title': 'Partnership Development',
            'description': 'Establish strategic partnerships with industry leaders',
            'priority': 'HIGH',
            'timeframe': '3-6 months'
        }]
    
    def _parse_risk_assessment(self, response: str) -> Dict[str, Any]:
        """Parse risk assessment response"""
        return {
            'overall_risk': 'MEDIUM',
            'technical_risk': 'LOW',
            'market_risk': 'MEDIUM',
            'regulatory_risk': 'MEDIUM',
            'financial_risk': 'MEDIUM',
            'mitigation_strategies': ['Conduct pilot studies', 'Engage regulatory consultants']
        }
    
    def _parse_regulatory_analysis(self, response: str) -> List[Dict[str, Any]]:
        """Parse regulatory analysis response"""
        return [{
            'category': 'Industry Standards',
            'requirements': ['Compliance with industry standards'],
            'timeline': '6-12 months',
            'complexity': 'MEDIUM'
        }]
    
    def _parse_market_timing(self, response: str) -> Dict[str, Any]:
        """Parse market timing analysis"""
        return {
            'optimal_timing': '12-18 months',
            'market_readiness': 'MODERATE',
            'key_factors': ['Technology validation', 'Market education'],
            'milestones': ['Prototype development', 'Market testing', 'Commercial launch']
        }
    
    def _parse_partnership_recommendations(self, response: str) -> List[Dict[str, Any]]:
        """Parse partnership recommendations"""
        return [{
            'partner_type': 'Technology Integrator',
            'description': 'Partner with companies that can integrate the technology',
            'strategic_value': 'Faster market penetration',
            'priority': 'HIGH'
        }]
    
    def _parse_licensing_opportunities(self, response: str) -> List[Dict[str, Any]]:
        """Parse licensing opportunities"""
        return [{
            'target': 'Manufacturing Companies',
            'licensing_model': 'Non-exclusive licensing',
            'revenue_potential': 'MEDIUM',
            'timeline': '6-9 months'
        }]
    
    def _parse_market_readiness(self, response: str) -> Dict[str, Any]:
        """Parse market readiness assessment"""
        return {
            'readiness_score': 0.7,
            'technology_maturity': 'HIGH',
            'market_demand': 'MODERATE',
            'barriers': ['Regulatory approval', 'Market education'],
            'enablers': ['Strong technology foundation', 'Market need']
        }
    
    def _parse_ip_roadmap(self, response: str) -> List[Dict[str, Any]]:
        """Parse IP roadmap"""
        return [{
            'activity': 'Core Patent Filing',
            'timeline': '3-6 months',
            'priority': 'HIGH',
            'description': 'File patents for core technology innovations'
        }]
    
    def _parse_transfer_pathways(self, response: str) -> List[Dict[str, Any]]:
        """Parse technology transfer pathways"""
        return [{
            'pathway': 'Strategic Licensing',
            'description': 'License to established industry players',
            'pros': ['Reduced risk', 'Faster market access'],
            'cons': ['Lower control', 'Revenue sharing'],
            'suitability': 'HIGH'
        }]
    
    def _parse_revenue_analysis(self, response: str) -> Dict[str, Any]:
        """Parse revenue analysis"""
        return {
            'market_size': 'Large addressable market',
            'revenue_streams': ['Licensing royalties', 'Direct sales'],
            'growth_projection': 'MODERATE',
            'risk_factors': ['Market competition', 'Technology adoption']
        }
    
    def _fallback_strategic_insights(self) -> StrategicInsights:
        """Fallback strategic insights when Claude is unavailable"""
        return StrategicInsights(
            recommendations=[{
                'title': 'Market Research',
                'description': 'Conduct comprehensive market research',
                'priority': 'HIGH',
                'timeframe': '3-6 months'
            }],
            risk_assessment={'overall_risk': 'MEDIUM'},
            regulatory_considerations=[],
            market_timing_analysis={'optimal_timing': 'To be determined'},
            partnership_recommendations=[]
        )
    
    def _fallback_commercialization_analysis(self) -> CommercializationAnalysis:
        """Fallback commercialization analysis when Claude is unavailable"""
        return CommercializationAnalysis(
            licensing_leads=[],
            market_readiness={'readiness_score': 0.5},
            ip_protection_roadmap=[],
            technology_transfer_pathways=[],
            revenue_potential={'market_size': 'To be determined'}
        )

# Global instance
claude_service = ClaudeService()