#!/usr/bin/env python3
"""
Logic Mill API Integration Test

This script tests the actual Logic Mill API integration to validate:
1. Data format compliance with API requirements
2. Successful API communication and authentication
3. Proper handling of similarity search results
4. Error handling and recovery mechanisms
"""

import json
import logging
import asyncio
import aiohttp
import os
from typing import Dict, Any, List, Optional
from pathlib import Path
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class LogicMillIntegrationTester:
    """Integration tester for Logic Mill API"""
    
    def __init__(self):
        self.api_endpoint = "https://api.logic-mill.net/api/v1/graphql/"
        # Use the actual token from the documentation
        self.api_token = os.getenv("LOGIC_MILL_API_TOKEN", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJBUEkiLCJleHAiOjI2Mjk3MjQxMzksImlhdCI6MTc1ODgxMjEzOSwiaXNzIjoiTE9HSUMtTUlMTCIsImp0aSI6IjI0MDdlODI1LWIwNzMtNDNjNC1hYzliLTdiMTJjNWMwMTFlNiIsIm5iZiI6MTc1ODgxMjEzOSwicGF5bG9hZCI6eyJ0b2tlbk5hbWUiOiJEZWZhdWx0IEFQSSBUb2tlbiJ9LCJzdWIiOiI1OGMzOTBmYS00NGJhLTQ0NTYtOTY2Ny05ZjE1ZDgyYjc0M2MifQ.BEf4C6r3vb0Hj-qjzxOVKPEmt3mDm8_k5QY91p-aRtE")
        self.test_results = []
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def _create_graphql_query(self) -> str:
        """Create the GraphQL query for Logic Mill API"""
        return """
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
        """
    
    def _create_test_document_parts(self, test_case: str) -> List[Dict[str, str]]:
        """Create test document parts for different scenarios"""
        
        test_cases = {
            "ai_research": [
                {
                    "key": "title",
                    "value": "Deep Learning Architectures for Computer Vision Applications"
                },
                {
                    "key": "abstract",
                    "value": "This research presents novel deep learning architectures specifically designed for computer vision tasks. Our approach combines convolutional neural networks with attention mechanisms to achieve state-of-the-art performance on image classification, object detection, and semantic segmentation tasks. Experimental results demonstrate 96.2% accuracy on ImageNet and 45.3 mAP on COCO dataset."
                },
                {
                    "key": "keywords",
                    "value": "deep learning, computer vision, CNN, attention mechanism, image classification, object detection, neural networks"
                },
                {
                    "key": "technical_specs",
                    "value": "Architecture: ResNet-50 backbone with multi-head attention. Parameters: 25.6M. Training: 100 epochs on 8 V100 GPUs. Inference time: 12ms per image."
                }
            ],
            "biotech_patent": [
                {
                    "key": "title",
                    "value": "Method and Apparatus for CRISPR-Cas9 Gene Editing with Enhanced Precision"
                },
                {
                    "key": "abstract",
                    "value": "The present invention provides methods and apparatus for performing CRISPR-Cas9 gene editing with enhanced precision and reduced off-target effects. The system comprises a modified Cas9 protein with improved specificity, guide RNA optimization algorithms, and real-time monitoring capabilities. Clinical trials demonstrate 99.7% on-target efficiency with less than 0.1% off-target modifications."
                },
                {
                    "key": "keywords",
                    "value": "CRISPR, Cas9, gene editing, biotechnology, genetic engineering, precision medicine, therapeutic applications"
                },
                {
                    "key": "technical_specs",
                    "value": "Modified Cas9 with D10A and H840A mutations. Guide RNA length: 17-20 nucleotides. PAM sequence: NGG. Delivery: lipid nanoparticles. Efficiency: 99.7% on-target."
                }
            ],
            "materials_science": [
                {
                    "key": "title",
                    "value": "Novel Graphene-Based Composite Materials for Energy Storage Applications"
                },
                {
                    "key": "abstract",
                    "value": "This study investigates the synthesis and characterization of graphene-based composite materials for next-generation energy storage devices. The composite exhibits exceptional electrical conductivity (10^6 S/m), mechanical strength (tensile strength: 130 GPa), and electrochemical stability. Battery tests show 95% capacity retention after 10,000 charge-discharge cycles."
                },
                {
                    "key": "keywords",
                    "value": "graphene, composite materials, energy storage, battery technology, electrochemical properties, nanomaterials"
                },
                {
                    "key": "technical_specs",
                    "value": "Synthesis: CVD method at 1000°C. Conductivity: 10^6 S/m. Tensile strength: 130 GPa. Specific capacity: 372 mAh/g. Cycle life: >10,000 cycles."
                }
            ],
            "minimal_valid": [
                {
                    "key": "title",
                    "value": "Machine Learning Algorithm for Data Analysis"
                },
                {
                    "key": "abstract",
                    "value": "A novel machine learning algorithm for efficient data analysis and pattern recognition."
                }
            ],
            "invalid_empty": [],
            "invalid_missing_required": [
                {
                    "key": "keywords",
                    "value": "machine learning, AI, algorithms"
                }
            ]
        }
        
        return test_cases.get(test_case, [])
    
    async def test_api_connectivity(self) -> Dict[str, Any]:
        """Test basic API connectivity and authentication"""
        test_result = {
            "test_name": "API Connectivity",
            "status": "unknown",
            "details": {},
            "errors": []
        }
        
        try:
            # Test with minimal valid request
            query = self._create_graphql_query()
            variables = {
                "data": self._create_test_document_parts("minimal_valid"),
                "indices": ["patents", "publications"],
                "amount": 5,
                "model": "patspecter"
            }
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_token}" if self.api_token else ""
            }
            
            payload = {
                "query": query,
                "variables": variables
            }
            
            logger.info("Testing API connectivity...")
            
            async with self.session.post(
                self.api_endpoint,
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                test_result["details"]["status_code"] = response.status
                test_result["details"]["headers"] = dict(response.headers)
                
                response_text = await response.text()
                test_result["details"]["response_length"] = len(response_text)
                
                if response.status == 200:
                    try:
                        response_data = json.loads(response_text)
                        test_result["details"]["response_structure"] = {
                            "has_data": "data" in response_data,
                            "has_errors": "errors" in response_data,
                            "data_type": type(response_data.get("data")).__name__
                        }
                        
                        if "errors" in response_data:
                            test_result["errors"] = response_data["errors"]
                            test_result["status"] = "failed"
                        else:
                            test_result["status"] = "passed"
                            
                    except json.JSONDecodeError as e:
                        test_result["errors"].append(f"Invalid JSON response: {str(e)}")
                        test_result["status"] = "failed"
                        test_result["details"]["raw_response"] = response_text[:500]
                        
                elif response.status == 401:
                    test_result["errors"].append("Authentication failed - invalid or missing API token")
                    test_result["status"] = "failed"
                elif response.status == 403:
                    test_result["errors"].append("Access forbidden - insufficient permissions")
                    test_result["status"] = "failed"
                else:
                    test_result["errors"].append(f"HTTP {response.status}: {response_text[:200]}")
                    test_result["status"] = "failed"
                    
        except asyncio.TimeoutError:
            test_result["errors"].append("Request timeout - API may be unavailable")
            test_result["status"] = "failed"
        except aiohttp.ClientError as e:
            test_result["errors"].append(f"Network error: {str(e)}")
            test_result["status"] = "failed"
        except Exception as e:
            test_result["errors"].append(f"Unexpected error: {str(e)}")
            test_result["status"] = "failed"
        
        return test_result
    
    async def test_document_processing(self, test_case: str) -> Dict[str, Any]:
        """Test document processing with specific test case"""
        test_result = {
            "test_name": f"Document Processing - {test_case}",
            "status": "unknown",
            "details": {},
            "errors": [],
            "similarity_results": []
        }
        
        try:
            document_parts = self._create_test_document_parts(test_case)
            
            if not document_parts:
                test_result["status"] = "skipped"
                test_result["errors"].append("No document parts for test case")
                return test_result
            
            query = self._create_graphql_query()
            variables = {
                "data": document_parts,
                "indices": ["patents", "publications"],
                "amount": 10,
                "model": "patspecter"
            }
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_token}" if self.api_token else ""
            }
            
            payload = {
                "query": query,
                "variables": variables
            }
            
            test_result["details"]["document_parts_count"] = len(document_parts)
            test_result["details"]["total_content_length"] = sum(len(part["value"]) for part in document_parts)
            
            logger.info(f"Testing document processing for {test_case}...")
            
            async with self.session.post(
                self.api_endpoint,
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=60)
            ) as response:
                test_result["details"]["status_code"] = response.status
                response_text = await response.text()
                
                if response.status == 200:
                    try:
                        response_data = json.loads(response_text)
                        
                        if "errors" in response_data:
                            test_result["errors"] = response_data["errors"]
                            test_result["status"] = "failed"
                        elif "data" in response_data and response_data["data"]:
                            similarity_data = response_data["data"].get("encodeDocumentAndSimilaritySearch", [])
                            
                            test_result["similarity_results"] = similarity_data
                            test_result["details"]["results_count"] = len(similarity_data)
                            
                            if similarity_data:
                                # Analyze result quality
                                scores = [result.get("score", 0) for result in similarity_data]
                                test_result["details"]["score_analysis"] = {
                                    "min_score": min(scores) if scores else 0,
                                    "max_score": max(scores) if scores else 0,
                                    "avg_score": sum(scores) / len(scores) if scores else 0,
                                    "high_quality_results": len([s for s in scores if s > 0.7])
                                }
                                
                                # Check result structure
                                sample_result = similarity_data[0]
                                test_result["details"]["result_structure"] = {
                                    "has_id": "id" in sample_result,
                                    "has_score": "score" in sample_result,
                                    "has_index": "index" in sample_result,
                                    "has_document": "document" in sample_result
                                }
                                
                                if "document" in sample_result:
                                    doc = sample_result["document"]
                                    test_result["details"]["document_structure"] = {
                                        "has_title": "title" in doc,
                                        "has_url": "url" in doc,
                                        "has_embedding": "PatspecterEmbedding" in doc
                                    }
                                
                                test_result["status"] = "passed"
                            else:
                                test_result["status"] = "passed_no_results"
                                test_result["details"]["note"] = "API call successful but no similarity results returned"
                        else:
                            test_result["errors"].append("No data in response")
                            test_result["status"] = "failed"
                            
                    except json.JSONDecodeError as e:
                        test_result["errors"].append(f"Invalid JSON response: {str(e)}")
                        test_result["status"] = "failed"
                else:
                    test_result["errors"].append(f"HTTP {response.status}: {response_text[:200]}")
                    test_result["status"] = "failed"
                    
        except Exception as e:
            test_result["errors"].append(f"Test error: {str(e)}")
            test_result["status"] = "failed"
        
        return test_result
    
    async def test_error_handling(self) -> Dict[str, Any]:
        """Test API error handling with invalid inputs"""
        test_result = {
            "test_name": "Error Handling",
            "status": "unknown",
            "details": {},
            "errors": [],
            "error_scenarios": []
        }
        
        error_scenarios = [
            {
                "name": "Empty document parts",
                "data": [],
                "expected_error": True
            },
            {
                "name": "Missing required fields",
                "data": self._create_test_document_parts("invalid_missing_required"),
                "expected_error": True
            },
            {
                "name": "Invalid model",
                "data": self._create_test_document_parts("minimal_valid"),
                "model": "invalid_model",
                "expected_error": True
            },
            {
                "name": "Invalid indices",
                "data": self._create_test_document_parts("minimal_valid"),
                "indices": ["invalid_index"],
                "expected_error": True
            }
        ]
        
        passed_scenarios = 0
        
        for scenario in error_scenarios:
            scenario_result = {
                "name": scenario["name"],
                "status": "unknown",
                "details": {}
            }
            
            try:
                query = self._create_graphql_query()
                variables = {
                    "data": scenario["data"],
                    "indices": scenario.get("indices", ["patents", "publications"]),
                    "amount": 5,
                    "model": scenario.get("model", "patspecter")
                }
                
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_token}" if self.api_token else ""
                }
                
                payload = {
                    "query": query,
                    "variables": variables
                }
                
                async with self.session.post(
                    self.api_endpoint,
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    scenario_result["details"]["status_code"] = response.status
                    response_text = await response.text()
                    
                    if response.status == 200:
                        try:
                            response_data = json.loads(response_text)
                            has_errors = "errors" in response_data
                            
                            if scenario["expected_error"] and has_errors:
                                scenario_result["status"] = "passed"
                                scenario_result["details"]["error_message"] = response_data["errors"][0].get("message", "Unknown error")
                                passed_scenarios += 1
                            elif not scenario["expected_error"] and not has_errors:
                                scenario_result["status"] = "passed"
                                passed_scenarios += 1
                            else:
                                scenario_result["status"] = "failed"
                                scenario_result["details"]["unexpected_result"] = "Expected error but got success" if scenario["expected_error"] else "Expected success but got error"
                                
                        except json.JSONDecodeError:
                            scenario_result["status"] = "failed"
                            scenario_result["details"]["error"] = "Invalid JSON response"
                    else:
                        if scenario["expected_error"]:
                            scenario_result["status"] = "passed"
                            passed_scenarios += 1
                        else:
                            scenario_result["status"] = "failed"
                            
            except Exception as e:
                scenario_result["status"] = "failed"
                scenario_result["details"]["exception"] = str(e)
            
            test_result["error_scenarios"].append(scenario_result)
        
        test_result["details"]["passed_scenarios"] = passed_scenarios
        test_result["details"]["total_scenarios"] = len(error_scenarios)
        test_result["details"]["success_rate"] = (passed_scenarios / len(error_scenarios)) * 100
        
        if passed_scenarios == len(error_scenarios):
            test_result["status"] = "passed"
        elif passed_scenarios > 0:
            test_result["status"] = "partial"
        else:
            test_result["status"] = "failed"
        
        return test_result
    
    async def run_comprehensive_test(self) -> Dict[str, Any]:
        """Run comprehensive Logic Mill API integration test"""
        logger.info("🚀 Starting Logic Mill API Integration Test")
        logger.info("=" * 60)
        
        test_report = {
            "timestamp": datetime.now().isoformat(),
            "api_endpoint": self.api_endpoint,
            "has_api_token": bool(self.api_token),
            "tests": [],
            "summary": {}
        }
        
        # Test 1: API Connectivity
        connectivity_test = await self.test_api_connectivity()
        test_report["tests"].append(connectivity_test)
        logger.info(f"✅ API Connectivity: {connectivity_test['status'].upper()}")
        
        if connectivity_test["status"] != "passed":
            logger.warning("⚠️ API connectivity failed - skipping document processing tests")
            test_report["summary"] = {
                "total_tests": 1,
                "passed_tests": 0,
                "failed_tests": 1,
                "success_rate": 0.0,
                "overall_status": "failed"
            }
            return test_report
        
        # Test 2: Document Processing Tests
        test_cases = ["ai_research", "biotech_patent", "materials_science", "minimal_valid"]
        
        for test_case in test_cases:
            doc_test = await self.test_document_processing(test_case)
            test_report["tests"].append(doc_test)
            logger.info(f"📄 Document Processing ({test_case}): {doc_test['status'].upper()}")
            
            if doc_test["status"] == "passed" and doc_test["similarity_results"]:
                logger.info(f"   Found {len(doc_test['similarity_results'])} similarity results")
                if doc_test["details"].get("score_analysis"):
                    avg_score = doc_test["details"]["score_analysis"]["avg_score"]
                    logger.info(f"   Average similarity score: {avg_score:.3f}")
        
        # Test 3: Error Handling
        error_test = await self.test_error_handling()
        test_report["tests"].append(error_test)
        logger.info(f"🛡️ Error Handling: {error_test['status'].upper()}")
        
        # Calculate summary
        total_tests = len(test_report["tests"])
        passed_tests = len([t for t in test_report["tests"] if t["status"] in ["passed", "passed_no_results"]])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        test_report["summary"] = {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": success_rate,
            "overall_status": "passed" if success_rate >= 80 else "failed"
        }
        
        return test_report

async def main():
    """Main test runner"""
    
    # Check for API token
    api_token = os.getenv("LOGIC_MILL_API_TOKEN")
    if not api_token:
        logger.warning("⚠️ LOGIC_MILL_API_TOKEN environment variable not set")
        logger.info("This test will attempt to run without authentication")
        logger.info("Some tests may fail due to authentication requirements")
    
    async with LogicMillIntegrationTester() as tester:
        # Run comprehensive test
        report = await tester.run_comprehensive_test()
        
        # Save report
        report_file = Path("logic_mill_integration_test_report.json")
        with open(report_file, "w") as f:
            json.dump(report, f, indent=2)
        
        # Display summary
        logger.info("\n" + "=" * 60)
        logger.info("📊 INTEGRATION TEST SUMMARY")
        logger.info(f"Total Tests: {report['summary']['total_tests']}")
        logger.info(f"Passed: {report['summary']['passed_tests']}")
        logger.info(f"Failed: {report['summary']['failed_tests']}")
        logger.info(f"Success Rate: {report['summary']['success_rate']:.1f}%")
        logger.info(f"Overall Status: {report['summary']['overall_status'].upper()}")
        
        # Display specific issues
        failed_tests = [t for t in report["tests"] if t["status"] == "failed"]
        if failed_tests:
            logger.info("\n❌ FAILED TESTS:")
            for test in failed_tests:
                error_messages = []
                for error in test['errors']:
                    if isinstance(error, dict):
                        error_messages.append(error.get('message', str(error)))
                    else:
                        error_messages.append(str(error))
                logger.info(f"  - {test['test_name']}: {', '.join(error_messages)}")
        
        # Display successful results
        successful_tests = [t for t in report["tests"] if t["status"] in ["passed", "passed_no_results"]]
        if successful_tests:
            logger.info("\n✅ SUCCESSFUL TESTS:")
            for test in successful_tests:
                logger.info(f"  - {test['test_name']}")
                if "similarity_results" in test and test["similarity_results"]:
                    logger.info(f"    Results: {len(test['similarity_results'])} similarity matches")
        
        logger.info(f"\n📄 Detailed report saved to: {report_file.absolute()}")
        
        return report

if __name__ == "__main__":
    asyncio.run(main())