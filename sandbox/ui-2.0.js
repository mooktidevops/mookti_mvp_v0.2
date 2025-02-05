import React, { useState, useRef, useEffect, memo } from 'react';
import {
  Menu,
  MessageSquare,
  ArrowUp,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * LearningBlock displays a carousel of educational cards.
 */
const LearningBlock = memo(({ title, cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextCard = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
  };

  const prevCard = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="col-span-5 my-4 px-12">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {cards.map((card, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white p-6 rounded-lg shadow-sm">{card}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextCard}
            disabled={currentIndex === cards.length - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center mt-4 gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

/**
 * MessageDisplay renders a chat message.  
 * It adjusts the layout based on whether the message is from the user or the system.
 */
const MessageDisplay = memo(({ message }) => {
  if (message.type === 'user') {
    return (
      <>
        <div className="col-span-1" />
        <div className="col-span-4">
          <div className="flex items-start justify-end">
            <div className="bg-blue-500 text-white p-4 rounded-2xl">
              {message.content}
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="col-span-4">
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2 flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1">
            <div className="bg-gray-100 p-4 rounded-2xl">
              {message.content}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1 hover:bg-gray-200 rounded-full">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Additional context about this response...
                  </p>
                  <div className="flex flex-col gap-2">
                    <a href="#" className="text-sm text-blue-500 hover:underline">
                      Related documentation
                    </a>
                    <a href="#" className="text-sm text-blue-500 hover:underline">
                      Learn more
                    </a>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <div className="col-span-1" />
      {message.blockContent && (
        <LearningBlock
          title={message.blockContent.title}
          cards={message.blockContent.cards}
        />
      )}
    </>
  );
});

/**
 * ChatInterface serves as the main UI container for the chat-based educational platform.
 */
const ChatInterface = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      type: 'system',
      content: 'Welcome to your first learning module!',
      blockContent: {
        title: 'Getting Started',
        cards: [
          'Introduction to the platform',
          'Setting up your environment',
          'Basic concepts'
        ]
      }
    },
    { type: 'user', content: 'Thanks, excited to learn!' }
  ]);

  const [suggestedResponses] = useState([
    { id: '1', text: 'Tell me more about the platform' },
    { id: '2', text: 'How do I get started?' },
    { id: '3', text: 'What will I learn?' }
  ]);

  // Auto-resize the textarea as the user types.
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages((prev) => [...prev, { type: 'user', content: inputValue }]);
      setInputValue('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessages((prev) => [...prev, { type: 'user', content: suggestion.text }]);
  };

  return (
    <div className="h-screen bg-gray-100">
      <div className="h-full pt-20 pb-20 px-20">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-20 left-6 p-3 hover:bg-gray-200 rounded-lg bg-white shadow-sm z-10"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex gap-8 max-w-6xl mx-auto h-full">
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

          <main className="flex-1 flex flex-col bg-white rounded-lg">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4">
                    <MessageDisplay message={message} />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4">
              <div className="flex flex-wrap justify-end gap-2 mb-4">
                {suggestedResponses.map((response) => (
                  <button
                    key={response.id}
                    onClick={() => handleSuggestionClick(response)}
                    className="px-4 py-2 border border-blue-500 rounded-full text-sm hover:bg-blue-500 hover:text-white transition-all"
                  >
                    {response.text}
                  </button>
                ))}
              </div>
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

export default ChatInterface;