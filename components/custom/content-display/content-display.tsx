'use client';

import { ContentChunk } from '@/lib/types/contentChunk';
import { DisplayType } from '@/lib/types/displayType';

import { CardCarousel } from './card-carousel';
import { ContentCard } from './content-card';
import { ChatBubble, ChatBubbleMessage } from '../shadcn-chat-cli/chat-bubble';

interface ContentDisplayProps {
  chunk: ContentChunk;
  isFromUser?: boolean;
}

export function ContentDisplay({ chunk, isFromUser = false }: ContentDisplayProps) {
  const renderContent = () => {
    switch (chunk.display_type) {
      case DisplayType.card_carousel:
        const carouselContent = JSON.parse(chunk.content);
        return <CardCarousel content={carouselContent} />;
      
      case DisplayType.card:
        return (
          <ContentCard 
            title={chunk.title} 
            content={chunk.content} 
          />
        );
      
      case DisplayType.message:
      default:
        return (
          <ChatBubble variant={isFromUser ? 'sent' : 'received'}>
            <ChatBubbleMessage>
              {chunk.content}
            </ChatBubbleMessage>
          </ChatBubble>
        );
    }
  };

  return (
    <div className={`w-full ${chunk.display_type !== DisplayType.message ? 'flex justify-start' : ''}`}>
      {renderContent()}
    </div>
  );
} 