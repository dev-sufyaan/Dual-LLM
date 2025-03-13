import React, { useEffect, useRef } from 'react';
import { Message, LLMModel } from '../types';
import ChatMessage from './ChatMessage';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  model: LLMModel;
  onSendToOtherModel?: (content: string) => void;
  otherModel?: LLMModel;
  onToggleOptions?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  model,
  onSendToOtherModel,
  otherModel,
  onToggleOptions,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-container h-full">
      <div className="chat-header">
        <div className="model-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16h2v-2h-2v2zm0-4h2V7h-2v7z" />
          </svg>
        </div>
        <span className="font-medium">{model.name}</span>
        {messages.length > 0 && (
          <span className="memory-indicator">
            Memory: {messages.length} messages
          </span>
        )}
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages yet. Start a conversation!
          </div>
        )}
        
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} modelName={model.name} />
        ))}
        
        {isLoading && (
          <div className="thinking-indicator">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Thinking...</span>
            <button className="ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {onSendToOtherModel && otherModel && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
        <div className="p-2 border-t border-gray-100">
          <div className="flex space-x-2">
            <button
              onClick={() => onSendToOtherModel(messages[messages.length - 1].content)}
              className="flex-grow action-button bg-indigo-500 hover:bg-indigo-600 text-sm"
            >
              Send to {otherModel.name}
            </button>
            
            {onToggleOptions && (
              <button
                onClick={onToggleOptions}
                className="action-button bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm"
                title="Show options"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow; 