'use client';
import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import React from 'react';

export default function Chat({ 
  messages, 
  onSendMessage,
  isInitialView = false,
  isLoading = false
}: {
  messages: { id?: number; role: string; content: string; }[];
  onSendMessage: (message: string) => void;
  isInitialView: boolean;
  isLoading?: boolean;
}) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const handleSampleAppClick = (description: string) => {
    setInput(description);
  };

  const formatMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match?.[1] || '';
        const code = match?.[2] || part.slice(3, -3);
        
        return (
          <pre key={i} className="bg-gray-800 text-gray-100 p-3 rounded my-3 overflow-x-auto text-left text-sm">
            <code className={`language-${language}`}>{code}</code>
          </pre>
        );
      } else if (part.trim()) {
        return part.split('\n\n').map((paragraph, j) => 
          paragraph.trim() ? (
            <p key={`${i}-${j}`} className="mb-2 last:mb-0">{paragraph}</p>
          ) : null
        );
      }
      return null;
    });
  };

  if (isInitialView) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-claude-bg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-3 text-claude-text">Welcome to CodeCraft AI</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Describe the application you want to build, or select a sample app below.
          </p>
        </div>
        
        <div className="w-full max-w-xl">
          <form onSubmit={handleSubmit} className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Create a to-do list app with dark mode..."
              className="flex-1 chat-input"
              autoFocus
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`ml-2 p-3 bg-claude-purple rounded-md text-white hover:bg-claude-purple-light focus:outline-none focus:ring-2 focus:ring-claude-purple-dark transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
          
          <div className="mt-8 flex gap-4 justify-center">
            {[
              { label: 'Todo App', desc: 'Task management with dark mode', text: 'Create a to-do list app with dark mode, task completion, and deletion functionality' },
              { label: 'Blog Site', desc: 'Markdown blog with comments', text: 'Create a blog site with markdown support, comments, and a clean design' },
              { label: 'E-commerce', desc: 'Simple shop with cart', text: 'Create an e-commerce site with product listings, shopping cart, and checkout' }
            ].map((sample, idx) => (
              <div
                key={idx}
                onClick={() => !isLoading && handleSampleAppClick(sample.text)}
                className={`text-center p-4 border border-claude-border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <p className="font-medium mb-1">{sample.label}</p>
                <p className="text-xs text-gray-500">{sample.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-chat-bg border-r border-claude-border">
      <div className="p-3 border-b border-claude-border bg-claude-sidebar">
        <h2 className="text-lg font-medium text-claude-text">Chat</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}>
            <div
              className={`inline-block px-4 py-3 rounded-lg max-w-xs sm:max-w-md whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-claude-purple text-white rounded-br-none'
                  : 'bg-gray-100 text-claude-text rounded-bl-none'
              }`}
            >
              {formatMessageContent(message.content)}
            </div>
            {message.role === 'assistant' && index !== messages.length - 1 && (
              <div className="border-b border-claude-border my-6"></div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="mb-4">
            <div className="inline-block px-4 py-3 rounded-lg max-w-xs sm:max-w-md bg-gray-100 text-claude-text rounded-bl-none">
              <div className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin text-claude-purple" />
                <span className="text-gray-500">Generating code...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-claude-border">
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your prompt here..."
            className="flex-1 chat-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`ml-2 p-3 bg-claude-purple rounded-md text-white hover:bg-claude-purple-light focus:outline-none focus:ring-2 focus:ring-claude-purple-dark transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
