# Dual LLM Chat Backend

This is the Python backend for the Dual LLM Chat Interface. It provides API endpoints to communicate with the OpenRouter API for accessing different LLM models.

## Features

- FastAPI-based REST API
- Integration with OpenRouter API
- Support for multiple LLM models
- CORS middleware for frontend communication

## Setup

1. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up your OpenRouter API key in the `.env` file:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

3. Run the server:
   ```bash
   ./run.sh
   ```
   
   Or manually:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

- `GET /`: Health check endpoint
- `GET /api/models`: Get information about available models
- `POST /api/llm1`: Send a prompt to the first LLM model (Qwen/QwQ-32B)
- `POST /api/llm2`: Send a prompt to the second LLM model (DeepSeek R1 Distill Qwen-32B)

## Request Format

```json
{
  "prompt": "Your prompt text here",
  "messages": [
    {
      "role": "user",
      "content": "Previous message content"
    },
    {
      "role": "assistant",
      "content": "Previous assistant response"
    }
  ]
}
```

## Response Format

```json
{
  "content": "The LLM's response text",
  "model": "model-id",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

## Models

The backend is configured to use the following models from OpenRouter:

1. **Qwen/QwQ-32B** (LLM1): A powerful model for generating initial responses
2. **DeepSeek R1 Distill Qwen-32B** (LLM2): A model for refining and improving responses 