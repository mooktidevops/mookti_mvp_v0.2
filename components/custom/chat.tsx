'use client';

import { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useWindowSize } from 'usehooks-ts';

import { ChatHeader } from '@/components/custom/chat-header';
import { PreviewMessage, ThinkingMessage } from '@/components/custom/message';
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { Button } from '@/components/ui/button';
import { Vote } from '@/db/schema';
import { ContentChunk } from '@/lib/types/contentChunk';
import { fetcher, generateUUID } from '@/lib/utils';

import { Block, UIBlock } from './block';
import { BlockStreamHandler } from './block-stream-handler';
import { MultimodalInput } from './multimodal-input';
import { Overview } from './overview';

interface ChatProps {
  id: string;
  initialMessages: Message[];
  selectedModelId: string;
  initialChunk?: ContentChunk | null;
}

export function Chat({ id, initialMessages, selectedModelId, initialChunk }: ChatProps) {
  const { mutate } = useSWRConfig();
  const [currentChunk, setCurrentChunk] = useState<ContentChunk | null>(null);
  const [showCheckInButtons, setShowCheckInButtons] = useState(false);
  const [viewingLLMExplanation, setViewingLLMExplanation] = useState(false);

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    data: streamingData,
  } = useChat({
    body: { id, modelId: selectedModelId },
    initialMessages,
    onFinish: () => {
      mutate('/api/history');
    },
  });

  useEffect(() => {
    console.log("initialChunk:", initialChunk);
    if (initialChunk) {
      console.log("Setting currentChunk from initialChunk");
      setCurrentChunk(initialChunk);
    } else {
      console.warn("No initialChunk provided. Cannot set currentChunk.");
    }
  }, [initialChunk]);

  const { width: windowWidth = 1920, height: windowHeight = 1080 } = useWindowSize();

  const [block, setBlock] = useState<UIBlock>({
    documentId: 'init',
    content: '',
    title: '',
    status: 'idle',
    isVisible: false,
    boundingBox: {
      top: windowHeight / 4,
      left: windowWidth / 4,
      width: 250,
      height: 50,
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher
  );

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  const fetchNextChunk = useCallback(async (current: ContentChunk, response: 'moveon' | 'tellmemore') => {
    console.log('Fetching next chunk, current:', current, 'response:', response);
    try {
      const res = await fetch('/api/nextContentChunk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentChunk: current, response }),
      });

      if (!res.ok) {
        console.error('Failed to fetch next content chunk', await res.text());
        return;
      }

      const { action, nextChunk } = await res.json() as { action: 'getNext' | 'repeat'; nextChunk: ContentChunk | null };
      console.log('Received response:', action, nextChunk);

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
      } else {
        // 'repeat' action or no nextChunk returned
        if (current) {
          setMessages(prevMessages => [
            ...prevMessages,
            {
              id: generateUUID(),
              role: 'system',
              content: current.content,
            },
          ]);
        }
      }

      setShowCheckInButtons(false);
    } catch (error) {
      console.error('Error fetching next chunk:', error);
    }
  }, [setCurrentChunk, setMessages, setShowCheckInButtons]);

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
      // Gather last 5 system messages
      const systemMessages = messages
        .filter(msg => msg.role === 'system')
        .slice(-5);
      const history = systemMessages.map(msg => msg.content);

      const res = await fetch('/api/tellMeMore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history }),
      });

      if (!res.ok) {
        console.error('Failed to fetch explanation from LLM:', await res.text());
        return;
      }

      const { answer } = await res.json() as { answer: string };
      setMessages(prevMessages => [
        ...prevMessages,
        { id: generateUUID(), role: 'system', content: answer }
      ]);

      setViewingLLMExplanation(true);
      setShowCheckInButtons(false);
    } else {
      // moveon logic
      await fetchNextChunk(currentChunk, response);
      setViewingLLMExplanation(false);
    }
  };

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader selectedModelId={selectedModelId} />
        <div
          ref={messagesContainerRef}
          className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
        >
          {messages.length === 0 && <Overview />}

          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              chatId={id}
              message={message}
              block={block}
              setBlock={setBlock}
              isLoading={isLoading && messages.length - 1 === index}
              vote={
                votes
                  ? votes.find((vote) => vote.messageId === message.id)
                  : undefined
              }
            />
          ))}

          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === 'user' && (
              <ThinkingMessage />
            )}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>
        <form className="flex flex-col mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {showCheckInButtons && (
            <div className="flex justify-center space-x-4 mb-4">
              <Button type="button" onClick={() => handleCheckInResponse('tellmemore')}>
                Tell me more
              </Button>
              <Button type="button" onClick={() => handleCheckInResponse('moveon')}>
                Let&apos;s keep going
              </Button>
            </div>
          )}

          {viewingLLMExplanation && (
            <div className="flex justify-center space-x-4 mb-4">
              <Button type="button" onClick={() => {
                if (!currentChunk) return;
                handleCheckInResponse('moveon');
                setViewingLLMExplanation(false);
              }}>
                Continue to next chunk
              </Button>
            </div>
          )}

          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            append={append}
            showCheckInButtons={showCheckInButtons}
          />
        </form>
      </div>

      <AnimatePresence>
        {block && block.isVisible && (
          <Block
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            append={append}
            block={block}
            setBlock={setBlock}
            messages={messages}
            setMessages={setMessages}
            votes={votes}
          />
        )}
      </AnimatePresence>

      <BlockStreamHandler streamingData={streamingData} setBlock={setBlock} />
    </>
  );
}