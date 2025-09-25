#!/usr/bin/env python3
"""
Comprehensive Integration Test for CORE Chatbot
Tests the complete frontend-backend-Claude API flow
"""

import requests
import json
import time
from typing import Dict, List, Any
from datetime import datetime

class FullIntegrationTester:
    def __init__(self, backend_url: str = "http://localhost:8000"):
        self.backend_url = backend_url
        self.test_results = []
        self.start_time = None
        
    def log_result(self, test_name: str, success: bool, details: Dict[str, Any] = None, error: str = None):
        """Log test result with timestamp"""
        result = {
            "test_name": test_name,
            "success": success,
            "timestamp": datetime.now().isoformat(),
            "details": details or {},
            "error": error
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {'Test passed' if success else error or 'Test failed'}")
        if details:
            print(f"   Details: {json.dumps(details, indent=2)}")
        print()
    
    def test_backend_health(self) -> bool:
        """Test if backend server is running and healthy"""
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=10)
            success = response.status_code == 200
            details = {
                "status_code": response.status_code,
                "response": response.json() if success else None
            }
            self.log_result("Backend Health Check", success, details)
            return success
        except Exception as e:
            self.log_result("Backend Health Check", False, error=str(e))
            return False
    
    def test_claude_health(self) -> bool:
        """Test Claude API health through backend"""
        try:
            response = requests.get(f"{self.backend_url}/chat/health", timeout=15)
            success = response.status_code == 200
            details = {
                "status_code": response.status_code,
                "response": response.json() if success else None
            }
            self.log_result("Claude API Health Check", success, details)
            return success
        except Exception as e:
            self.log_result("Claude API Health Check", False, error=str(e))
            return False
    
    def test_simple_chat(self) -> bool:
        """Test simple chat functionality"""
        try:
            payload = {
                "message": "Hello! Can you tell me what you are?",
                "context": "",
                "history": []
            }
            
            start_time = time.time()
            response = requests.post(
                f"{self.backend_url}/chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            response_time = time.time() - start_time
            
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data.get("success", False) and data.get("response")
                details = {
                    "response_time": f"{response_time:.2f}s",
                    "response_length": len(data.get("response", "")),
                    "has_usage_info": "usage" in data,
                    "usage": data.get("usage")
                }
            else:
                details = {"status_code": response.status_code, "error": response.text}
            
            self.log_result("Simple Chat Test", success, details)
            return success
        except Exception as e:
            self.log_result("Simple Chat Test", False, error=str(e))
            return False
    
    def test_chat_with_context(self) -> bool:
        """Test chat with context functionality"""
        try:
            payload = {
                "message": "What can you tell me about this context?",
                "context": "You are a helpful AI assistant for the CORE project, which is a comprehensive chatbot system with Python backend and React frontend.",
                "history": []
            }
            
            start_time = time.time()
            response = requests.post(
                f"{self.backend_url}/chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            response_time = time.time() - start_time
            
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data.get("success", False) and data.get("response")
                response_text = data.get("response", "").lower()
                context_relevant = any(keyword in response_text for keyword in ["core", "chatbot", "python", "react", "assistant"])
                
                details = {
                    "response_time": f"{response_time:.2f}s",
                    "response_length": len(data.get("response", "")),
                    "context_relevant": context_relevant,
                    "usage": data.get("usage")
                }
            else:
                details = {"status_code": response.status_code, "error": response.text}
            
            self.log_result("Chat with Context Test", success, details)
            return success
        except Exception as e:
            self.log_result("Chat with Context Test", False, error=str(e))
            return False
    
    def test_conversation_history(self) -> bool:
        """Test conversation with history"""
        try:
            payload = {
                "message": "What did I just ask you about?",
                "context": "",
                "history": [
                    {"role": "user", "content": "Tell me about artificial intelligence"},
                    {"role": "assistant", "content": "Artificial intelligence (AI) is a branch of computer science that aims to create machines capable of intelligent behavior."}
                ]
            }
            
            start_time = time.time()
            response = requests.post(
                f"{self.backend_url}/chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            response_time = time.time() - start_time
            
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data.get("success", False) and data.get("response")
                response_text = data.get("response", "").lower()
                history_relevant = any(keyword in response_text for keyword in ["artificial intelligence", "ai", "asked", "previous"])
                
                details = {
                    "response_time": f"{response_time:.2f}s",
                    "response_length": len(data.get("response", "")),
                    "history_relevant": history_relevant,
                    "usage": data.get("usage")
                }
            else:
                details = {"status_code": response.status_code, "error": response.text}
            
            self.log_result("Conversation History Test", success, details)
            return success
        except Exception as e:
            self.log_result("Conversation History Test", False, error=str(e))
            return False
    
    def test_error_handling(self) -> bool:
        """Test error handling with invalid input"""
        try:
            # Test with missing required fields
            payload = {"invalid": "data"}
            
            response = requests.post(
                f"{self.backend_url}/chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            
            # Should return 422 for validation error
            success = response.status_code == 422
            details = {
                "status_code": response.status_code,
                "expected_error": "Validation error for missing fields"
            }
            
            self.log_result("Error Handling Test", success, details)
            return success
        except Exception as e:
            self.log_result("Error Handling Test", False, error=str(e))
            return False
    
    def test_performance_load(self) -> bool:
        """Test performance with multiple concurrent requests"""
        try:
            import concurrent.futures
            import threading
            
            def make_request():
                payload = {
                    "message": "Quick test message",
                    "context": "",
                    "history": []
                }
                start = time.time()
                response = requests.post(
                    f"{self.backend_url}/chat",
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=30
                )
                end = time.time()
                return {
                    "success": response.status_code == 200 and response.json().get("success", False),
                    "response_time": end - start,
                    "status_code": response.status_code
                }
            
            # Make 3 concurrent requests
            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                futures = [executor.submit(make_request) for _ in range(3)]
                results = [future.result() for future in concurrent.futures.as_completed(futures)]
            
            successful_requests = sum(1 for r in results if r["success"])
            avg_response_time = sum(r["response_time"] for r in results) / len(results)
            
            success = successful_requests >= 2  # At least 2 out of 3 should succeed
            details = {
                "total_requests": len(results),
                "successful_requests": successful_requests,
                "success_rate": f"{(successful_requests/len(results)*100):.1f}%",
                "average_response_time": f"{avg_response_time:.2f}s",
                "individual_times": [f"{r['response_time']:.2f}s" for r in results]
            }
            
            self.log_result("Performance Load Test", success, details)
            return success
        except Exception as e:
            self.log_result("Performance Load Test", False, error=str(e))
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all integration tests"""
        print("🚀 Starting Full Integration Tests\n")
        print("=" * 50)
        
        self.start_time = time.time()
        
        # Run tests in order
        tests = [
            self.test_backend_health,
            self.test_claude_health,
            self.test_simple_chat,
            self.test_chat_with_context,
            self.test_conversation_history,
            self.test_error_handling,
            self.test_performance_load
        ]
        
        results = []
        for test in tests:
            try:
                result = test()
                results.append(result)
            except Exception as e:
                print(f"❌ FAIL {test.__name__}: Unexpected error - {str(e)}")
                results.append(False)
        
        total_time = time.time() - self.start_time
        passed_tests = sum(1 for r in results if r is True)
        total_tests = len(results)
        
        print("=" * 50)
        print(f"\n📊 Integration Test Results: {passed_tests}/{total_tests} tests passed")
        print(f"⏱️  Total execution time: {total_time:.2f}s")
        
        if passed_tests == total_tests:
            print("🎉 All integration tests passed! The CORE chatbot is fully functional.")
        else:
            print(f"⚠️  {total_tests - passed_tests} test(s) failed. Please check the issues above.")
        
        # Generate report
        report = {
            "test_summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": total_tests - passed_tests,
                "success_rate": f"{(passed_tests/total_tests*100):.1f}%",
                "total_execution_time": f"{total_time:.2f}s",
                "timestamp": datetime.now().isoformat()
            },
            "detailed_results": self.test_results
        }
        
        # Save report
        report_file = "full_integration_test_report.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Detailed test report saved to: {report_file}")
        return report

def main():
    """Main test runner"""
    tester = FullIntegrationTester()
    report = tester.run_all_tests()
    
    # Exit with appropriate code
    if report["test_summary"]["failed_tests"] == 0:
        exit(0)
    else:
        exit(1)

if __name__ == "__main__":
    main()