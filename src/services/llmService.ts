import axios from 'axios';
import { LLMResponse, LLMModel } from '../types';

// Backend API URL - use environment variable or fallback to localhost
const API_URL = (import.meta.env?.VITE_API_URL as string)?.replace(/\/$/, '') || 'http://localhost:8000';

// Default models - these should match the backend configuration
export const defaultModels: LLMModel[] = [
  {
    id: 'llm1',
    name: 'Gemini 2.0 Pro Experimental',
    description: 'First-pass model for generating responses',
    endpoint: `${API_URL}/llm1`,
  },
  {
    id: 'llm2',
    name: 'Gemini 2.0 Flash Thinking Experimental',
    description: 'Model for refining and improving responses',
    endpoint: `${API_URL}/llm2`,
  },
];

/**
 * Check if the API key is set and valid
 */
export const checkApiKeyStatus = async (): Promise<{ is_set: boolean; message: string }> => {
  try {
    const response = await axios.get(`${API_URL}/api-key-status`);
    return response.data;
  } catch (error) {
    console.error('Error checking API key status:', error);
    return {
      is_set: false,
      message: 'Failed to check API key status',
    };
  }
};

/**
 * Set the API key
 */
export const setApiKey = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/set-api-key`, { api_key: apiKey });
    return response.data;
  } catch (error) {
    console.error('Error setting API key:', error);
    return {
      success: false,
      message: 'Failed to set API key',
    };
  }
};

/**
 * Send a prompt to an LLM model and get a response
 */
export const sendPromptToLLM = async (
  modelId: string,
  prompt: string,
  previousMessages: { role: string; content: string }[] = [],
  additionalInput?: string,
  useCodeRefinement?: boolean
): Promise<LLMResponse> => {
  try {
    // Check API key status first
    const apiKeyStatus = await checkApiKeyStatus();
    if (!apiKeyStatus.is_set) {
      return getFallbackResponse(
        modelId,
        prompt,
        'API key is not set. Please set your Google API key in settings.'
      );
    }

    // Find the model endpoint
    const model = defaultModels.find((m) => m.id === modelId);
    if (!model) {
      throw new Error(`Model with ID ${modelId} not found`);
    }

    // Set timeout for the request
    const timeoutMs = 60000; // 60 seconds
    
    // Send request to the backend
    const response = await axios.post(
      model.endpoint, 
      {
        prompt,
        messages: previousMessages,
        additional_input: additionalInput,
        use_code_refinement: useCodeRefinement
      },
      {
        timeout: timeoutMs,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Validate response
    if (!response.data || !response.data.content) {
      console.error('Invalid response format:', response.data);
      return getFallbackResponse(modelId, prompt, "Invalid response format from the API");
    }

    return response.data;
  } catch (error) {
    console.error('Error sending prompt to LLM:', error);
    
    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return getFallbackResponse(
          modelId,
          prompt,
          'API key is not set or is invalid. Please check your settings.'
        );
      }
      if (error.code === 'ECONNREFUSED') {
        return getFallbackResponse(
          modelId, 
          prompt, 
          `Could not connect to the backend server. Please make sure it's running at ${API_URL}`
        );
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return getFallbackResponse(
          modelId, 
          prompt, 
          `Server responded with status ${error.response.status}. ${error.response.data?.detail || ''}`
        );
      } else if (error.request) {
        // The request was made but no response was received
        return getFallbackResponse(
          modelId, 
          prompt, 
          `No response received from server. The request timed out or the server is not responding.`
        );
      }
    }
    
    // Generic error
    return getFallbackResponse(
      modelId, 
      prompt, 
      `Could not reach ${modelId}. ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Generate a fallback response when the API call fails
 */
const getFallbackResponse = (
  modelId: string,
  prompt: string,
  errorMessage: string
): LLMResponse => {
  const content = `[Error: ${errorMessage}]

I apologize for the inconvenience. The API is currently experiencing issues. 

If you're trying to refine code, here are some general best practices:
1. Ensure proper error handling
2. Add meaningful comments
3. Follow consistent naming conventions
4. Break down complex functions into smaller ones
5. Write unit tests for your code

Please try again later or contact support if the issue persists.`;

  return {
    content,
    model: modelId,
    usage: {
      prompt_tokens: prompt.length,
      completion_tokens: content.length,
      total_tokens: prompt.length + content.length,
    },
  };
};

/**
 * For demo purposes, simulate an LLM response
 * This is used as a fallback if the API call fails
 */
export const simulateLLMResponse = async (
  modelId: string,
  prompt: string
): Promise<LLMResponse> => {
  try {
    // Try to use the real API first
    return await sendPromptToLLM(modelId, prompt);
  } catch (error) {
    console.error('Falling back to simulated response:', error);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Use our fallback response mechanism
    return getFallbackResponse(
      modelId,
      prompt,
      "API unavailable, using simulated response"
    );
  }
}; 