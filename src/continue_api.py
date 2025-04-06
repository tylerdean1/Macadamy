"""
Continue API client for handling API interactions with Continue's model proxy.
"""

from typing import Dict, List, Any, Optional, Union
import requests
import json
from .utils.http_utils import make_robust_request, ApiError, OverloadedError

class ContinueApiError(ApiError):
    """Base exception for Continue API errors."""
    pass

def validate_messages(messages: List[Dict[str, Any]]) -> bool:
    """
    Validate that messages are properly formatted for the Continue API.
    
    Args:
        messages: List of message objects to validate
        
    Returns:
        True if messages are valid
        
    Raises:
        ValueError: If messages format is invalid
    """
    if not messages:
        raise ValueError("Messages list cannot be empty")
    
    # Check each message for proper format
    for i, message in enumerate(messages):
        # Check required fields
        if "role" not in message:
            raise ValueError(f"Message at index {i} is missing 'role' field")
        
        # Check for empty content (allowed only in the last message if it's from assistant)
        if "content" not in message or not message["content"]:
            if i == len(messages) - 1 and message.get("role") == "assistant":
                # This is okay - the last message can be an empty assistant message
                continue
            else:
                raise ValueError(
                    f"Message at index {i} has empty content. All messages must have "
                    "non-empty content except for the optional final assistant message."
                )
    
    return True

class ContinueApiClient:
    """Client for interacting with the Continue API."""
    
    def __init__(self, base_url: str = "https://api.continue.dev", api_key: Optional[str] = None):
        """
        Initialize the Continue API client.
        
        Args:
            base_url: Base URL for the Continue API
            api_key: Optional API key for authentication
        """
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.headers = {
            "Content-Type": "application/json",
        }
        
        if api_key:
            self.headers["Authorization"] = f"Bearer {api_key}"
    
    def validate_messages(self, messages: List[Dict[str, Any]]) -> bool:
        """
        Validate that messages are properly formatted for the Continue API.
        
        Args:
            messages: List of message objects to validate
            
        Returns:
            True if messages are valid
            
        Raises:
            ValueError: If messages format is invalid
        """
        return validate_messages(messages)
    
    def chat_completions(
        self, 
        messages: List[Dict[str, Any]],
        model: str = "gpt-4",
        temperature: float = 0.7,
        stream: bool = False,
        max_retries: int = 5,
        retry_delay: int = 2
    ) -> Union[Dict[str, Any], requests.Response]:
        """
        Send a chat completions request to the Continue API.
        
        Args:
            messages: List of message objects with role and content
            model: Model identifier to use
            temperature: Sampling temperature
            stream: Whether to stream the response
            max_retries: Maximum number of retry attempts
            retry_delay: Initial delay between retries in seconds
            
        Returns:
            API response as a dictionary (or response object if streaming)
            
        Raises:
            ValueError: If messages format is invalid
            OverloadedError: If the server is overloaded after retries
            ContinueApiError: If the request fails for other reasons
            requests.RequestException: If all retry attempts fail
        """
        # Validate messages to prevent the common error
        self.validate_messages(messages)
        
        url = f"{self.base_url}/model-proxy/v1/chat/completions"
        
        payload = {
            "messages": messages,
            "model": model,
            "temperature": temperature,
            "stream": stream
        }
        
        try:
            if stream:
                # For streaming, return the response object directly
                response = make_robust_request(
                    url=url,
                    method="POST",
                    data=payload,
                    headers=self.headers,
                    max_retries=max_retries,
                    initial_retry_delay=retry_delay,
                    check_for_overloaded=True
                )
                return response
            else:
                # For non-streaming, parse and return the JSON response
                response = make_robust_request(
                    url=url,
                    method="POST",
                    data=payload,
                    headers=self.headers,
                    max_retries=max_retries,
                    initial_retry_delay=retry_delay,
                    check_for_overloaded=True
                )
                
                if response.status_code != 200:
                    error_msg = f"API error: {response.status_code} - {response.text}"
                    raise requests.RequestException(error_msg)
                    
                return response.json()
        except OverloadedError:
            # Re-raise overloaded errors with a more helpful message
            raise OverloadedError()
    
    def apply_edit(
        self, 
        instruction: str,
        content: str,
        model: str = "gpt-4",
        max_retries: int = 5,
        retry_delay: int = 2
    ) -> Dict[str, Any]:
        """
        Apply an edit to content based on the given instruction.
        
        Args:
            instruction: The instruction describing the edit to make
            content: The content to edit
            model: Model identifier to use
            max_retries: Maximum number of retry attempts
            retry_delay: Initial delay between retries in seconds
            
        Returns:
            Edited content in API response
            
        Raises:
            ValueError: If instruction or content is empty
            OverloadedError: If the server is overloaded after retries
            ContinueApiError: If the request fails for other reasons
            requests.RequestException: If all retry attempts fail
        """
        if not instruction.strip():
            raise ValueError("Instruction cannot be empty")
        
        if not content.strip():
            raise ValueError("Content cannot be empty")
        
        # Format messages for an edit request
        messages = [
            {"role": "system", "content": "You are a helpful assistant that edits content according to instructions."},
            {"role": "user", "content": f"Content to edit:\n\n{content}\n\nInstruction: {instruction}"}
        ]
        
        return self.chat_completions(
            messages=messages, 
            model=model,
            max_retries=max_retries,
            retry_delay=retry_delay
        )