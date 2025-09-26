import json
import logging
from typing import List, Dict, Any, Optional
from urllib3.util import Retry
from requests import Session
from requests.adapters import HTTPAdapter
from app.core.config import get_settings

logger = logging.getLogger(__name__)

class SimilaritySearchService:
    """Service for Logic Mill API similarity search using the exact implementation from the example"""
    
    def __init__(self):
        self.settings = get_settings()
        # Use the exact token and URL from the provided example
        self.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJBUEkiLCJleHAiOjI2Mjk3MjQxMzksImlhdCI6MTc1ODgxMjEzOSwiaXNzIjoiTE9HSUMtTUlMTCIsImp0aSI6IjI0MDdlODI1LWIwNzMtNDNjNC1hYzliLTdiMTJjNWMwMTFlNiIsIm5iZiI6MTc1ODgxMjEzOSwicGF5bG9hZCI6eyJ0b2tlbk5hbWUiOiJEZWZhdWx0IEFQSSBUb2tlbiJ9LCJzdWIiOiI1OGMzOTBmYS00NGJhLTQ0NTYtOTY2Ny05ZjE1ZDgyYjc0M2MifQ.BEf4C6r3vb0Hj-qjzxOVKPEmt3mDm8_k5QY91p-aRtE"
        self.url = "https://api.logic-mill.net/api/v1/graphql/"
        self.headers = {
            'content-type': 'application/json',
            'Authorization': f'Bearer {self.token}',
        }
        
        # Establish session for robust connection (exact implementation from example)
        self.session = Session()
        retries = Retry(total=5, backoff_factor=0.1,
                       status_forcelist=[500, 501, 502, 503, 504, 524])
        self.session.mount('https://', HTTPAdapter(max_retries=retries))
    
    def validate_text_length(self, text: str, max_words: int = 420) -> tuple[str, int, bool]:
        """Validate and truncate text based on BERT token limits
        
        BERT models have a maximum sequence length of 512 tokens.
        1 word is ~ 1.2 tokens. Max 420 words to stay under 512 tokens.
        """
        words = text.split()
        word_count = len(words)
        
        if word_count <= max_words:
            return text, word_count, False
        
        # Truncate to max_words
        truncated_text = ' '.join(words[:max_words])
        return truncated_text, max_words, True
    
    def format_document_data(self, title: str, abstract: str) -> List[Dict[str, str]]:
        """Format document data for Logic Mill API (exact structure from example)"""
        # Validate and truncate abstract if needed
        validated_abstract, word_count, was_truncated = self.validate_text_length(abstract)
        
        if was_truncated:
            logger.warning(f"Abstract truncated from {len(abstract.split())} to {word_count} words")
        
        # Use exact data structure from the example
        return [
            {
                "key": "title",
                "value": title
            },
            {
                "key": "abstract", 
                "value": validated_abstract
            }
        ]
    
    async def search_similar_documents(
        self, 
        title: str, 
        abstract: str,
        amount: int = 25,
        indices: List[str] = None
    ) -> Dict[str, Any]:
        """Search for similar documents using Logic Mill API (exact implementation from example)"""
        
        if indices is None:
            indices = ["patents", "publications"]
        
        # Build GraphQL query (exact query from example)
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
              PatspecterEmbedding
            }
          }
        }
        """
        
        # Format document data
        document_data = self.format_document_data(title, abstract)
        
        # Build variables (exact structure from example)
        variables = {
            "model": "patspecter",
            "data": document_data,
            "amount": amount,
            "indices": indices
        }
        
        try:
            # Send request (exact implementation from example)
            response = self.session.post(
                self.url, 
                headers=self.headers, 
                json={'query': query, 'variables': variables}
            )
            
            # Handle response (exact implementation from example)
            if response.status_code != 200:
                error_msg = f"Error executing query on {self.url}. Status: {response.status_code}"
                logger.error(error_msg)
                return {
                    "success": False,
                    "error": error_msg,
                    "results": []
                }
            
            response_data = response.json()
            
            # Check for GraphQL errors
            if "errors" in response_data:
                error_msg = f"GraphQL errors: {response_data['errors']}"
                logger.error(error_msg)
                return {
                    "success": False,
                    "error": error_msg,
                    "results": []
                }
            
            # Extract results
            results = response_data.get("data", {}).get("encodeDocumentAndSimilaritySearch", [])
            
            return {
                "success": True,
                "error": None,
                "results": results,
                "total_results": len(results),
                "query_info": {
                    "title_words": len(title.split()),
                    "abstract_words": len(abstract.split()),
                    "indices": indices,
                    "model": "patspecter"
                }
            }
            
        except Exception as e:
            error_msg = f"Exception during similarity search: {str(e)}"
            logger.error(error_msg)
            return {
                "success": False,
                "error": error_msg,
                "results": []
            }
    
    def format_results_for_display(self, search_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Format search results for display in similar research cards"""
        if not search_results.get("success") or not search_results.get("results"):
            return []
        
        formatted_results = []
        for result in search_results["results"]:
            formatted_result = {
                "id": result.get("id", ""),
                "title": result.get("document", {}).get("title", "Untitled"),
                "url": result.get("document", {}).get("url", ""),
                "score": round(result.get("score", 0), 4),
                "index": result.get("index", ""),
                "similarity_percentage": round(result.get("score", 0) * 100, 2)
            }
            formatted_results.append(formatted_result)
        
        # Sort by similarity score (highest first)
        formatted_results.sort(key=lambda x: x["score"], reverse=True)
        
        return formatted_results

# Global service instance
similarity_search_service = SimilaritySearchService()