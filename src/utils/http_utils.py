"""
Unified HTTP utilities for making robust API requests.
"""

from typing import Dict, Any, Optional, Union
import requests
import json
import time
import random

class ApiError(Exception):
    """Base exception for API errors."""
    
    def __init__(self, message: str, error_type: Optional[str] = None, status_code: Optional[int] = None):
        """Initialize the error with details."""
        self.message = message
        self.error_type = error_type
        self.status_code = status_code
        super().__init__(message)
    
    def __str__(self):
        """String representation of the error."""
        if self.error_type:
            return f"{self.error_type}: {self.message}"
        return self.message

class OverloadedError(ApiError):
    """API server is currently overloaded."""
    
    def __init__(self):
        """Initialize with standard message."""
        super().__init__(
            "The API is currently overloaded. Please try again later.", 
            error_type="overloaded_error",
            status_code=500
        )

def make_robust_request(
    url: str, 
    method: str = "GET", 
    data: Optional[Union[Dict[str, Any], str]] = None, 
    headers: Optional[Dict[str, str]] = None, 
    max_retries: int = 3, 
    initial_retry_delay: int = 2,
    max_retry_delay: int = 60,
    jitter: float = 0.1,
    check_for_overloaded: bool = False
) -> requests.Response:
    """
    Make HTTP requests with robust error handling and exponential backoff retry mechanism.
    
    Args:
        url: The URL to send the request to
        method: HTTP method ("GET", "POST", etc.)
        data: Data to send in the request (dict will be converted to JSON)
        headers: Dictionary of HTTP headers
        max_retries: Maximum number of retry attempts
        initial_retry_delay: Initial delay between retries in seconds
        max_retry_delay: Maximum delay between retries in seconds
        jitter: Random jitter factor to avoid thundering herd problems
        check_for_overloaded: Whether to check for overloaded errors
        
    Returns:
        Response object from the requests library
        
    Raises:
        OverloadedError: If the server is overloaded (when check_for_overloaded=True)
        ApiError: If the request fails with a client error
        requests.RequestException: If all retry attempts fail
    """
    retries = 0
    retry_delay = initial_retry_delay
    
    # Convert dict data to JSON string if needed
    request_data = data
    if isinstance(data, dict):
        request_data = json.dumps(data)
    
    while retries < max_retries:
        try:
            response = requests.request(
                method=method,
                url=url,
                data=request_data,
                headers=headers
            )
            
            # Check for server errors (5xx status codes)
            if 500 <= response.status_code < 600:
                # Check if it's an overloaded error
                if check_for_overloaded:
                    try:
                        error_data = response.json()
                        if (
                            isinstance(error_data, dict) and 
                            error_data.get("type") == "error" and 
                            isinstance(error_data.get("error"), dict) and
                            error_data["error"].get("type") == "overloaded_error"
                        ):
                            print(f"API is overloaded. Attempt {retries + 1}/{max_retries}")
                            
                            # For the last retry, raise a specific error
                            if retries >= max_retries - 1:
                                raise OverloadedError()
                    except (ValueError, KeyError):
                        # Not JSON or unexpected format
                        pass
                
                print(f"Server error {response.status_code}. Attempt {retries + 1}/{max_retries}")
                retries += 1
                
                # Apply exponential backoff with jitter
                jitter_amount = random.uniform(-jitter, jitter) * retry_delay
                actual_delay = min(retry_delay + jitter_amount, max_retry_delay)
                
                print(f"Retrying in {actual_delay:.1f} seconds...")
                time.sleep(actual_delay)
                
                # Exponential backoff
                retry_delay = min(retry_delay * 2, max_retry_delay)
                continue
                
            # Check for client errors (4xx status codes)
            if check_for_overloaded and 400 <= response.status_code < 500:
                try:
                    error_data = response.json()
                    if isinstance(error_data, dict) and error_data.get("type") == "error":
                        error_details = error_data.get("error", {})
                        error_type = error_details.get("type")
                        error_message = error_details.get("message", "Unknown error")
                        
                        raise ApiError(
                            message=error_message,
                            error_type=error_type,
                            status_code=response.status_code
                        )
                except (ValueError, KeyError):
                    # Not JSON or unexpected format
                    pass
            
            return response
            
        except requests.RequestException as e:
            print(f"Request failed: {e}. Attempt {retries + 1}/{max_retries}")
            retries += 1
            
            if retries >= max_retries:
                raise
                
            # Apply exponential backoff with jitter
            jitter_amount = random.uniform(-jitter, jitter) * retry_delay
            actual_delay = min(retry_delay + jitter_amount, max_retry_delay)
            
            print(f"Retrying in {actual_delay:.1f} seconds...")
            time.sleep(actual_delay)
            
            # Exponential backoff
            retry_delay = min(retry_delay * 2, max_retry_delay)
    
    raise requests.RequestException(f"Failed after {max_retries} attempts")