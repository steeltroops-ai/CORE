#!/usr/bin/env python3
"""
Logic Mill API Documentation Review and Validation

This script reviews the Logic Mill API documentation and validates
that our data formatting matches the expected requirements for
the encodeDocumentAndSimilaritySearch GraphQL endpoint.
"""

import json
import logging
import asyncio
from typing import Dict, Any, List
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class LogicMillApiValidator:
    """Validator for Logic Mill API format compliance"""
    
    def __init__(self):
        self.validation_results = []
        self.api_documentation = self._load_api_documentation()
    
    def _load_api_documentation(self) -> Dict[str, Any]:
        """Load Logic Mill API documentation and requirements"""
        return {
            "endpoint": "https://api.logic-mill.net/api/v1/graphql/",
            "authentication": {
                "type": "Bearer Token",
                "header": "Authorization: Bearer <token>"
            },
            "graphql_query": {
                "operation": "encodeDocumentAndSimilaritySearch",
                "query_structure": """
                query embedDocumentAndSimilaritySearch(
                    $data: [EncodeDocumentPart], 
                    $indices: [String], 
                    $amount: Int, 
                    $model: String!
                ) {
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
                """
            },
            "input_format": {
                "data": {
                    "type": "[EncodeDocumentPart]",
                    "description": "Array of document parts with key-value structure",
                    "structure": {
                        "key": "string (part name: title, abstract, keywords, etc.)",
                        "value": "string (content for that part)"
                    },
                    "example": [
                        {"key": "title", "value": "Advanced Neural Networks"},
                        {"key": "abstract", "value": "This paper presents..."},
                        {"key": "keywords", "value": "neural networks, AI, machine learning"}
                    ]
                },
                "indices": {
                    "type": "[String]",
                    "description": "Search indices to query",
                    "valid_values": ["patents", "publications"],
                    "default": ["patents", "publications"]
                },
                "amount": {
                    "type": "Int",
                    "description": "Number of results to return",
                    "default": 25,
                    "range": "1-100"
                },
                "model": {
                    "type": "String!",
                    "description": "Embedding model to use",
                    "valid_values": ["patspecter"],
                    "default": "patspecter"
                }
            },
            "output_format": {
                "structure": {
                    "id": "string (unique identifier)",
                    "score": "float (similarity score 0-1)",
                    "index": "string (source index: patents/publications)",
                    "document": {
                        "title": "string (document title)",
                        "url": "string (document URL)",
                        "PatspecterEmbedding": "[float] (embedding vector)"
                    }
                }
            },
            "best_practices": {
                "document_parts": [
                    "Include title and abstract as minimum required parts",
                    "Add keywords for better search precision",
                    "Include technical specifications when available",
                    "Limit part content to relevant information only",
                    "Use consistent key naming (title, abstract, keywords, technical_specs)"
                ],
                "content_optimization": [
                    "Clean and normalize text content",
                    "Remove excessive whitespace and formatting",
                    "Focus on technical and domain-specific terms",
                    "Include quantitative data and specifications",
                    "Maintain original technical terminology"
                ],
                "search_parameters": [
                    "Use both patents and publications indices for comprehensive results",
                    "Adjust amount based on use case (10-50 for most applications)",
                    "Always use 'patspecter' model for technical documents",
                    "Consider multiple queries for complex documents"
                ]
            },
            "common_issues": {
                "empty_results": [
                    "Document parts may be too generic or lack technical content",
                    "Content may not match the domain of indexed documents",
                    "API token may not have access to specified indices",
                    "Network connectivity issues with Logic Mill servers"
                ],
                "low_quality_results": [
                    "Document parts may need better keyword extraction",
                    "Content may be too broad or unfocused",
                    "Technical terminology may not be properly identified",
                    "Document structure may not be optimally parsed"
                ],
                "api_errors": [
                    "Invalid authentication token",
                    "Malformed GraphQL query structure",
                    "Invalid parameter types or values",
                    "Rate limiting or quota exceeded"
                ]
            }
        }
    
    def validate_document_parts_format(self, document_parts: List[Dict[str, str]]) -> Dict[str, Any]:
        """Validate document parts format against Logic Mill requirements"""
        validation = {
            "is_valid": True,
            "issues": [],
            "recommendations": [],
            "part_analysis": []
        }
        
        if not document_parts:
            validation["is_valid"] = False
            validation["issues"].append("No document parts provided")
            return validation
        
        required_keys = {"title", "abstract"}
        provided_keys = set()
        
        for i, part in enumerate(document_parts):
            part_analysis = {
                "index": i,
                "key": part.get("key", "missing"),
                "value_length": len(part.get("value", "")),
                "is_valid": True,
                "issues": []
            }
            
            # Check required structure
            if "key" not in part:
                part_analysis["is_valid"] = False
                part_analysis["issues"].append("Missing 'key' field")
                validation["is_valid"] = False
            
            if "value" not in part:
                part_analysis["is_valid"] = False
                part_analysis["issues"].append("Missing 'value' field")
                validation["is_valid"] = False
            
            # Check content quality
            if part.get("value", "").strip() == "":
                part_analysis["is_valid"] = False
                part_analysis["issues"].append("Empty value content")
                validation["is_valid"] = False
            
            # Track provided keys
            if "key" in part:
                provided_keys.add(part["key"])
            
            validation["part_analysis"].append(part_analysis)
        
        # Check for required keys
        missing_keys = required_keys - provided_keys
        if missing_keys:
            validation["is_valid"] = False
            validation["issues"].append(f"Missing required keys: {', '.join(missing_keys)}")
        
        # Generate recommendations
        if "keywords" not in provided_keys:
            validation["recommendations"].append("Consider adding 'keywords' part for better search precision")
        
        if "technical_specs" not in provided_keys:
            validation["recommendations"].append("Consider adding 'technical_specs' part for technical documents")
        
        return validation
    
    def validate_graphql_query_structure(self, query_variables: Dict[str, Any]) -> Dict[str, Any]:
        """Validate GraphQL query variables against Logic Mill schema"""
        validation = {
            "is_valid": True,
            "issues": [],
            "parameter_analysis": {}
        }
        
        required_params = ["data", "model"]
        optional_params = ["indices", "amount"]
        
        # Check required parameters
        for param in required_params:
            if param not in query_variables:
                validation["is_valid"] = False
                validation["issues"].append(f"Missing required parameter: {param}")
            else:
                validation["parameter_analysis"][param] = "present"
        
        # Validate data parameter
        if "data" in query_variables:
            data = query_variables["data"]
            if not isinstance(data, list):
                validation["is_valid"] = False
                validation["issues"].append("'data' parameter must be an array")
            else:
                data_validation = self.validate_document_parts_format(data)
                if not data_validation["is_valid"]:
                    validation["is_valid"] = False
                    validation["issues"].extend(data_validation["issues"])
        
        # Validate model parameter
        if "model" in query_variables:
            model = query_variables["model"]
            valid_models = ["patspecter"]
            if model not in valid_models:
                validation["is_valid"] = False
                validation["issues"].append(f"Invalid model '{model}'. Valid models: {', '.join(valid_models)}")
        
        # Validate indices parameter
        if "indices" in query_variables:
            indices = query_variables["indices"]
            valid_indices = ["patents", "publications"]
            if not isinstance(indices, list):
                validation["is_valid"] = False
                validation["issues"].append("'indices' parameter must be an array")
            else:
                invalid_indices = [idx for idx in indices if idx not in valid_indices]
                if invalid_indices:
                    validation["is_valid"] = False
                    validation["issues"].append(f"Invalid indices: {', '.join(invalid_indices)}")
        
        # Validate amount parameter
        if "amount" in query_variables:
            amount = query_variables["amount"]
            if not isinstance(amount, int) or amount < 1 or amount > 100:
                validation["is_valid"] = False
                validation["issues"].append("'amount' parameter must be an integer between 1 and 100")
        
        return validation
    
    def analyze_extraction_quality(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the quality of extracted data for Logic Mill API"""
        analysis = {
            "overall_quality": "unknown",
            "technical_content_score": 0.0,
            "keyword_density": 0.0,
            "domain_specificity": 0.0,
            "recommendations": []
        }
        
        # Analyze title quality
        title = extracted_data.get("title", "")
        title_score = 0.0
        if title:
            # Check for technical terms
            technical_indicators = [
                "system", "method", "apparatus", "device", "process", "algorithm",
                "network", "model", "analysis", "optimization", "enhancement",
                "novel", "improved", "advanced", "efficient", "automated"
            ]
            title_lower = title.lower()
            technical_matches = sum(1 for indicator in technical_indicators if indicator in title_lower)
            title_score = min(technical_matches / 3.0, 1.0)  # Normalize to 0-1
        
        # Analyze abstract quality
        abstract = extracted_data.get("abstract", "")
        abstract_score = 0.0
        if abstract:
            # Check length and technical content
            word_count = len(abstract.split())
            if word_count >= 50:  # Minimum meaningful abstract length
                abstract_score += 0.3
            if word_count >= 100:  # Good abstract length
                abstract_score += 0.3
            
            # Check for quantitative data
            import re
            numbers = re.findall(r'\d+(?:\.\d+)?%?', abstract)
            if numbers:
                abstract_score += 0.2
            
            # Check for technical terminology
            technical_terms = len(re.findall(r'\b[A-Z]{2,}\b', abstract))  # Acronyms
            if technical_terms > 0:
                abstract_score += 0.2
        
        # Analyze keyword quality
        keywords = extracted_data.get("key_technologies", []) + extracted_data.get("technical_keywords", [])
        keyword_score = 0.0
        if keywords:
            # Check keyword count and specificity
            keyword_count = len(keywords)
            if keyword_count >= 3:
                keyword_score += 0.4
            if keyword_count >= 5:
                keyword_score += 0.3
            
            # Check for domain-specific terms
            domain_terms = [
                "AI", "ML", "neural", "quantum", "bio", "nano", "micro", "crypto",
                "blockchain", "IoT", "5G", "semiconductor", "photonic", "genomic"
            ]
            domain_matches = sum(1 for keyword in keywords 
                               for term in domain_terms 
                               if term.lower() in keyword.lower())
            if domain_matches > 0:
                keyword_score += 0.3
        
        # Calculate overall scores
        analysis["technical_content_score"] = (title_score + abstract_score + keyword_score) / 3.0
        analysis["keyword_density"] = len(keywords) / 10.0 if keywords else 0.0  # Normalize to expected range
        analysis["domain_specificity"] = min(analysis["technical_content_score"] * 1.2, 1.0)
        
        # Determine overall quality
        overall_score = (analysis["technical_content_score"] + 
                        analysis["keyword_density"] + 
                        analysis["domain_specificity"]) / 3.0
        
        if overall_score >= 0.8:
            analysis["overall_quality"] = "high"
        elif overall_score >= 0.6:
            analysis["overall_quality"] = "medium"
        else:
            analysis["overall_quality"] = "low"
        
        # Generate recommendations
        if title_score < 0.5:
            analysis["recommendations"].append("Improve title with more technical terminology")
        
        if abstract_score < 0.5:
            analysis["recommendations"].append("Enhance abstract with quantitative data and technical details")
        
        if keyword_score < 0.5:
            analysis["recommendations"].append("Extract more domain-specific keywords and technical terms")
        
        if len(keywords) < 5:
            analysis["recommendations"].append("Increase keyword extraction to at least 5-10 terms")
        
        return analysis
    
    def generate_optimal_document_parts(self, extracted_data: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate optimally formatted document parts for Logic Mill API"""
        document_parts = []
        
        # Title (required)
        title = extracted_data.get("title", "").strip()
        if title:
            document_parts.append({
                "key": "title",
                "value": title
            })
        
        # Abstract (required)
        abstract = extracted_data.get("abstract", "").strip()
        if abstract:
            document_parts.append({
                "key": "abstract",
                "value": abstract
            })
        
        # Keywords (recommended)
        keywords = []
        if "key_technologies" in extracted_data:
            keywords.extend(extracted_data["key_technologies"])
        if "technical_keywords" in extracted_data:
            keywords.extend(extracted_data["technical_keywords"])
        if "patent_keywords" in extracted_data:
            keywords.extend(extracted_data["patent_keywords"])
        
        if keywords:
            # Deduplicate and clean keywords
            unique_keywords = list(set(kw.strip() for kw in keywords if kw.strip()))
            keywords_text = ", ".join(unique_keywords[:10])  # Limit to top 10
            document_parts.append({
                "key": "keywords",
                "value": keywords_text
            })
        
        # Technical specifications (optional)
        tech_specs = []
        if "technical_specifications" in extracted_data:
            tech_specs.extend(extracted_data["technical_specifications"])
        if "methodology" in extracted_data:
            tech_specs.append(f"Methodology: {extracted_data['methodology']}")
        if "findings" in extracted_data:
            tech_specs.append(f"Findings: {extracted_data['findings']}")
        
        if tech_specs:
            specs_text = ". ".join(spec.strip() for spec in tech_specs if spec.strip())
            if specs_text:
                document_parts.append({
                    "key": "technical_specs",
                    "value": specs_text
                })
        
        # Applications (optional)
        applications = extracted_data.get("applications", [])
        if applications:
            apps_text = ", ".join(app.strip() for app in applications if app.strip())
            if apps_text:
                document_parts.append({
                    "key": "applications",
                    "value": apps_text
                })
        
        return document_parts
    
    def validate_complete_pipeline(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate the complete pipeline from extraction to Logic Mill API format"""
        validation_report = {
            "timestamp": asyncio.get_event_loop().time(),
            "extraction_analysis": self.analyze_extraction_quality(extracted_data),
            "document_parts": [],
            "parts_validation": {},
            "query_validation": {},
            "recommendations": [],
            "overall_readiness": "unknown"
        }
        
        # Generate optimal document parts
        document_parts = self.generate_optimal_document_parts(extracted_data)
        validation_report["document_parts"] = document_parts
        
        # Validate document parts format
        parts_validation = self.validate_document_parts_format(document_parts)
        validation_report["parts_validation"] = parts_validation
        
        # Validate complete query structure
        query_variables = {
            "data": document_parts,
            "indices": ["patents", "publications"],
            "amount": 25,
            "model": "patspecter"
        }
        query_validation = self.validate_graphql_query_structure(query_variables)
        validation_report["query_validation"] = query_validation
        
        # Compile recommendations
        recommendations = []
        recommendations.extend(validation_report["extraction_analysis"]["recommendations"])
        recommendations.extend(parts_validation.get("recommendations", []))
        
        if not parts_validation["is_valid"]:
            recommendations.append("Fix document parts format issues before API submission")
        
        if not query_validation["is_valid"]:
            recommendations.append("Fix GraphQL query structure issues before API submission")
        
        validation_report["recommendations"] = recommendations
        
        # Determine overall readiness
        extraction_quality = validation_report["extraction_analysis"]["overall_quality"]
        parts_valid = parts_validation["is_valid"]
        query_valid = query_validation["is_valid"]
        
        if parts_valid and query_valid and extraction_quality in ["high", "medium"]:
            validation_report["overall_readiness"] = "ready"
        elif parts_valid and query_valid:
            validation_report["overall_readiness"] = "ready_with_warnings"
        else:
            validation_report["overall_readiness"] = "not_ready"
        
        return validation_report
    
    def generate_test_report(self) -> Dict[str, Any]:
        """Generate a comprehensive test report for Logic Mill API integration"""
        
        # Test with sample extracted data
        sample_data = {
            "title": "Advanced Neural Network Architectures for Real-Time Image Processing",
            "abstract": "This paper presents novel convolutional neural network architectures optimized for real-time image processing applications. Our approach combines attention mechanisms with efficient convolution operations to achieve 95% accuracy while maintaining sub-millisecond inference times on edge devices.",
            "key_technologies": ["neural networks", "image processing", "attention mechanisms", "edge computing"],
            "technical_keywords": ["CNN", "real-time", "optimization", "inference"],
            "patent_keywords": ["apparatus", "system", "method"],
            "research_domain": "artificial intelligence",
            "methodology": "Hybrid architecture combining depthwise separable convolutions with channel attention modules",
            "findings": "95.2% accuracy on ImageNet with 2.1M parameters and 0.8ms inference time",
            "applications": ["video surveillance", "autonomous vehicles", "mobile AR", "quality control"],
            "confidence_score": 0.95
        }
        
        logger.info("🔍 Generating Logic Mill API Validation Report")
        
        # Validate the complete pipeline
        validation_report = self.validate_complete_pipeline(sample_data)
        
        # Add API documentation reference
        validation_report["api_documentation"] = self.api_documentation
        
        # Add test summary
        validation_report["test_summary"] = {
            "extraction_quality": validation_report["extraction_analysis"]["overall_quality"],
            "parts_format_valid": validation_report["parts_validation"]["is_valid"],
            "query_format_valid": validation_report["query_validation"]["is_valid"],
            "overall_readiness": validation_report["overall_readiness"],
            "total_recommendations": len(validation_report["recommendations"])
        }
        
        return validation_report

async def main():
    """Main validation runner"""
    validator = LogicMillApiValidator()
    
    logger.info("🚀 Starting Logic Mill API Validation")
    logger.info("=" * 60)
    
    # Generate comprehensive validation report
    report = validator.generate_test_report()
    
    # Save report
    report_file = Path("logic_mill_api_validation_report.json")
    with open(report_file, "w") as f:
        json.dump(report, f, indent=2)
    
    # Display summary
    logger.info("\n📊 VALIDATION SUMMARY")
    logger.info(f"Extraction Quality: {report['test_summary']['extraction_quality'].upper()}")
    logger.info(f"Parts Format Valid: {'✅' if report['test_summary']['parts_format_valid'] else '❌'}")
    logger.info(f"Query Format Valid: {'✅' if report['test_summary']['query_format_valid'] else '❌'}")
    logger.info(f"Overall Readiness: {report['test_summary']['overall_readiness'].upper()}")
    logger.info(f"Total Recommendations: {report['test_summary']['total_recommendations']}")
    
    if report["recommendations"]:
        logger.info("\n💡 RECOMMENDATIONS:")
        for i, rec in enumerate(report["recommendations"], 1):
            logger.info(f"{i}. {rec}")
    
    logger.info(f"\n📄 Detailed report saved to: {report_file.absolute()}")
    
    # Display API format example
    logger.info("\n🔧 OPTIMAL API FORMAT EXAMPLE:")
    logger.info("Document Parts:")
    for part in report["document_parts"]:
        logger.info(f"  - {part['key']}: {part['value'][:100]}{'...' if len(part['value']) > 100 else ''}")
    
    logger.info("\nGraphQL Variables:")
    logger.info(json.dumps({
        "data": report["document_parts"],
        "indices": ["patents", "publications"],
        "amount": 25,
        "model": "patspecter"
    }, indent=2))
    
    return report

if __name__ == "__main__":
    asyncio.run(main())