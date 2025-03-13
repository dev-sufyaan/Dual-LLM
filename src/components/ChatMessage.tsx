import React, { useState } from 'react';
import { Message } from '../types';
import { formatDate } from '../utils/helpers';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ChatMessageProps {
  message: Message;
  modelName: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, modelName }) => {
  const isUser = message.role === 'user';
  const [copiedBlocks, setCopiedBlocks] = useState<{ [key: number]: boolean }>({});

  const copyToClipboard = (text: string, blockIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBlocks(prev => ({ ...prev, [blockIndex]: true }));
    setTimeout(() => {
      setCopiedBlocks(prev => ({ ...prev, [blockIndex]: false }));
    }, 2000);
  };

  // Custom renderer for code blocks
  const renderers = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : 'text';
      const blockIndex = Math.random(); // Simple way to generate unique keys

      return !inline ? (
        <div className="relative">
          {language !== 'text' && (
            <span className="code-language-badge">
              {language}
            </span>
          )}
          <div className="syntax-highlighter">
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={language}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
          <button
            onClick={() => copyToClipboard(String(children), blockIndex)}
            className="copy-button"
          >
            {copiedBlocks[blockIndex] ? 'Copied!' : 'Copy'}
          </button>
        </div>
      ) : (
        <code className="bg-gray-100 dark:bg-gray-800 rounded px-1" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="mb-4">
      <div className="message-content">
        {!isUser && (
          <div className="message-header">
            <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-500 dark:text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16h2v-2h-2v2zm0-4h2V7h-2v7z" />
              </svg>
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">{modelName}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(message.timestamp)}
            </span>
          </div>
        )}
        
        <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
          <div className="message-body">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={renderers}
              className="whitespace-pre-wrap break-words"
            >
              {message.content || "No content available"}
            </ReactMarkdown>
          </div>
        </div>
        
        {!isUser && (
          <div className="message-actions">
            <button 
              className="message-action-button" 
              title="Copy to clipboard"
              onClick={() => copyToClipboard(message.content || "", -1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
              </svg>
            </button>
            <button className="message-action-button" title="Regenerate">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
            </button>
            <button className="message-action-button" title="Like">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" />
              </svg>
            </button>
            <button className="message-action-button" title="Dislike">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 