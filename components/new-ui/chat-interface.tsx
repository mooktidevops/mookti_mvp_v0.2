"use client";

import React, { useState, useRef, useEffect, memo, ChangeEvent } from 'react';
import { Menu, ArrowUp } from 'lucide-react';
import MessageDisplay, { Message } from './message-display';
import SuggestedResponseBlock, { SuggestedResponse } from './suggested-response-block';
import { generateUUID } from '@/lib/utils';

interface ChatInterfaceProps {
  id: string;
  initialMessages: Message[];
  selectedModelId: string;
  initialChunk: any; // Replace 'any' with a more specific type if available
}

/**
 * ChatInterface is the primary UI for the chat page.
 * It initializes with props from the server (id, initialMessages, selectedModelId, initialChunk)
 * and provides functionalities for sending messages, toggling the sidebar, auto-resizing the input area,
 * and handling suggested response clicks.
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({
  id,
  initialMessages,
  selectedModelId,
  initialChunk,
}) => {
  // Sidebar visibility state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Controlled input for the message text area
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize messages from props.initialMessages
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  // Hard-coded suggested responses for now (could be enhanced later)
  const [suggestedResponses] = useState<SuggestedResponse[]>([
    { id: '1', text: 'Tell me more about the platform' },
    { id: '2', text: 'How do I get started?' },
    { id: '3', text: 'What will I learn?' },
  ]);

  // Auto-resize the textarea as the user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Handler for input change
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  // Handler for sending a new message
  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: generateUUID(),
        type: 'user',
        content: inputValue,
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputValue('');
    }
  };

  // Handler for clicking a suggested response
  const handleSuggestionClick = (suggestion: SuggestedResponse) => {
    const newMessage: Message = {
      id: generateUUID(),
      type: 'user',
      content: suggestion.text,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="h-screen bg-gray-100">
      <div className="h-full pt-20 pb-20 px-20">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-20 left-6 p-3 hover:bg-gray-200 rounded-lg bg-white shadow-sm z-10"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex gap-8 max-w-6xl mx-auto h-full">
          {/* Sidebar with Chat History */}
          {isSidebarOpen && (
            <aside className="w-64 bg-gray-800 text-white rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Chat History</h2>
              <nav className="space-y-2">
                <div className="p-2 bg-gray-700 rounded">Previous Chat 1</div>
                <div className="p-2 hover:bg-gray-700 rounded cursor-pointer">
                  Previous Chat 2
                </div>
                <div className="p-2 hover:bg-gray-700 rounded cursor-pointer">
                  Previous Chat 3
                </div>
              </nav>
            </aside>
          )}

          {/* Main Chat Area */}
          <main className="flex-1 flex flex-col bg-white rounded-lg">
            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4">
                    <MessageDisplay message={message} />
                  </div>
                ))}
              </div>
            </div>

            {/* Input Area & Suggested Responses */}
            <div className="p-4">
              <SuggestedResponseBlock
                suggestedResponses={suggestedResponses}
                onSuggestionClick={handleSuggestionClick}
              />
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="w-full resize-none overflow-hidden py-4 px-8 pr-16 focus:outline-none min-h-[56px] max-h-96 border border-gray-200 bg-gray-50 rounded-full"
                />
                <button
                  onClick={handleSendMessage}
                  className="absolute right-7 bottom-7 p-2 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center"
                  aria-label="Send message"
                >
                  <ArrowUp className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default memo(ChatInterface);