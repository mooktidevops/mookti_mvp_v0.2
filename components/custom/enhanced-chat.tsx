'use client';

import { useChat } from 'ai/react';
import { CopyIcon, RefreshCcw, Volume2, CornerDownLeft, Mic, Paperclip } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useSWR, { useSWRConfig } from 'swr';

import { Button } from '@/components/ui/button';
import { ContentChunk } from '@/lib/types/contentChunk';
import { Vote } from '@/lib/types/vote';
import { generateUUID } from '@/lib/utils';

import { ChatHeader } from './chat-header';
import { Overview } from './overview';
import { ChatBubble, ChatBubbleAction, ChatBubbleMessage } from './shadcn-chat-cli/chat-bubble';
import { ChatInput } from './shadcn-chat-cli/chat-input';
import { ChatMessageList } from './shadcn-chat-cli/chat-message-list';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ChatProps {
  id: string;
  initialMessages: any[];
  selectedModelId: string;
  initialChunk?: ContentChunk | null;
}

const ChatAiIcons = [
  {
    icon: CopyIcon,
    label: 'Copy',
  },
  {
    icon: RefreshCcw,
    label: 'Refresh',
  },
  {
    icon: Volume2,
    label: 'Volume',
  },
];

export function EnhancedChat({ id, initialMessages, selectedModelId, initialChunk }: ChatProps) {
  const { mutate } = useSWRConfig();
  const [currentChunk, setCurrentChunk] = useState<ContentChunk | null>(initialChunk || null);
  const [showCheckInButtons, setShowCheckInButtons] = useState(false);
  const [viewingLLMExplanation, setViewingLLMExplanation] = useState(false);

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    isLoading,
  } = useChat({
    body: { id, modelId: selectedModelId },
    initialMessages,
    onFinish: () => {
      mutate('/api/history');
    },
  });

  useEffect(() => {
    if (initialChunk && !currentChunk) {
      setCurrentChunk(initialChunk);
      if (initialChunk.nextAction === 'checkIn') {
        setShowCheckInButtons(true);
      }
    }
  }, [initialChunk, currentChunk]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { data: votes } = useSWR<Array<Vote>>(`/api/vote?chatId=${id}`, fetcher);

  const fetchNextChunk = useCallback(async (current: ContentChunk, response: 'moveon' | 'tellmemore') => {
    try {
      const res = await fetch('/api/nextContentChunk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentChunk: current, response }),
      });

      if (!res.ok) return;

      const { action, nextChunk } = await res.json() as { action: 'getNext' | 'repeat'; nextChunk: ContentChunk | null };

      if (action === 'getNext' && nextChunk) {
        setCurrentChunk(nextChunk);
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: generateUUID(),
            role: 'system',
            content: nextChunk.content,
          },
        ]);
      } else if (current) {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: generateUUID(),
            role: 'system',
            content: current.content,
          },
        ]);
      }

      setShowCheckInButtons(false);
    } catch (error) {
      // Silent error handling
    }
  }, [setMessages]);

  useEffect(() => {
    if (!currentChunk) return;

    if (currentChunk.nextAction === 'checkIn') {
      setShowCheckInButtons(true);
    } else {
      setShowCheckInButtons(false);
    }

    if (currentChunk.nextAction === 'getNext') {
      fetchNextChunk(currentChunk, 'moveon');
    }
  }, [currentChunk, fetchNextChunk]);

  const handleCheckInResponse = async (response: 'moveon' | 'tellmemore') => {
    if (!currentChunk) return;

    if (response === 'tellmemore') {
      const systemMessages = messages
        .filter(msg => msg.role === 'system')
        .slice(-5);
      const history = systemMessages.map(msg => msg.content);

      const res = await fetch('/api/tellMeMore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history }),
      });

      if (!res.ok) return;

      const { answer } = await res.json() as { answer: string };
      setMessages(prevMessages => [
        ...prevMessages,
        { id: generateUUID(), role: 'system', content: answer }
      ]);

      setViewingLLMExplanation(true);
      setShowCheckInButtons(false);
    } else {
      await fetchNextChunk(currentChunk, response);
      setViewingLLMExplanation(false);
    }
  };

  const handleActionClick = async (action: string, messageIndex: number) => {
    if (action === 'Copy') {
      const message = messages[messageIndex];
      if (message && message.role === 'assistant') {
        navigator.clipboard.writeText(message.content);
      }
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isLoading || !input) return;
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <ChatHeader selectedModelId={selectedModelId} />
      <ChatMessageList ref={messagesContainerRef}>
        {messages.length === 0 && !currentChunk && <Overview />}

        {messages.map((message, index) => (
          <ChatBubble
            key={message.id}
            variant={message.role === 'user' ? 'sent' : 'received'}
          >
            <ChatBubbleMessage>
              <div className="prose dark:prose-invert max-w-none">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </Markdown>
              </div>
              {message.role === 'assistant' && (
                <div className="flex items-center mt-1.5 gap-1">
                  {ChatAiIcons.map((icon, iconIndex) => {
                    const Icon = icon.icon;
                    return (
                      <ChatBubbleAction
                        key={iconIndex}
                        variant="outline"
                        className="size-5"
                        icon={<Icon className="size-3" />}
                        onClick={() => handleActionClick(icon.label, index)}
                      />
                    );
                  })}
                </div>
              )}
            </ChatBubbleMessage>
          </ChatBubble>
        ))}

        {showCheckInButtons && (
          <div className="flex justify-center gap-4 my-4">
            <Button
              variant="outline"
              onClick={() => handleCheckInResponse('moveon')}
            >
              Move On
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCheckInResponse('tellmemore')}
            >
              Tell Me More
            </Button>
          </div>
        )}

        {isLoading && (
          <ChatBubble variant="received">
            <ChatBubbleMessage isLoading />
          </ChatBubble>
        )}
      </ChatMessageList>

      <div className="w-full p-4">
        <form
          onSubmit={onSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your message here..."
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0">
            <Button variant="ghost" size="icon">
              <Paperclip className="size-4" />
              <span className="sr-only">Attach file</span>
            </Button>

            <Button variant="ghost" size="icon">
              <Mic className="size-4" />
              <span className="sr-only">Use Microphone</span>
            </Button>

            <Button
              disabled={!input || isLoading}
              type="submit"
              size="sm"
              className="ml-auto gap-1.5"
            >
              Send Message
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 