"""
Module for handling streaming diffs from the Continue API.
"""

from typing import Optional, Iterator, Dict, Any
import requests
import json
from .utils.http_utils import make_robust_request
from .continue_api import validate_messages

def stream_diff(
    url: str, 
    headers: Optional[dict] = None,
    messages: Optional[list] = None
) -> Iterator[str]:
    """
    Stream diff content from a URL with error handling.
    
    Args:
        url: The URL to stream the diff from
        headers: Optional HTTP headers
        messages: Optional messages to validate before requesting
        
    Yields:
        Chunks of the diff content
        
    Raises:
        ValueError: If the messages are invalid
        RuntimeError: If streaming fails after retries
    """
    try:
        # Validate messages if provided
        if messages:
            validate_messages(messages)
            
        # Ensure proper headers
        if not headers:
            headers = {}
        
        if "Content-Type" not in headers:
            headers["Content-Type"] = "application/json"
        
        # Using our robust request handler
        response = make_robust_request(
            url=url,
            method="POST" if messages else "GET",
            data={"messages": messages} if messages else None,
            headers=headers,
            # Increase retries for important operations
            max_retries=5
        )
        
        # Check for error responses
        if response.status_code >= 400:
            error_message = f"Error streaming diff: Error: HTTP {response.status_code}"
            try:
                error_json = response.json()
                if isinstance(error_json, dict) and "error" in error_json:
                    error_message += f" {json.dumps(error_json)}"
            except:
                if response.text:
                    error_message += f" {response.text}"
            
            raise RuntimeError(error_message)
            
        # Stream the response content
        for chunk in response.iter_content(chunk_size=4096):
            if chunk:
                yield chunk.decode('utf-8')
                
    except requests.exceptions.RequestException as e:
        # Convert to a more meaningful error
        raise RuntimeError(f"Failed to stream diff from {url}: {str(e)}")