from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import os
import json
import traceback
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API key storage - will be set via API endpoint
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Define the models
MODELS = {
    "llm1": {
        "id": "gemini-2.0-pro-exp-02-05",
        "name": "Gemini 2.0 Pro Experimental",
        "description": "First-pass model for generating responses"
    },
    "llm2": {
        "id": "gemini-2.0-flash-thinking-exp-01-21",
        "name": "Gemini 2.0 Flash Thinking Experimental",
        "description": "Model for refining and improving responses"
    }
}

# Define system prompts
SYSTEM_PROMPT = """
You are a helpful AI assistant. Please maintain context throughout the conversation and remember details that the user shares with you, such as their name, preferences, or any other information they provide.

When the user refers to something mentioned earlier in the conversation, recall that information and respond appropriately. If the user introduces themselves, remember their name and use it in your responses when appropriate.

Always be respectful, helpful, and provide accurate information.
"""

# Define code refinement prompts
CODE_REFINEMENT_PROMPT = """
You are a code review expert. Your task is to refine and improve the code provided. Follow these steps:

1. Identify any bugs, errors, or potential issues in the code
   - Look for syntax errors, logical errors, edge cases, and potential exceptions
   - Check for security vulnerabilities, memory leaks, or performance bottlenecks
   - Identify any race conditions or concurrency issues

2. Suggest improvements for code quality, readability, and maintainability
   - Recommend better variable/function naming
   - Suggest adding or improving comments and documentation
   - Identify code that could be refactored for clarity
   - Check for proper indentation and formatting

3. Optimize the code for better performance where possible
   - Identify inefficient algorithms or data structures
   - Suggest optimizations for time or space complexity
   - Look for unnecessary computations or redundant operations

4. Ensure the code follows best practices for the language/framework
   - Check for proper error handling and exception management
   - Verify that the code follows language-specific conventions
   - Ensure proper use of language features and libraries

5. Provide a complete, corrected version of the code
   - Include all necessary imports and dependencies
   - Make sure the corrected code is fully functional
   - Maintain the original functionality while improving the implementation

Be specific in your explanations and provide the full corrected code with clear comments explaining your changes.
"""

# Create FastAPI app
app = FastAPI(title="Dual LLM Chat API")

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request and response models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    prompt: str
    messages: Optional[List[Message]] = None
    additional_input: Optional[str] = None
    use_code_refinement: Optional[bool] = False

class TokenUsage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class ChatResponse(BaseModel):
    content: str
    model: str
    usage: Optional[TokenUsage] = None

# API Key management models
class ApiKeyRequest(BaseModel):
    api_key: str

class ApiKeyResponse(BaseModel):
    success: bool
    message: str

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_detail = f"An unexpected error occurred: {str(exc)}"
    print(f"Error: {error_detail}")
    print(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": error_detail},
    )

# Helper function to call Gemini API
async def call_gemini(model_id: str, messages: List[Dict[str, str]]):
    # Check if API key is set
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=401, 
            detail="API key is not set. Please set your Google API key in settings."
        )
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={GEMINI_API_KEY}"
    
    # Format messages for Gemini API
    gemini_messages = []
    
    # Add system prompt as the first message
    gemini_messages.append({
        "role": "user",
        "parts": [{"text": SYSTEM_PROMPT}]
    })
    
    # Add the rest of the messages
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        gemini_messages.append({
            "role": role,
            "parts": [{"text": msg["content"]}]
        })
    
    payload = {
        "contents": gemini_messages,
        "generationConfig": {
            "temperature": 0.9,
            "maxOutputTokens": 10243,
            "topP": 0.95,
            "topK": 40
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload)
            
            if response.status_code != 200:
                error_msg = f"Gemini API error: {response.text}"
                print(error_msg)
                raise HTTPException(status_code=response.status_code, detail=error_msg)
            
            response_data = response.json()
            
            # Debug the response structure
            print(f"Gemini API response structure: {json.dumps(response_data, indent=2)}")
            
            # Check if the response has the expected structure
            if "candidates" not in response_data or not response_data["candidates"]:
                error_msg = f"Unexpected response format from Gemini API: {json.dumps(response_data)}"
                print(error_msg)
                raise HTTPException(status_code=500, detail="Invalid response format from Gemini API")
                
            return response_data
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request to Gemini API timed out")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Error communicating with Gemini API: {str(exc)}")
    except Exception as e:
        print(f"Unexpected error in call_gemini: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# Routes
@app.get("/")
async def read_root():
    return {"message": "Dual LLM Chat API is running"}

@app.get("/api/models")
async def get_models():
    return MODELS

# API Key management endpoints
@app.post("/api/set-api-key", response_model=ApiKeyResponse)
async def set_api_key(request: ApiKeyRequest):
    global GEMINI_API_KEY
    try:
        # Set the API key
        GEMINI_API_KEY = request.api_key
        
        # Test the API key with a simple request
        test_messages = [{"role": "user", "content": "Hello, this is a test message."}]
        await call_gemini(MODELS["llm1"]["id"], test_messages)
        
        return ApiKeyResponse(
            success=True,
            message="API key set successfully and verified."
        )
    except Exception as e:
        # Reset the API key if it's invalid
        GEMINI_API_KEY = ""
        return ApiKeyResponse(
            success=False,
            message=f"Failed to set API key: {str(e)}"
        )

@app.get("/api/api-key-status")
async def get_api_key_status():
    return {
        "is_set": bool(GEMINI_API_KEY),
        "message": "API key is set and ready to use." if GEMINI_API_KEY else "API key is not set. Please set your Google API key in settings."
    }

@app.post("/api/llm1", response_model=ChatResponse)
async def query_llm1(request: ChatRequest):
    # Format messages for Gemini API
    formatted_messages = []
    
    # Add previous messages if provided - this is crucial for maintaining conversation history
    if request.messages:
        for msg in request.messages:
            formatted_messages.append({"role": msg.role, "content": msg.content})
    
    # Prepare the prompt with additional context if needed
    prompt = request.prompt
    
    # If additional input is provided, add it to the prompt
    if request.additional_input:
        prompt = f"{prompt}\n\nAdditional context/instructions: {request.additional_input}"
    
    # Add the current prompt as a user message
    formatted_messages.append({"role": "user", "content": prompt})
    
    # Call Gemini API
    try:
        response_data = await call_gemini(MODELS["llm1"]["id"], formatted_messages)
        
        # Extract the response content with better error handling
        try:
            content = response_data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as e:
            print(f"Error extracting content from response: {str(e)}")
            print(f"Response data: {json.dumps(response_data, indent=2)}")
            
            # Provide a fallback response
            content = "I apologize, but I couldn't process your request properly. There was an issue with the API response format."
        
        # Estimate token usage (Gemini doesn't provide this directly)
        prompt_text = " ".join([msg["content"] for msg in formatted_messages])
        estimated_prompt_tokens = len(prompt_text.split()) * 1.3  # rough estimate
        estimated_completion_tokens = len(content.split()) * 1.3  # rough estimate
        
        usage = TokenUsage(
            prompt_tokens=int(estimated_prompt_tokens),
            completion_tokens=int(estimated_completion_tokens),
            total_tokens=int(estimated_prompt_tokens + estimated_completion_tokens)
        )
        
        return ChatResponse(
            content=content,
            model=MODELS["llm1"]["id"],
            usage=usage
        )
    except Exception as e:
        print(f"Error in query_llm1: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/api/llm2", response_model=ChatResponse)
async def query_llm2(request: ChatRequest):
    # Format messages for Gemini API
    formatted_messages = []
    
    # Add previous messages if provided - this is crucial for maintaining conversation history
    if request.messages:
        for msg in request.messages:
            formatted_messages.append({"role": msg.role, "content": msg.content})
    
    # Prepare the prompt with additional context if needed
    prompt = request.prompt
    
    # If this is a code refinement request, add the code refinement prompt
    if request.use_code_refinement:
        prompt = f"{CODE_REFINEMENT_PROMPT}\n\nHere is the code to review and improve:\n\n{request.prompt}"
    
    # If additional input is provided, add it to the prompt
    if request.additional_input:
        prompt = f"{prompt}\n\nAdditional context/instructions: {request.additional_input}"
    
    # Add the current prompt as a user message
    formatted_messages.append({"role": "user", "content": prompt})
    
    # Call Gemini API
    try:
        response_data = await call_gemini(MODELS["llm2"]["id"], formatted_messages)
        
        # Extract the response content with better error handling
        try:
            content = response_data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as e:
            print(f"Error extracting content from response: {str(e)}")
            print(f"Response data: {json.dumps(response_data, indent=2)}")
            
            # Provide a fallback response
            content = "I apologize, but I couldn't process your request properly. There was an issue with the API response format."
        
        # Estimate token usage (Gemini doesn't provide this directly)
        prompt_text = " ".join([msg["content"] for msg in formatted_messages])
        estimated_prompt_tokens = len(prompt_text.split()) * 1.3  # rough estimate
        estimated_completion_tokens = len(content.split()) * 1.3  # rough estimate
        
        usage = TokenUsage(
            prompt_tokens=int(estimated_prompt_tokens),
            completion_tokens=int(estimated_completion_tokens),
            total_tokens=int(estimated_prompt_tokens + estimated_completion_tokens)
        )
        
        return ChatResponse(
            content=content,
            model=MODELS["llm2"]["id"],
            usage=usage
        )
    except Exception as e:
        print(f"Error in query_llm2: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 