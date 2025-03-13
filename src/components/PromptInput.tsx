import React, { useState, FormEvent, KeyboardEvent, useEffect, useRef } from 'react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  isDisabled = false,
  placeholder = 'How can I help you today?',
}) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isDisabled) {
      onSubmit(prompt.trim());
      setPrompt('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white p-2">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            className="input-field min-h-[40px] max-h-[200px] resize-none py-2 pl-3 pr-10"
            rows={1}
          />
          
          <div className="absolute right-2 bottom-2 flex items-center">
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600 mr-1"
              title="Add attachment"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button
              type="submit"
              disabled={isDisabled || !prompt.trim()}
              className={`p-1 text-indigo-500 hover:text-indigo-600 ${
                isDisabled || !prompt.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </form>
        
        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
          <div>
            <span className="mr-2">AI-generated content may not be accurate.</span>
          </div>
          <div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptInput; 