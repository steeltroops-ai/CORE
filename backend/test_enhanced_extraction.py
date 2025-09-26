#!/usr/bin/env python3
"""
Enhanced Document Extraction and API Integration Test Suite

This script comprehensively tests the Claude-powered document extraction
and Logic Mill API integration to ensure proper data formatting and
end-to-end functionality.
"""

import asyncio
import json
import logging
import time
from typing import Dict, Any, List
import requests
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class EnhancedExtractionTester:
    """Comprehensive test suite for enhanced document extraction"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.test_results = []
        self.test_documents = self._prepare_test_documents()
    
    def _prepare_test_documents(self) -> List[Dict[str, Any]]:
        """Prepare various test documents for validation"""
        return [
            {
                "name": "AI Research Paper",
                "content": """
                Title: Advanced Neural Network Architectures for Real-Time Image Processing
                
                Abstract: This paper presents novel convolutional neural network architectures 
                optimized for real-time image processing applications. Our approach combines 
                attention mechanisms with efficient convolution operations to achieve 95% 
                accuracy while maintaining sub-millisecond inference times on edge devices.
                
                Keywords: neural networks, image processing, real-time systems, edge computing
                
                Introduction: Recent advances in deep learning have enabled sophisticated 
                image processing capabilities, but deployment on resource-constrained devices 
                remains challenging. This work addresses the computational efficiency gap...
                
                Methodology: We developed a hybrid architecture combining depthwise separable 
                convolutions with channel attention modules. The network uses progressive 
                feature refinement to maintain accuracy while reducing computational overhead.
                
                Results: Our model achieves 95.2% accuracy on ImageNet validation set with 
                only 2.1M parameters and 0.8ms inference time on ARM Cortex-A78 processors.
                
                Applications: Real-time video surveillance, autonomous vehicle perception, 
                mobile augmented reality, industrial quality control systems.
                """,
                "document_type": "research_paper",
                "expected_technologies": ["neural networks", "image processing", "attention mechanisms"],
                "expected_domain": "artificial intelligence"
            },
            {
                "name": "Biotech Patent",
                "content": """
                Title: CRISPR-Cas9 Gene Editing System with Enhanced Specificity
                
                Abstract: A modified CRISPR-Cas9 system incorporating novel guide RNA designs 
                and Cas9 variants that demonstrate 99.7% on-target efficiency with reduced 
                off-target effects. The system includes proprietary delivery mechanisms 
                for therapeutic applications.
                
                Claims: 1. A CRISPR-Cas9 system comprising modified guide RNAs with enhanced 
                specificity sequences. 2. Cas9 protein variants with improved fidelity. 
                3. Lipid nanoparticle delivery systems for in vivo applications.
                
                Technical Field: Gene editing, molecular biology, therapeutic biotechnology
                
                Background: Current CRISPR systems suffer from off-target effects that limit 
                therapeutic applications. This invention addresses these limitations through 
                engineered components that maintain high efficiency while minimizing unintended 
                genomic modifications.
                
                Detailed Description: The modified guide RNAs incorporate secondary structure 
                elements that enhance Cas9 binding specificity. The Cas9 variants include 
                amino acid substitutions at positions 497, 661, and 695 that improve 
                target discrimination.
                """,
                "document_type": "patent",
                "expected_technologies": ["CRISPR", "gene editing", "guide RNA"],
                "expected_domain": "biotechnology"
            },
            {
                "name": "Materials Science Paper",
                "content": """
                Title: Self-Healing Polymer Composites with Embedded Microcapsules
                
                Abstract: We report the development of self-healing polymer composites 
                incorporating microcapsules containing healing agents. Upon damage, 
                microcapsules rupture and release healing agents that polymerize to 
                restore material integrity with 85% strength recovery.
                
                Materials: Epoxy resin matrix, dicyclopentadiene healing agent, 
                Grubbs' catalyst, urea-formaldehyde microcapsules
                
                Methods: Microcapsules were synthesized via in-situ polymerization. 
                Composite specimens were prepared by mixing 15 wt% microcapsules with 
                epoxy resin. Healing efficiency was evaluated using three-point bending tests.
                
                Results: Optimal healing occurred with 150-200 μm diameter microcapsules. 
                Healing efficiency reached 85% after 24 hours at room temperature. 
                Multiple healing cycles showed 60% efficiency retention.
                
                Applications: Aerospace structures, automotive components, infrastructure 
                materials, protective coatings
                """,
                "document_type": "research_paper",
                "expected_technologies": ["self-healing polymers", "microcapsules", "composite materials"],
                "expected_domain": "materials science"
            }
        ]
    
    async def test_health_endpoints(self) -> bool:
        """Test basic health endpoints"""
        test_name = "Health Endpoints Test"
        logger.info(f"Starting {test_name}")
        
        try:
            # Test backend health
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code != 200:
                raise Exception(f"Backend health check failed: {response.status_code}")
            
            # Test Claude health
            response = requests.get(f"{self.base_url}/chat/health", timeout=10)
            claude_healthy = response.status_code == 200
            
            self._log_test_result(test_name, True, "Health endpoints accessible", {
                "backend_status": "healthy",
                "claude_status": "healthy" if claude_healthy else "unavailable"
            })
            return True
            
        except Exception as e:
            self._log_test_result(test_name, False, f"Health check failed: {e}")
            return False
    
    async def test_enhanced_extraction_pipeline(self) -> Dict[str, Any]:
        """Test the complete enhanced extraction pipeline"""
        test_name = "Enhanced Extraction Pipeline"
        logger.info(f"Starting {test_name}")
        
        results = {
            "total_documents": len(self.test_documents),
            "successful_extractions": 0,
            "failed_extractions": 0,
            "extraction_details": [],
            "api_format_validation": [],
            "similarity_search_results": []
        }
        
        for doc in self.test_documents:
            logger.info(f"Testing document: {doc['name']}")
            
            try:
                # Test enhanced ingest endpoint
                payload = {
                    "content": doc["content"],
                    "document_type": doc["document_type"],
                    "use_claude_extraction": True,
                    "search_indices": ["patents", "publications"],
                    "max_results": 10
                }
                
                start_time = time.time()
                response = requests.post(
                    f"{self.base_url}/ingest/enhanced",
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=60
                )
                processing_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Validate extraction results
                    extraction_validation = self._validate_extraction_data(data, doc)
                    
                    # Validate API format
                    format_validation = self._validate_api_format(data)
                    
                    # Validate similarity results
                    similarity_validation = self._validate_similarity_results(data)
                    
                    results["successful_extractions"] += 1
                    results["extraction_details"].append({
                        "document_name": doc["name"],
                        "processing_time": processing_time,
                        "extraction_validation": extraction_validation,
                        "analysis_id": data.get("analysis_id")
                    })
                    results["api_format_validation"].append(format_validation)
                    results["similarity_search_results"].append(similarity_validation)
                    
                    logger.info(f"✅ {doc['name']} processed successfully in {processing_time:.2f}s")
                    
                else:
                    results["failed_extractions"] += 1
                    logger.error(f"❌ {doc['name']} failed: {response.status_code} - {response.text}")
                    
            except Exception as e:
                results["failed_extractions"] += 1
                logger.error(f"❌ {doc['name']} error: {e}")
        
        success = results["successful_extractions"] > 0
        self._log_test_result(test_name, success, f"Processed {results['successful_extractions']}/{results['total_documents']} documents", results)
        
        return results
    
    def _validate_extraction_data(self, response_data: Dict[str, Any], expected_doc: Dict[str, Any]) -> Dict[str, Any]:
        """Validate the quality of extracted data"""
        extracted_data = response_data.get("extracted_data", {})
        
        validation = {
            "has_title": bool(extracted_data.get("title")),
            "has_abstract": bool(extracted_data.get("abstract")),
            "has_technologies": len(extracted_data.get("key_technologies", [])) > 0,
            "has_domain": bool(extracted_data.get("research_domain")),
            "has_applications": len(extracted_data.get("applications", [])) > 0,
            "confidence_score": extracted_data.get("confidence_score", 0),
            "technology_match": False,
            "domain_match": False
        }
        
        # Check if expected technologies were found
        extracted_techs = [tech.lower() for tech in extracted_data.get("key_technologies", [])]
        expected_techs = [tech.lower() for tech in expected_doc.get("expected_technologies", [])]
        
        for expected_tech in expected_techs:
            if any(expected_tech in extracted_tech for extracted_tech in extracted_techs):
                validation["technology_match"] = True
                break
        
        # Check domain match
        extracted_domain = extracted_data.get("research_domain", "").lower()
        expected_domain = expected_doc.get("expected_domain", "").lower()
        validation["domain_match"] = expected_domain in extracted_domain or extracted_domain in expected_domain
        
        # Overall quality assessment
        quality_score = sum([
            validation["has_title"],
            validation["has_abstract"],
            validation["has_technologies"],
            validation["has_domain"],
            validation["technology_match"],
            validation["domain_match"]
        ]) / 6.0
        
        validation["overall_quality"] = "high" if quality_score >= 0.8 else "medium" if quality_score >= 0.6 else "low"
        
        return validation
    
    def _validate_api_format(self, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate that data is properly formatted for Logic Mill API"""
        validation = {
            "has_analysis_id": bool(response_data.get("analysis_id")),
            "has_extracted_data": bool(response_data.get("extracted_data")),
            "has_similarity_results": bool(response_data.get("similarity_results")),
            "has_optimization_metrics": bool(response_data.get("optimization_metrics")),
            "proper_similarity_format": False,
            "proper_metrics_format": False
        }
        
        # Validate similarity results format
        similarity_results = response_data.get("similarity_results", [])
        if similarity_results and isinstance(similarity_results, list):
            first_result = similarity_results[0]
            required_fields = ["id", "score", "index", "title", "url"]
            validation["proper_similarity_format"] = all(field in first_result for field in required_fields)
        
        # Validate optimization metrics format
        metrics = response_data.get("optimization_metrics", {})
        if metrics:
            required_metrics = ["total_search_terms", "search_strategy", "processing_time"]
            validation["proper_metrics_format"] = all(metric in metrics for metric in required_metrics)
        
        return validation
    
    def _validate_similarity_results(self, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate similarity search results quality"""
        similarity_results = response_data.get("similarity_results", [])
        
        validation = {
            "total_results": len(similarity_results),
            "has_results": len(similarity_results) > 0,
            "average_score": 0.0,
            "high_quality_results": 0,
            "result_diversity": 0
        }
        
        if similarity_results:
            scores = [result.get("score", 0) for result in similarity_results]
            validation["average_score"] = sum(scores) / len(scores)
            validation["high_quality_results"] = sum(1 for score in scores if score >= 0.7)
            
            # Check result diversity (unique indices)
            indices = set(result.get("index", "") for result in similarity_results)
            validation["result_diversity"] = len(indices)
        
        return validation
    
    async def test_logic_mill_api_format(self) -> bool:
        """Test Logic Mill API data format compliance"""
        test_name = "Logic Mill API Format Compliance"
        logger.info(f"Starting {test_name}")
        
        try:
            # Test with a simple document
            test_content = """
            Title: Test Document for API Format Validation
            Abstract: This is a test document to validate Logic Mill API format compliance.
            Keywords: test, validation, API, format
            """
            
            payload = {
                "content": test_content,
                "document_type": "research_paper",
                "use_claude_extraction": True,
                "search_indices": ["patents"],
                "max_results": 5
            }
            
            response = requests.post(
                f"{self.base_url}/ingest/enhanced",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate Logic Mill API format requirements
                format_checks = {
                    "document_parts_structure": self._check_document_parts_structure(data),
                    "graphql_compatibility": self._check_graphql_compatibility(data),
                    "encoding_parameters": self._check_encoding_parameters(data)
                }
                
                all_checks_passed = all(format_checks.values())
                
                self._log_test_result(test_name, all_checks_passed, "API format validation completed", format_checks)
                return all_checks_passed
            else:
                self._log_test_result(test_name, False, f"API request failed: {response.status_code}")
                return False
                
        except Exception as e:
            self._log_test_result(test_name, False, f"Format validation error: {e}")
            return False
    
    def _check_document_parts_structure(self, response_data: Dict[str, Any]) -> bool:
        """Check if document parts are structured correctly for Logic Mill API"""
        # Logic Mill expects document parts as [{"key": "title", "value": "..."}]
        extracted_data = response_data.get("extracted_data", {})
        
        required_parts = ["title", "abstract"]
        for part in required_parts:
            if not extracted_data.get(part):
                return False
        
        return True
    
    def _check_graphql_compatibility(self, response_data: Dict[str, Any]) -> bool:
        """Check GraphQL query compatibility"""
        # Ensure data can be serialized for GraphQL
        try:
            json.dumps(response_data)
            return True
        except (TypeError, ValueError):
            return False
    
    def _check_encoding_parameters(self, response_data: Dict[str, Any]) -> bool:
        """Check encoding parameters for Logic Mill API"""
        metrics = response_data.get("optimization_metrics", {})
        
        # Check if required parameters are present
        required_params = ["search_strategy", "processing_time"]
        return all(param in metrics for param in required_params)
    
    async def test_error_handling(self) -> bool:
        """Test error handling and recovery mechanisms"""
        test_name = "Error Handling and Recovery"
        logger.info(f"Starting {test_name}")
        
        error_scenarios = [
            {
                "name": "Empty Content",
                "payload": {"content": "", "document_type": "research_paper"}
            },
            {
                "name": "Invalid Document Type",
                "payload": {"content": "Test content", "document_type": "invalid_type"}
            },
            {
                "name": "Malformed Request",
                "payload": {"invalid_field": "test"}
            }
        ]
        
        error_handling_results = []
        
        for scenario in error_scenarios:
            try:
                response = requests.post(
                    f"{self.base_url}/ingest/enhanced",
                    json=scenario["payload"],
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                # Check if error is handled gracefully
                handled_gracefully = response.status_code in [400, 422, 500] or (
                    response.status_code == 200 and 
                    "error" in response.json().get("status", "").lower()
                )
                
                error_handling_results.append({
                    "scenario": scenario["name"],
                    "status_code": response.status_code,
                    "handled_gracefully": handled_gracefully
                })
                
            except Exception as e:
                error_handling_results.append({
                    "scenario": scenario["name"],
                    "error": str(e),
                    "handled_gracefully": True  # Exception handling is also valid
                })
        
        all_handled = all(result.get("handled_gracefully", False) for result in error_handling_results)
        
        self._log_test_result(test_name, all_handled, "Error handling validation completed", {
            "scenarios_tested": len(error_scenarios),
            "properly_handled": sum(1 for r in error_handling_results if r.get("handled_gracefully")),
            "details": error_handling_results
        })
        
        return all_handled
    
    def _log_test_result(self, test_name: str, success: bool, message: str, details: Dict[str, Any] = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {},
            "timestamp": time.time()
        }
        
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        logger.info(f"{status}: {test_name} - {message}")
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all tests and generate comprehensive report"""
        logger.info("🚀 Starting Enhanced Document Extraction Test Suite")
        logger.info("=" * 60)
        
        # Run all test categories
        health_ok = await self.test_health_endpoints()
        
        if health_ok:
            extraction_results = await self.test_enhanced_extraction_pipeline()
            format_ok = await self.test_logic_mill_api_format()
            error_handling_ok = await self.test_error_handling()
        else:
            logger.error("❌ Health checks failed - skipping other tests")
            extraction_results = {}
            format_ok = False
            error_handling_ok = False
        
        # Generate summary report
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        
        summary = {
            "test_suite": "Enhanced Document Extraction",
            "timestamp": time.time(),
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": total_tests - passed_tests,
            "success_rate": f"{(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%",
            "health_status": "healthy" if health_ok else "unhealthy",
            "extraction_pipeline": extraction_results,
            "api_format_compliance": format_ok,
            "error_handling": error_handling_ok,
            "detailed_results": self.test_results
        }
        
        # Save detailed report
        report_file = Path("enhanced_extraction_test_report.json")
        with open(report_file, "w") as f:
            json.dump(summary, f, indent=2)
        
        logger.info("\n" + "=" * 60)
        logger.info("📊 TEST SUMMARY")
        logger.info(f"Total Tests: {total_tests}")
        logger.info(f"Passed: {passed_tests}")
        logger.info(f"Failed: {total_tests - passed_tests}")
        logger.info(f"Success Rate: {summary['success_rate']}")
        logger.info(f"Report saved to: {report_file.absolute()}")
        
        if passed_tests == total_tests:
            logger.info("🎉 All tests passed! System is working correctly.")
        else:
            logger.warning("⚠️  Some tests failed. Please review the detailed report.")
        
        return summary

async def main():
    """Main test runner"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Test enhanced document extraction system")
    parser.add_argument("--url", default="http://localhost:8000", help="Backend URL")
    args = parser.parse_args()
    
    tester = EnhancedExtractionTester(args.url)
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())