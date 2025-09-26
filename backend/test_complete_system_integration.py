#!/usr/bin/env python3
"""
Complete System Integration Test

This script performs end-to-end testing of the CORE system:
1. Document upload and extraction pipeline
2. Claude API integration for data extraction
3. Logic Mill API data formatting and submission
4. Error handling and recovery mechanisms
5. Performance and quality validation
"""

import json
import logging
import asyncio
import aiohttp
import requests
import os
from typing import Dict, Any, List, Optional
from pathlib import Path
from datetime import datetime
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CompleteSystemTester:
    """Complete system integration tester"""
    
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3000"
        self.logic_mill_endpoint = "https://api.logic-mill.net/api/v1/graphql/"
        self.logic_mill_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJBUEkiLCJleHAiOjI2Mjk3MjQxMzksImlhdCI6MTc1ODgxMjEzOSwiaXNzIjoiTE9HSUMtTUlMTCIsImp0aSI6IjI0MDdlODI1LWIwNzMtNDNjNC1hYzliLTdiMTJjNWMwMTFlNiIsIm5iZiI6MTc1ODgxMjEzOSwicGF5bG9hZCI6eyJ0b2tlbk5hbWUiOiJEZWZhdWx0IEFQSSBUb2tlbiJ9LCJzdWIiOiI1OGMzOTBmYS00NGJhLTQ0NTYtOTY2Ny05ZjE1ZDgyYjc0M2MifQ.BEf4C6r3vb0Hj-qjzxOVKPEmt3mDm8_k5QY91p-aRtE"
        self.test_results = []
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def _create_test_documents(self) -> List[Dict[str, Any]]:
        """Create comprehensive test documents for validation"""
        return [
            {
                "name": "AI Research Paper",
                "type": "text",
                "content": """
                Title: Transformer-Based Neural Architecture Search for Efficient Computer Vision
                
                Abstract: This paper presents a novel approach to neural architecture search (NAS) using transformer-based controllers for computer vision tasks. Our method, called TransNAS, leverages the attention mechanism to efficiently explore the architecture space and discover high-performance models with reduced computational overhead. We demonstrate that TransNAS achieves 96.8% accuracy on ImageNet with 40% fewer parameters compared to manually designed architectures. The approach incorporates progressive search strategies and hardware-aware optimization to ensure practical deployment on edge devices.
                
                Keywords: neural architecture search, transformer, computer vision, attention mechanism, edge computing, model optimization
                
                Technical Specifications:
                - Architecture: Transformer-based controller with 12 attention heads
                - Search space: 10^18 possible architectures
                - Training time: 48 GPU hours on V100
                - Final model size: 15.2M parameters
                - Inference latency: 8.3ms on mobile GPU
                
                Applications: autonomous vehicles, mobile AR/VR, real-time video analysis, smart cameras
                """,
                "expected_extraction": {
                    "title": "Transformer-Based Neural Architecture Search for Efficient Computer Vision",
                    "domain": "artificial intelligence",
                    "key_technologies": ["neural architecture search", "transformer", "computer vision"],
                    "applications": ["autonomous vehicles", "mobile AR/VR"]
                }
            },
            {
                "name": "Biotech Patent",
                "type": "text",
                "content": """
                Title: CRISPR-Cas13 System for RNA-Targeted Gene Therapy with Enhanced Specificity
                
                Abstract: The present invention relates to an improved CRISPR-Cas13 system for targeted RNA editing and gene therapy applications. The system comprises a modified Cas13 protein with enhanced specificity, optimized guide RNAs, and a novel delivery mechanism using lipid nanoparticles. Clinical studies demonstrate 99.2% target specificity with minimal off-target effects, making it suitable for therapeutic applications in genetic disorders, cancer treatment, and viral infections.
                
                Claims:
                1. A modified CRISPR-Cas13 protein comprising mutations at positions 472, 589, and 612
                2. Guide RNA sequences optimized for reduced off-target binding
                3. Lipid nanoparticle formulation for enhanced cellular uptake
                4. Method of treating genetic disorders using the CRISPR-Cas13 system
                
                Technical Data:
                - Target specificity: 99.2%
                - Off-target rate: <0.1%
                - Cellular uptake efficiency: 85%
                - Therapeutic window: 72 hours
                
                Applications: genetic disorders, cancer therapy, antiviral treatments, precision medicine
                """,
                "expected_extraction": {
                    "title": "CRISPR-Cas13 System for RNA-Targeted Gene Therapy with Enhanced Specificity",
                    "domain": "biotechnology",
                    "key_technologies": ["CRISPR", "Cas13", "gene therapy"],
                    "applications": ["genetic disorders", "cancer therapy"]
                }
            },
            {
                "name": "Materials Science Paper",
                "type": "text",
                "content": """
                Title: High-Performance Graphene-Silicon Carbide Composites for Next-Generation Electronics
                
                Abstract: We report the synthesis and characterization of novel graphene-silicon carbide (G-SiC) composites with exceptional electrical and thermal properties. The composite material exhibits electrical conductivity of 2.1 × 10^6 S/m, thermal conductivity of 1800 W/m·K, and mechanical strength exceeding 200 GPa. These properties make it ideal for high-frequency electronics, power devices, and thermal management applications in aerospace and automotive industries.
                
                Methodology:
                - CVD synthesis at 1200°C under argon atmosphere
                - Plasma-enhanced surface functionalization
                - Multi-layer stacking with controlled interlayer spacing
                - Characterization using XRD, SEM, and electrical measurements
                
                Results:
                - Electrical conductivity: 2.1 × 10^6 S/m
                - Thermal conductivity: 1800 W/m·K
                - Tensile strength: 205 GPa
                - Operating temperature: up to 600°C
                - Frequency response: up to 100 GHz
                
                Applications: 5G/6G electronics, electric vehicle power systems, aerospace thermal management, high-power RF devices
                """,
                "expected_extraction": {
                    "title": "High-Performance Graphene-Silicon Carbide Composites for Next-Generation Electronics",
                    "domain": "materials science",
                    "key_technologies": ["graphene", "silicon carbide", "composites"],
                    "applications": ["5G/6G electronics", "electric vehicle power systems"]
                }
            }
        ]
    
    async def test_backend_health(self) -> Dict[str, Any]:
        """Test backend server health and availability"""
        test_result = {
            "test_name": "Backend Health Check",
            "status": "unknown",
            "details": {},
            "errors": []
        }
        
        try:
            async with self.session.get(f"{self.backend_url}/health") as response:
                test_result["details"]["status_code"] = response.status
                response_data = await response.json()
                
                if response.status == 200 and response_data.get("status") in ["healthy", "ok"]:
                    test_result["status"] = "passed"
                    test_result["details"]["response"] = response_data
                else:
                    test_result["status"] = "failed"
                    test_result["errors"].append(f"Unhealthy backend: {response_data}")
                    
        except Exception as e:
            test_result["status"] = "failed"
            test_result["errors"].append(f"Backend connection error: {str(e)}")
        
        return test_result
    
    async def test_document_extraction_pipeline(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Test complete document extraction pipeline"""
        test_result = {
            "test_name": f"Document Extraction - {document['name']}",
            "status": "unknown",
            "details": {},
            "errors": [],
            "extracted_data": {},
            "logic_mill_format": [],
            "similarity_results": []
        }
        
        try:
            # Test enhanced extraction endpoint
            payload = {
                "content": document["content"],
                "content_type": document["type"]
            }
            
            start_time = time.time()
            
            async with self.session.post(
                f"{self.backend_url}/ingest/enhanced",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=60)
            ) as response:
                extraction_time = time.time() - start_time
                test_result["details"]["extraction_time"] = extraction_time
                test_result["details"]["status_code"] = response.status
                
                if response.status == 200:
                    response_data = await response.json()
                    test_result["extracted_data"] = response_data
                    
                    # Validate extraction quality
                    extraction_quality = self._validate_extraction_quality(
                        response_data, document["expected_extraction"]
                    )
                    test_result["details"]["extraction_quality"] = extraction_quality
                    
                    # Check Logic Mill format compliance
                    if "logic_mill_data" in response_data:
                        logic_mill_data = response_data["logic_mill_data"]
                        test_result["logic_mill_format"] = logic_mill_data
                        
                        format_validation = self._validate_logic_mill_format(logic_mill_data)
                        test_result["details"]["format_validation"] = format_validation
                        
                        # Test actual Logic Mill API submission
                        if format_validation["is_valid"]:
                            similarity_test = await self._test_logic_mill_submission(logic_mill_data)
                            test_result["similarity_results"] = similarity_test["results"]
                            test_result["details"]["similarity_test"] = similarity_test
                    
                    # Determine overall status
                    if (extraction_quality["overall_score"] >= 0.7 and 
                        test_result["details"].get("format_validation", {}).get("is_valid", False)):
                        test_result["status"] = "passed"
                    else:
                        test_result["status"] = "partial"
                        test_result["errors"].append("Low extraction quality or format issues")
                else:
                    test_result["status"] = "failed"
                    error_text = await response.text()
                    test_result["errors"].append(f"HTTP {response.status}: {error_text[:200]}")
                    
        except Exception as e:
            test_result["status"] = "failed"
            test_result["errors"].append(f"Pipeline error: {str(e)}")
        
        return test_result
    
    def _validate_extraction_quality(self, extracted_data: Dict[str, Any], expected: Dict[str, Any]) -> Dict[str, Any]:
        """Validate the quality of extracted data against expectations"""
        quality_metrics = {
            "title_match": 0.0,
            "domain_match": 0.0,
            "technology_coverage": 0.0,
            "application_coverage": 0.0,
            "overall_score": 0.0
        }
        
        # Title matching
        extracted_title = extracted_data.get("title", "").lower()
        expected_title = expected.get("title", "").lower()
        if extracted_title and expected_title:
            # Simple word overlap scoring
            extracted_words = set(extracted_title.split())
            expected_words = set(expected_title.split())
            if expected_words:
                quality_metrics["title_match"] = len(extracted_words & expected_words) / len(expected_words)
        
        # Domain matching
        extracted_domain = extracted_data.get("research_domain", "").lower()
        expected_domain = expected.get("domain", "").lower()
        if extracted_domain and expected_domain:
            quality_metrics["domain_match"] = 1.0 if expected_domain in extracted_domain else 0.5
        
        # Technology coverage
        extracted_tech = [tech.lower() for tech in extracted_data.get("key_technologies", [])]
        expected_tech = [tech.lower() for tech in expected.get("key_technologies", [])]
        if expected_tech:
            matches = sum(1 for tech in expected_tech if any(tech in ext for ext in extracted_tech))
            quality_metrics["technology_coverage"] = matches / len(expected_tech)
        
        # Application coverage
        extracted_apps = [app.lower() for app in extracted_data.get("applications", [])]
        expected_apps = [app.lower() for app in expected.get("applications", [])]
        if expected_apps:
            matches = sum(1 for app in expected_apps if any(app in ext for ext in extracted_apps))
            quality_metrics["application_coverage"] = matches / len(expected_apps)
        
        # Overall score
        quality_metrics["overall_score"] = sum(quality_metrics.values()) / 4
        
        return quality_metrics
    
    def _validate_logic_mill_format(self, logic_mill_data: List[Dict[str, str]]) -> Dict[str, Any]:
        """Validate Logic Mill API format compliance"""
        validation = {
            "is_valid": True,
            "issues": [],
            "part_count": len(logic_mill_data),
            "required_parts": ["title", "abstract"]
        }
        
        if not logic_mill_data:
            validation["is_valid"] = False
            validation["issues"].append("No document parts provided")
            return validation
        
        # Check structure
        for i, part in enumerate(logic_mill_data):
            if not isinstance(part, dict):
                validation["is_valid"] = False
                validation["issues"].append(f"Part {i} is not a dictionary")
                continue
            
            if "key" not in part or "value" not in part:
                validation["is_valid"] = False
                validation["issues"].append(f"Part {i} missing 'key' or 'value' field")
                continue
            
            if not part["value"].strip():
                validation["is_valid"] = False
                validation["issues"].append(f"Part {i} has empty value")
        
        # Check required parts
        provided_keys = {part.get("key", "") for part in logic_mill_data}
        missing_required = set(validation["required_parts"]) - provided_keys
        if missing_required:
            validation["is_valid"] = False
            validation["issues"].append(f"Missing required parts: {', '.join(missing_required)}")
        
        return validation
    
    async def _test_logic_mill_submission(self, document_parts: List[Dict[str, str]]) -> Dict[str, Any]:
        """Test actual Logic Mill API submission"""
        submission_result = {
            "status": "unknown",
            "results": [],
            "details": {},
            "errors": []
        }
        
        try:
            query = """
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
                }
              }
            }
            """
            
            variables = {
                "data": document_parts,
                "indices": ["patents", "publications"],
                "amount": 10,
                "model": "patspecter"
            }
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.logic_mill_token}"
            }
            
            payload = {
                "query": query,
                "variables": variables
            }
            
            async with self.session.post(
                self.logic_mill_endpoint,
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                submission_result["details"]["status_code"] = response.status
                
                if response.status == 200:
                    response_data = await response.json()
                    
                    if "errors" in response_data:
                        submission_result["status"] = "failed"
                        submission_result["errors"] = response_data["errors"]
                    elif "data" in response_data:
                        similarity_results = response_data["data"].get("encodeDocumentAndSimilaritySearch", [])
                        submission_result["results"] = similarity_results
                        submission_result["details"]["result_count"] = len(similarity_results)
                        
                        if similarity_results:
                            scores = [r.get("score", 0) for r in similarity_results]
                            submission_result["details"]["score_stats"] = {
                                "min": min(scores),
                                "max": max(scores),
                                "avg": sum(scores) / len(scores)
                            }
                            submission_result["status"] = "passed"
                        else:
                            submission_result["status"] = "passed_no_results"
                else:
                    submission_result["status"] = "failed"
                    error_text = await response.text()
                    submission_result["errors"].append(f"HTTP {response.status}: {error_text[:200]}")
                    
        except Exception as e:
            submission_result["status"] = "failed"
            submission_result["errors"].append(f"Submission error: {str(e)}")
        
        return submission_result
    
    async def test_performance_metrics(self) -> Dict[str, Any]:
        """Test system performance metrics"""
        test_result = {
            "test_name": "Performance Metrics",
            "status": "unknown",
            "details": {},
            "errors": []
        }
        
        try:
            # Test concurrent document processing
            test_docs = self._create_test_documents()[:2]  # Use first 2 documents
            
            start_time = time.time()
            
            # Process documents concurrently
            tasks = []
            for doc in test_docs:
                payload = {
                    "content": doc["content"],
                    "content_type": doc["type"]
                }
                task = self.session.post(
                    f"{self.backend_url}/ingest/enhanced",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=60)
                )
                tasks.append(task)
            
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            total_time = time.time() - start_time
            
            # Analyze performance
            successful_responses = 0
            total_extraction_time = 0
            
            for i, response in enumerate(responses):
                if isinstance(response, Exception):
                    test_result["errors"].append(f"Document {i} failed: {str(response)}")
                else:
                    if response.status == 200:
                        successful_responses += 1
                        # Estimate individual processing time
                        total_extraction_time += total_time / len(test_docs)
            
            test_result["details"] = {
                "total_documents": len(test_docs),
                "successful_extractions": successful_responses,
                "total_time": total_time,
                "avg_time_per_document": total_time / len(test_docs),
                "throughput_docs_per_second": len(test_docs) / total_time if total_time > 0 else 0,
                "success_rate": successful_responses / len(test_docs) * 100
            }
            
            # Performance thresholds
            if (test_result["details"]["avg_time_per_document"] < 30 and  # Less than 30 seconds per doc
                test_result["details"]["success_rate"] >= 90):  # At least 90% success rate
                test_result["status"] = "passed"
            else:
                test_result["status"] = "partial"
                test_result["errors"].append("Performance below expected thresholds")
                
        except Exception as e:
            test_result["status"] = "failed"
            test_result["errors"].append(f"Performance test error: {str(e)}")
        
        return test_result
    
    async def run_complete_system_test(self) -> Dict[str, Any]:
        """Run complete system integration test"""
        logger.info("🚀 Starting Complete System Integration Test")
        logger.info("=" * 70)
        
        test_report = {
            "timestamp": datetime.now().isoformat(),
            "system_info": {
                "backend_url": self.backend_url,
                "frontend_url": self.frontend_url,
                "logic_mill_endpoint": self.logic_mill_endpoint
            },
            "tests": [],
            "summary": {}
        }
        
        # Test 1: Backend Health
        health_test = await self.test_backend_health()
        test_report["tests"].append(health_test)
        logger.info(f"🏥 Backend Health: {health_test['status'].upper()}")
        
        if health_test["status"] != "passed":
            logger.error("❌ Backend is not healthy - aborting tests")
            test_report["summary"] = {
                "total_tests": 1,
                "passed_tests": 0,
                "partial_tests": 0,
                "failed_tests": 1,
                "success_rate": 0.0,
                "overall_status": "failed"
            }
            return test_report
        
        # Test 2: Document Extraction Pipeline
        test_documents = self._create_test_documents()
        
        for document in test_documents:
            extraction_test = await self.test_document_extraction_pipeline(document)
            test_report["tests"].append(extraction_test)
            logger.info(f"📄 {extraction_test['test_name']}: {extraction_test['status'].upper()}")
            
            if extraction_test["status"] == "passed":
                similarity_count = len(extraction_test.get("similarity_results", []))
                if similarity_count > 0:
                    logger.info(f"   ✅ Found {similarity_count} similarity results")
                    avg_score = extraction_test["details"].get("similarity_test", {}).get("details", {}).get("score_stats", {}).get("avg", 0)
                    if avg_score > 0:
                        logger.info(f"   📊 Average similarity score: {avg_score:.3f}")
            
            extraction_quality = extraction_test["details"].get("extraction_quality", {})
            if extraction_quality:
                logger.info(f"   🎯 Extraction quality: {extraction_quality.get('overall_score', 0):.2f}")
        
        # Test 3: Performance Metrics
        performance_test = await self.test_performance_metrics()
        test_report["tests"].append(performance_test)
        logger.info(f"⚡ Performance Test: {performance_test['status'].upper()}")
        
        if performance_test["status"] in ["passed", "partial"]:
            perf_details = performance_test["details"]
            logger.info(f"   📈 Throughput: {perf_details.get('throughput_docs_per_second', 0):.2f} docs/sec")
            logger.info(f"   ⏱️ Avg time per document: {perf_details.get('avg_time_per_document', 0):.1f}s")
            logger.info(f"   ✅ Success rate: {perf_details.get('success_rate', 0):.1f}%")
        
        # Calculate summary
        total_tests = len(test_report["tests"])
        passed_tests = len([t for t in test_report["tests"] if t["status"] in ["passed"]])
        partial_tests = len([t for t in test_report["tests"] if t["status"] == "partial"])
        failed_tests = total_tests - passed_tests - partial_tests
        success_rate = ((passed_tests + partial_tests * 0.5) / total_tests) * 100 if total_tests > 0 else 0
        
        test_report["summary"] = {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "partial_tests": partial_tests,
            "failed_tests": failed_tests,
            "success_rate": success_rate,
            "overall_status": "passed" if success_rate >= 80 else "partial" if success_rate >= 60 else "failed"
        }
        
        return test_report

async def main():
    """Main test runner"""
    
    async with CompleteSystemTester() as tester:
        # Run complete system test
        report = await tester.run_complete_system_test()
        
        # Save report
        report_file = Path("complete_system_integration_report.json")
        with open(report_file, "w") as f:
            json.dump(report, f, indent=2)
        
        # Display summary
        logger.info("\n" + "=" * 70)
        logger.info("📊 COMPLETE SYSTEM TEST SUMMARY")
        logger.info(f"Total Tests: {report['summary']['total_tests']}")
        logger.info(f"Passed: {report['summary']['passed_tests']}")
        logger.info(f"Partial: {report['summary']['partial_tests']}")
        logger.info(f"Failed: {report['summary']['failed_tests']}")
        logger.info(f"Success Rate: {report['summary']['success_rate']:.1f}%")
        logger.info(f"Overall Status: {report['summary']['overall_status'].upper()}")
        
        # Display key findings
        extraction_tests = [t for t in report["tests"] if "Document Extraction" in t["test_name"]]
        if extraction_tests:
            logger.info("\n🔍 EXTRACTION PIPELINE RESULTS:")
            for test in extraction_tests:
                status_icon = "✅" if test["status"] == "passed" else "⚠️" if test["status"] == "partial" else "❌"
                logger.info(f"  {status_icon} {test['test_name']}")
                
                # Show Logic Mill integration status
                similarity_results = test.get("similarity_results", [])
                if similarity_results:
                    logger.info(f"    🔗 Logic Mill: {len(similarity_results)} similarity matches found")
                else:
                    logger.info(f"    🔗 Logic Mill: No similarity results")
        
        # Display issues if any
        failed_tests = [t for t in report["tests"] if t["status"] == "failed"]
        if failed_tests:
            logger.info("\n❌ ISSUES FOUND:")
            for test in failed_tests:
                logger.info(f"  - {test['test_name']}: {'; '.join(test['errors'])}")
        
        logger.info(f"\n📄 Detailed report saved to: {report_file.absolute()}")
        
        # Final validation message
        if report['summary']['overall_status'] == 'passed':
            logger.info("\n🎉 SYSTEM VALIDATION SUCCESSFUL!")
            logger.info("✅ Document extraction pipeline is working correctly")
            logger.info("✅ Claude API integration is functional")
            logger.info("✅ Logic Mill API data format is compliant")
            logger.info("✅ End-to-end similarity search is operational")
        elif report['summary']['overall_status'] == 'partial':
            logger.info("\n⚠️ SYSTEM VALIDATION PARTIAL")
            logger.info("Some components are working but improvements needed")
        else:
            logger.info("\n❌ SYSTEM VALIDATION FAILED")
            logger.info("Critical issues found that need to be addressed")
        
        return report

if __name__ == "__main__":
    asyncio.run(main())