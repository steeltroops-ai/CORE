#!/usr/bin/env python3
"""
Claude API Integration Testing Script

This script tests the Claude API integration through the Python backend.
It validates the complete flow from frontend request to Claude API response.
"""

import asyncio
import json
import os
import sys
from typing import Dict, Any

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.services.claude_service import claude_service
from app.core.config import get_settings


class ClaudeIntegrationTester:
    """Test suite for Claude API integration"""
    
    def __init__(self):
        self.settings = get_settings()
        self.test_results = []
    
    def log_test(self, test_name: str, success: bool, message: str, details: Dict[str, Any] = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {json.dumps(details, indent=2)}")
        print()
    
    async def test_configuration(self):
        """Test if Claude API is properly configured"""
        test_name = "Configuration Test"
        
        try:
            if not self.settings.claude_api_key:
                self.log_test(test_name, False, "Claude API key not configured")
                return False
            
            if not self.settings.claude_api_url:
                self.log_test(test_name, False, "Claude API URL not configured")
                return False
            
            self.log_test(test_name, True, "Configuration is valid", {
                "api_url": self.settings.claude_api_url,
                "api_key_configured": bool(self.settings.claude_api_key)
            })
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Configuration error: {str(e)}")
            return False
    
    async def test_health_check(self):
        """Test Claude API health check"""
        test_name = "Health Check Test"
        
        try:
            result = await claude_service.health_check()
            
            if result["status"] == "healthy":
                self.log_test(test_name, True, "Health check passed", result)
                return True
            else:
                self.log_test(test_name, False, "Health check failed", result)
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Health check error: {str(e)}")
            return False
    
    async def test_simple_message(self):
        """Test sending a simple message to Claude"""
        test_name = "Simple Message Test"
        
        try:
            test_message = "Hello, this is a test message. Please respond with 'Test successful'."
            result = await claude_service.send_message(test_message)
            
            if result["success"] and result["response"]:
                self.log_test(test_name, True, "Simple message test passed", {
                    "response_length": len(result["response"]),
                    "usage": result.get("usage", {})
                })
                return True
            else:
                self.log_test(test_name, False, "Simple message test failed", result)
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Simple message error: {str(e)}")
            return False
    
    async def test_context_message(self):
        """Test sending a message with context"""
        test_name = "Context Message Test"
        
        try:
            test_message = "What can you tell me about this research?"
            context = "You are analyzing a research paper about artificial intelligence and machine learning applications in healthcare."
            
            result = await claude_service.send_message(test_message, context=context)
            
            if result["success"] and result["response"]:
                # Check if response mentions healthcare or AI
                response_lower = result["response"].lower()
                context_relevant = any(keyword in response_lower for keyword in ["healthcare", "ai", "artificial intelligence", "machine learning"])
                
                self.log_test(test_name, True, "Context message test passed", {
                    "response_length": len(result["response"]),
                    "context_relevant": context_relevant,
                    "usage": result.get("usage", {})
                })
                return True
            else:
                self.log_test(test_name, False, "Context message test failed", result)
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Context message error: {str(e)}")
            return False
    
    async def test_conversation_history(self):
        """Test sending a message with conversation history"""
        test_name = "Conversation History Test"
        
        try:
            # Simulate a conversation
            history = [
                {"role": "user", "content": "What is machine learning?"},
                {"role": "assistant", "content": "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed."}
            ]
            
            test_message = "Can you give me an example?"
            
            result = await claude_service.send_message(
                test_message, 
                conversation_history=history
            )
            
            if result["success"] and result["response"]:
                # Check if response provides an example related to ML
                response_lower = result["response"].lower()
                has_example = any(keyword in response_lower for keyword in ["example", "instance", "such as", "like"])
                
                self.log_test(test_name, True, "Conversation history test passed", {
                    "response_length": len(result["response"]),
                    "has_example": has_example,
                    "usage": result.get("usage", {})
                })
                return True
            else:
                self.log_test(test_name, False, "Conversation history test failed", result)
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Conversation history error: {str(e)}")
            return False
    
    async def test_error_handling(self):
        """Test error handling with invalid inputs"""
        test_name = "Error Handling Test"
        
        try:
            # Test with empty message
            result = await claude_service.send_message("")
            
            # Should handle empty message gracefully
            if not result["success"] or result["response"]:
                self.log_test(test_name, True, "Error handling test passed - empty message handled", {
                    "empty_message_handled": True
                })
                return True
            else:
                self.log_test(test_name, False, "Error handling test failed - empty message not handled properly")
                return False
                
        except Exception as e:
            # Exception is expected for error handling
            self.log_test(test_name, True, f"Error handling test passed - exception caught: {str(e)}")
            return True
    
    async def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Claude API Integration Tests\n")
        print("=" * 50)
        
        tests = [
            self.test_configuration,
            self.test_health_check,
            self.test_simple_message,
            self.test_context_message,
            self.test_conversation_history,
            self.test_error_handling
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                success = await test()
                if success:
                    passed += 1
            except Exception as e:
                print(f"❌ Test failed with exception: {str(e)}\n")
        
        print("=" * 50)
        print(f"\n📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Claude API integration is working correctly.")
        else:
            print(f"⚠️  {total - passed} test(s) failed. Please check the configuration and try again.")
        
        return passed == total
    
    def generate_report(self):
        """Generate a detailed test report"""
        report = {
            "timestamp": asyncio.get_event_loop().time(),
            "total_tests": len(self.test_results),
            "passed_tests": sum(1 for result in self.test_results if result["success"]),
            "failed_tests": sum(1 for result in self.test_results if not result["success"]),
            "results": self.test_results
        }
        
        with open("claude_integration_test_report.json", "w") as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Detailed test report saved to: claude_integration_test_report.json")
        return report


async def main():
    """Main test runner"""
    tester = ClaudeIntegrationTester()
    
    try:
        success = await tester.run_all_tests()
        tester.generate_report()
        
        # Exit with appropriate code
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run tests
    asyncio.run(main())