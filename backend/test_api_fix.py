#!/usr/bin/env python3
"""
API Testing Script for CORE Backend
Tests all Track 1 insights endpoints to identify and fix issues
"""

import asyncio
import json
import logging
import requests
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_URL = "http://localhost:8000"
TEST_ANALYSIS_ID = "test-analysis-123"

# Test data for creating an analysis
TEST_INGEST_DATA = {
    "title": "Advanced Electrolysis Catalyst for Hydrogen Production",
    "abstract": "This research presents a novel catalyst design for proton exchange membrane electrolysis systems. The catalyst features adaptive pore structures that optimize hydrogen production efficiency while reducing degradation. Machine learning algorithms predict optimal operating conditions and detect early failure patterns. The technology addresses key challenges in renewable hydrogen production including catalyst durability, energy efficiency, and cost reduction. Experimental results demonstrate 25% improvement in efficiency and 40% reduction in degradation compared to conventional catalysts.",
    "body": "Detailed technical description of the electrolysis catalyst technology including materials science innovations, manufacturing processes, and performance validation studies."
}

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            logger.info("✅ Health endpoint working")
            return True
        else:
            logger.error(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ Health endpoint error: {e}")
        return False

def test_ingest_endpoint():
    """Test document ingestion and get analysis ID"""
    try:
        response = requests.post(
            f"{BASE_URL}/ingest",
            json=TEST_INGEST_DATA,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            analysis_id = data.get("analysis_id")
            logger.info(f"✅ Ingest endpoint working, Analysis ID: {analysis_id}")
            return analysis_id
        else:
            logger.error(f"❌ Ingest endpoint failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"❌ Ingest endpoint error: {e}")
        return None

def test_track1_endpoint(analysis_id: str, endpoint: str):
    """Test a specific Track 1 endpoint"""
    try:
        url = f"{BASE_URL}/analysis/{analysis_id}/track1/{endpoint}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            logger.info(f"✅ {endpoint} endpoint working")
            logger.info(f"   Response keys: {list(data.keys()) if isinstance(data, dict) else 'Non-dict response'}")
            return True, data
        else:
            logger.error(f"❌ {endpoint} endpoint failed: {response.status_code} - {response.text}")
            return False, None
    except Exception as e:
        logger.error(f"❌ {endpoint} endpoint error: {e}")
        return False, None

def test_comprehensive_endpoint(analysis_id: str):
    """Test the comprehensive insights endpoint"""
    try:
        url = f"{BASE_URL}/analysis/{analysis_id}/track1/comprehensive"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            logger.info("✅ Comprehensive endpoint working")
            logger.info(f"   Response sections: {list(data.keys()) if isinstance(data, dict) else 'Non-dict response'}")
            
            # Check for errors in the response
            if isinstance(data, dict):
                for key, value in data.items():
                    if isinstance(value, dict) and 'error' in value:
                        logger.warning(f"   ⚠️  {key} section has error: {value['error']}")
            
            return True, data
        else:
            logger.error(f"❌ Comprehensive endpoint failed: {response.status_code} - {response.text}")
            return False, None
    except Exception as e:
        logger.error(f"❌ Comprehensive endpoint error: {e}")
        return False, None

def test_chat_endpoint():
    """Test the Claude chat endpoint"""
    try:
        test_message = {
            "message": "Hello, this is a test message for the chat endpoint.",
            "context": "Testing Claude API integration"
        }
        
        response = requests.post(
            f"{BASE_URL}/chat",
            json=test_message,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                logger.info("✅ Chat endpoint working")
                return True
            else:
                logger.error(f"❌ Chat endpoint returned error: {data.get('error')}")
                return False
        else:
            logger.error(f"❌ Chat endpoint failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logger.error(f"❌ Chat endpoint error: {e}")
        return False

def test_chat_health_endpoint():
    """Test the Claude health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/chat/health")
        
        if response.status_code == 200:
            data = response.json()
            status = data.get("status")
            if status == "healthy":
                logger.info("✅ Claude health check passed")
                return True
            else:
                logger.warning(f"⚠️  Claude health check: {status} - {data.get('message')}")
                return False
        else:
            logger.error(f"❌ Claude health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ Claude health endpoint error: {e}")
        return False

def main():
    """Run all API tests"""
    logger.info("🚀 Starting CORE Backend API Tests")
    logger.info("=" * 50)
    
    # Test basic health
    if not test_health_endpoint():
        logger.error("❌ Backend server is not responding. Please check if it's running.")
        return
    
    # Test Claude health
    claude_healthy = test_chat_health_endpoint()
    
    # Test chat endpoint
    chat_working = test_chat_endpoint()
    
    # Test document ingestion
    analysis_id = test_ingest_endpoint()
    if not analysis_id:
        logger.error("❌ Cannot proceed with Track 1 tests without analysis ID")
        return
    
    # Test all Track 1 endpoints
    track1_endpoints = [
        "novelty",
        "competitive", 
        "strategic",
        "commercialization"
    ]
    
    results = {}
    for endpoint in track1_endpoints:
        success, data = test_track1_endpoint(analysis_id, endpoint)
        results[endpoint] = success
    
    # Test comprehensive endpoint
    comprehensive_success, comprehensive_data = test_comprehensive_endpoint(analysis_id)
    results["comprehensive"] = comprehensive_success
    
    # Summary
    logger.info("\n" + "=" * 50)
    logger.info("📊 TEST RESULTS SUMMARY")
    logger.info("=" * 50)
    
    logger.info(f"Backend Health: {'✅ PASS' if True else '❌ FAIL'}")
    logger.info(f"Claude Health: {'✅ PASS' if claude_healthy else '❌ FAIL'}")
    logger.info(f"Chat Endpoint: {'✅ PASS' if chat_working else '❌ FAIL'}")
    logger.info(f"Document Ingest: {'✅ PASS' if analysis_id else '❌ FAIL'}")
    
    for endpoint, success in results.items():
        logger.info(f"Track 1 {endpoint.title()}: {'✅ PASS' if success else '❌ FAIL'}")
    
    # Identify issues
    failed_endpoints = [endpoint for endpoint, success in results.items() if not success]
    if failed_endpoints:
        logger.error(f"\n❌ FAILED ENDPOINTS: {', '.join(failed_endpoints)}")
        logger.error("\n🔧 RECOMMENDED FIXES:")
        
        if not claude_healthy:
            logger.error("   - Check Claude API key configuration in environment variables")
            logger.error("   - Verify CORE_CLAUDE_API_KEY is set correctly")
        
        if "novelty" in failed_endpoints or "competitive" in failed_endpoints:
            logger.error("   - Check Logic Mill API token configuration")
            logger.error("   - Verify CORE_LOGIC_MILL_TOKEN is set correctly")
        
        if "strategic" in failed_endpoints or "commercialization" in failed_endpoints:
            logger.error("   - Check Claude service implementation")
            logger.error("   - Verify Claude API integration is working")
    else:
        logger.info("\n🎉 ALL TESTS PASSED! APIs are working correctly.")

if __name__ == "__main__":
    main()