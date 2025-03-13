import React, { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import PromptInput from './components/PromptInput';
import { Message, ChatState } from './types';
import { generateId } from './utils/helpers';
import { defaultModels, sendPromptToLLM } from './services/llmService';

const App: React.FC = () => {
  // State for the two chat windows
  const [llm1State, setLlm1State] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  
  const [llm2State, setLlm2State] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  // State for additional input and code refinement
  const [additionalInput, setAdditionalInput] = useState<string>('');
  const [useCodeRefinement, setUseCodeRefinement] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);

  // Check if backend is available
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/');
        if (!response.ok) {
          console.warn('Backend server is not responding properly');
        } else {
          // Add welcome message to LLM1 when the app starts
          const welcomeMessage: Message = {
            id: generateId(),
            content: "Welcome! I'm now able to remember our conversation. Try introducing yourself, and I'll remember your name throughout our chat. You can also use the 'Clear Chat' button to start a new conversation.",
            role: 'assistant',
            timestamp: new Date(),
          };
          
          setLlm1State(prev => ({
            ...prev,
            messages: [welcomeMessage]
          }));
        }
      } catch (error) {
        console.warn('Backend server is not available:', error);
      }
    };
    
    checkBackendStatus();
  }, []);

  // Handle user prompt submission
  const handlePromptSubmit = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    // Create a new user message
    const userMessage: Message = {
      id: generateId(),
      content: prompt,
      role: 'user',
      timestamp: new Date(),
    };
    
    // Update LLM1 state with the user message
    setLlm1State((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));
    
    try {
      // Convert previous messages to the format expected by the API
      const previousMessages = llm1State.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Send the prompt to LLM1 with conversation history
      const response = await sendPromptToLLM('llm1', prompt, previousMessages);
      
      if (!response || !response.content) {
        throw new Error('Empty response from LLM1');
      }
      
      // Create an assistant message from the response
      const assistantMessage: Message = {
        id: generateId(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      // Update LLM1 state with the assistant message
      setLlm1State((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error getting response from LLM1:', error);
      setLlm1State((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get response from LLM1. Please try again.',
      }));
    }
  };

  // Send LLM1's response to LLM2 for refinement
  const sendToLLM2 = async (content: string) => {
    if (!content.trim()) return;
    
    // Create a new user message for LLM2 (this is LLM1's response)
    const userMessage: Message = {
      id: generateId(),
      content,
      role: 'user',
      timestamp: new Date(),
    };
    
    // Update LLM2 state with the user message
    setLlm2State((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));
    
    try {
      // Convert previous messages to the format expected by the API
      const previousMessages = llm2State.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Send LLM1's response to LLM2 for refinement with conversation history
      const response = await sendPromptToLLM('llm2', content, previousMessages, additionalInput, useCodeRefinement);
      
      if (!response || !response.content) {
        throw new Error('Empty response from LLM2');
      }
      
      // Create an assistant message from the response
      const assistantMessage: Message = {
        id: generateId(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      // Update LLM2 state with the assistant message
      setLlm2State((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));

      // Reset additional input and options after sending
      setAdditionalInput('');
      setShowOptions(false);
    } catch (error) {
      console.error('Error getting response from LLM2:', error);
      setLlm2State((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get response from LLM2. Please try again.',
      }));
    }
  };

  // Send LLM2's refined response back to LLM1 for further improvement
  const sendToLLM1 = async (content: string) => {
    if (!content.trim()) return;
    
    // Create a new user message for LLM1 (this is LLM2's refined response)
    const userMessage: Message = {
      id: generateId(),
      content,
      role: 'user',
      timestamp: new Date(),
    };
    
    // Update LLM1 state with the user message
    setLlm1State((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));
    
    try {
      // Convert previous messages to the format expected by the API
      const previousMessages = llm1State.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Send LLM2's refined response back to LLM1 with conversation history
      const response = await sendPromptToLLM('llm1', content, previousMessages, additionalInput);
      
      if (!response || !response.content) {
        throw new Error('Empty response from LLM1');
      }
      
      // Create an assistant message from the response
      const assistantMessage: Message = {
        id: generateId(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      // Update LLM1 state with the assistant message
      setLlm1State((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));

      // Reset additional input and options after sending
      setAdditionalInput('');
      setShowOptions(false);
    } catch (error) {
      console.error('Error getting response from LLM1:', error);
      setLlm1State((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get response from LLM1. Please try again.',
      }));
    }
  };

  // Toggle options panel
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  // Clear conversation history
  const clearConversation = () => {
    // Reset both chat states
    setLlm1State({
      messages: [],
      isLoading: false,
      error: null,
    });
    
    setLlm2State({
      messages: [],
      isLoading: false,
      error: null,
    });
    
    // Reset additional input and options
    setAdditionalInput('');
    setUseCodeRefinement(false);
    setShowOptions(false);
  };

  // Determine if the prompt input should be disabled
  const isInputDisabled = llm1State.isLoading || llm2State.isLoading;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">{defaultModels[0].name}</span>
            <span className="text-gray-400">•</span>
            <span className="font-medium text-gray-700">{defaultModels[1].name}</span>
          </div>
          <button
            onClick={clearConversation}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            title="Clear conversation history"
          >
            Clear Chat
          </button>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 gap-4">
        <div className="w-full md:w-1/2 h-1/2 md:h-full">
          <ChatWindow
            messages={llm1State.messages}
            isLoading={llm1State.isLoading}
            model={defaultModels[0]}
            onSendToOtherModel={sendToLLM2}
            otherModel={defaultModels[1]}
            onToggleOptions={toggleOptions}
          />
          {llm1State.error && (
            <div className="bg-red-50 text-red-600 p-2 text-sm mt-2 rounded">
              {llm1State.error}
            </div>
          )}
        </div>
        
        <div className="w-full md:w-1/2 h-1/2 md:h-full">
          <ChatWindow
            messages={llm2State.messages}
            isLoading={llm2State.isLoading}
            model={defaultModels[1]}
            onSendToOtherModel={sendToLLM1}
            otherModel={defaultModels[0]}
            onToggleOptions={toggleOptions}
          />
          {llm2State.error && (
            <div className="bg-red-50 text-red-600 p-2 text-sm mt-2 rounded">
              {llm2State.error}
            </div>
          )}
        </div>
      </main>
      
      {showOptions && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Input
            </label>
            <textarea
              value={additionalInput}
              onChange={(e) => setAdditionalInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add additional context or instructions..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="codeRefinement"
              checked={useCodeRefinement}
              onChange={(e) => setUseCodeRefinement(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="codeRefinement" className="ml-2 block text-sm text-gray-700">
              Use code refinement prompt (for improving code)
            </label>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={toggleOptions}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 mr-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      <PromptInput
        onSubmit={handlePromptSubmit}
        isDisabled={isInputDisabled}
        placeholder="How can I help you today?"
      />
    </div>
  );
};

export default App; 