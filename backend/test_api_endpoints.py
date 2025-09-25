#!/usr/bin/env python3
"""
API Endpoints Testing Script

This script tests the FastAPI chat endpoints to ensure they work correctly
with the Claude API integration.
"""

import asyncio
import json
import requests
import time
from typing import Dict, Any, List


class APIEndpointTester:
    """Test suite for API endpoints"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.chat_endpoint = f"{base_url}/chat"
        self.health_endpoint = f"{base_url}/chat/health"
        self.general_health_endpoint = f"{base_url}/health"
        self.test_results = []
    
    def log_test(self, test_name: str, success: bool, message: str, details: Dict[str, Any] = None):
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
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {json.dumps(details, indent=2)}")
        print()
    
    def test_server_health(self):
        """Test if the server is running and healthy"""
        test_name = "Server Health Test"
        
        try:
            response = requests.get(self.general_health_endpoint, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(test_name, True, "Server is healthy", {
                    "status_code": response.status_code,
                    "response": data
                })
                return True
            else:
                self.log_test(test_name, False, f"Server health check failed with status {response.status_code}")
                return False
                
        except requests.exceptions.ConnectionError:
            self.log_test(test_name, False, "Cannot connect to server. Is it running?")
            return False
        except Exception as e:
            self.log_test(test_name, False, f"Server health check error: {str(e)}")
            return False
    
    def test_chat_health(self):
        """Test Claude API health through the endpoint"""
        test_name = "Chat Health Test"
        
        try:
            response = requests.get(self.health_endpoint, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test(test_name, True, "Chat health check passed", data)
                    return True
                else:
                    self.log_test(test_name, False, "Chat health check failed", data)
                    return False
            else:
                self.log_test(test_name, False, f"Chat health endpoint returned status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Chat health check error: {str(e)}")
            return False
    
    def test_simple_chat(self):
        """Test simple chat message"""
        test_name = "Simple Chat Test"
        
        try:
            payload = {
                "message": "Hello, this is a test message. Please respond briefly."
            }
            
            response = requests.post(
                self.chat_endpoint, 
                json=payload, 
                timeout=60,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("response"):
                    self.log_test(test_name, True, "Simple chat test passed", {
                        "response_length": len(data["response"]),
                        "usage": data.get("usage", {})
                    })
                    return True
                else:
                    self.log_test(test_name, False, "Simple chat test failed", data)
                    return False
            else:
                self.log_test(test_name, False, f"Chat endpoint returned status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Simple chat error: {str(e)}")
            return False
    
    def test_chat_with_context(self):
        """Test chat message with context"""
        test_name = "Chat with Context Test"
        
        try:
            payload = {
                "message": "What insights can you provide?",
                "context": "You are analyzing a research paper about renewable energy technologies and their market potential."
            }
            
            response = requests.post(
                self.chat_endpoint, 
                json=payload, 
                timeout=60,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("response"):
                    # Check if response is contextually relevant
                    response_lower = data["response"].lower()
                    context_relevant = any(keyword in response_lower for keyword in 
                                         ["renewable", "energy", "market", "technology", "research"])
                    
                    self.log_test(test_name, True, "Chat with context test passed", {
                        "response_length": len(data["response"]),
                        "context_relevant": context_relevant,
                        "usage": data.get("usage", {})
                    })
                    return True
                else:
                    self.log_test(test_name, False, "Chat with context test failed", data)
                    return False
            else:
                self.log_test(test_name, False, f"Chat endpoint returned status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Chat with context error: {str(e)}")
            return False
    
    def test_chat_with_history(self):
        """Test chat message with conversation history"""
        test_name = "Chat with History Test"
        
        try:
            payload = {
                "message": "Can you elaborate on that?",
                "conversation_history": [
                    {"role": "user", "content": "What is artificial intelligence?"},
                    {"role": "assistant", "content": "Artificial intelligence is a branch of computer science that aims to create machines capable of intelligent behavior."}
                ]
            }
            
            response = requests.post(
                self.chat_endpoint, 
                json=payload, 
                timeout=60,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("response"):
                    # Check if response elaborates on AI
                    response_lower = data["response"].lower()
                    relevant = any(keyword in response_lower for keyword in 
                                 ["ai", "artificial intelligence", "machine", "learning", "algorithm"])
                    
                    self.log_test(test_name, True, "Chat with history test passed", {
                        "response_length": len(data["response"]),
                        "contextually_relevant": relevant,
                        "usage": data.get("usage", {})
                    })
                    return True
                else:
                    self.log_test(test_name, False, "Chat with history test failed", data)
                    return False
            else:
                self.log_test(test_name, False, f"Chat endpoint returned status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Chat with history error: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test API error handling"""
        test_name = "Error Handling Test"
        
        try:
            # Test with invalid payload
            invalid_payload = {"invalid_field": "test"}
            
            response = requests.post(
                self.chat_endpoint, 
                json=invalid_payload, 
                timeout=30,
                headers={"Content-Type": "application/json"}
            )
            
            # Should return 422 for validation error
            if response.status_code == 422:
                self.log_test(test_name, True, "Error handling test passed - validation error caught", {
                    "status_code": response.status_code
                })
                return True
            else:
                self.log_test(test_name, False, f"Expected 422 but got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Error handling test error: {str(e)}")
            return False
    
    def test_performance(self):
        """Test API performance with multiple requests"""
        test_name = "Performance Test"
        
        try:
            payload = {
                "message": "This is a performance test message. Please respond briefly."
            }
            
            response_times = []
            successful_requests = 0
            total_requests = 3  # Keep it small for testing
            
            for i in range(total_requests):
                start_time = time.time()
                
                response = requests.post(
                    self.chat_endpoint, 
                    json=payload, 
                    timeout=60,
                    headers={"Content-Type": "application/json"}
                )
                
                end_time = time.time()
                response_time = end_time - start_time
                response_times.append(response_time)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        successful_requests += 1
                
                # Small delay between requests
                time.sleep(1)
            
            avg_response_time = sum(response_times) / len(response_times)
            success_rate = (successful_requests / total_requests) * 100
            
            self.log_test(test_name, True, "Performance test completed", {
                "total_requests": total_requests,
                "successful_requests": successful_requests,
                "success_rate": f"{success_rate:.1f}%",
                "average_response_time": f"{avg_response_time:.2f}s",
                "response_times": [f"{t:.2f}s" for t in response_times]
            })
            
            return success_rate > 80  # Consider success if >80% requests succeed
            
        except Exception as e:
            self.log_test(test_name, False, f"Performance test error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting API Endpoint Tests\n")
        print("=" * 50)
        
        tests = [
            self.test_server_health,
            self.test_chat_health,
            self.test_simple_chat,
            self.test_chat_with_context,
            self.test_chat_with_history,
            self.test_error_handling,
            self.test_performance
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                success = test()
                if success:
                    passed += 1
            except Exception as e:
                print(f"❌ Test failed with exception: {str(e)}\n")
        
        print("=" * 50)
        print(f"\n📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All API endpoint tests passed! The backend is working correctly.")
        else:
            print(f"⚠️  {total - passed} test(s) failed. Please check the backend and try again.")
        
        return passed == total
    
    def generate_report(self):
        """Generate a detailed test report"""
        report = {
            "timestamp": time.time(),
            "base_url": self.base_url,
            "total_tests": len(self.test_results),
            "passed_tests": sum(1 for result in self.test_results if result["success"]),
            "failed_tests": sum(1 for result in self.test_results if not result["success"]),
            "results": self.test_results
        }
        
        with open("api_endpoint_test_report.json", "w") as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Detailed test report saved to: api_endpoint_test_report.json")
        return report


def main():
    """Main test runner"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Test API endpoints")
    parser.add_argument("--url", default="http://localhost:8000", help="Base URL for the API")
    args = parser.parse_args()
    
    tester = APIEndpointTester(args.url)
    
    try:
        success = tester.run_all_tests()
        tester.generate_report()
        
        # Exit with appropriate code
        exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        exit(1)


if __name__ == "__main__":
    main()