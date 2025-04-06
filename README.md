# Continue API Error Handling

This repository provides solutions for handling common Continue API errors, including:

1. The "messages must have non-empty content" error
2. The "Overloaded" server error

## Problem 1: Empty Content Error

### Error Description

```
HTTP 500 Internal Server Error from https://api.continue.dev/model-proxy/v1/chat/completions 
Error in Continue server: {"type":"error","error": 
{"type":"invalid_request_error","message":"messages.0: all messages must have non-empty content 
except for the optional final assistant message"}}
```

This error occurs when one or more messages in your request to the Continue API has empty content. According to the API requirements, all messages must have non-empty content, with the only exception being the final assistant message.

### Solution

The `ContinueApiClient` class in `src/continue_api.py` implements proper message validation to prevent this error:

```python
client = ContinueApiClient()

# CORRECT: All messages have non-empty content
messages = [
    {"role": "system", "content": "You are a helpful assistant."},  # Non-empty content
    {"role": "user", "content": "What is a Python generator?"}
]

# This will validate the messages before sending
response = client.chat_completions(messages=messages)
```

### Key Rules to Remember

1. Always ensure every message has non-empty content
2. The only exception is the final message IF it's from the assistant
3. Use the `ContinueApiClient` which validates messages before sending
4. When editing code, always include both instruction and content

## Problem 2: Overloaded Server Error

### Error Description

```
HTTP 500 Internal Server Error from https://api.continue.dev/model-proxy/v1/chat/completions
Error in Continue server: Malformed JSON sent from server: {"type":"error","error":
{"details":null,"type":"overloaded_error","message":"Overloaded"}}
```

This error occurs when the Continue API servers are experiencing high traffic or resource constraints and temporarily cannot handle more requests.

### Solution

The enhanced `ContinueApiClient` in `src/continue_api.py` implements exponential backoff retry logic to handle overloaded errors:

```python
try:
    # This has built-in retry logic for overloaded errors
    response = client.chat_completions(
        messages=messages,
        max_retries=5,     # Try up to 5 times
        retry_delay=2      # Start with 2 seconds, will increase exponentially
    )
except OverloadedError as e:
    print("The Continue API is currently overloaded. Please try again later.")
    # Handle gracefully - perhaps queue the request for later
```

The `handle_overload_error.py` script demonstrates a complete solution for handling these errors with user-friendly messages.

### Guidelines for Users

If you encounter the 'Overloaded' error:

1. Wait a few minutes before trying again
2. Try during off-peak hours
3. Make shorter or simpler requests
4. If using the edit feature, try applying smaller edits

## Running the Example Scripts

To see these solutions in action, run:

```bash
python fix_continue_error.py       # Demonstrates handling empty content errors
python handle_overload_error.py    # Demonstrates handling overloaded server errors
```

## Implementation Details

The repository includes:

- `src/continue_api.py`: A robust client for the Continue API with proper error handling
- `src/diff_handler.py`: Utility for handling streaming diffs with proper validation
- `fix_continue_error.py`: Example script showing how to fix empty content errors
- `handle_overload_error.py`: Example script showing how to handle overloaded errors
- `test_continue.py`: Basic test file for using the Continue API correctly
- `test_continue_api.py`: Unit tests for the Continue API client