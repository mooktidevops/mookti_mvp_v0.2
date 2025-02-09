import React, { memo } from "react";
import { MessageSquare, MoreVertical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CardBlock from "./card-block";
import MultimediaBlock from "./multimedia-block";
import { Avatar } from '@/components/custom/avatar';
import { type User } from 'next-auth';

/**
 * Block content types for messages.
 */
export interface CardBlockContent {
  type: "card";
  title: string;
  cards: string[];
}

export interface MultimediaBlockContent {
  type: "multimedia";
  title: string;
  src: string;
  mediaType: "image" | "video";
  alt?: string;
}

export type BlockContent = CardBlockContent | MultimediaBlockContent;

/**
 * Message type for the chat interface.
 */
export interface Message {
  id: string;
  type: "user" | "system";
  content: string;
  blockContent?: BlockContent;
}

interface MessageDisplayProps {
  message: Message;
  user?: User;
}

const defaultUser: User = { email: 'default@example.com', role: 'user' };

/**
 * MessageDisplay renders a chat message.
 * It adjusts the layout based on whether the message is from the user or the system.
 * If blockContent is provided, it renders either a CardBlock or MultimediaBlock based on the type.
 */
const MessageDisplay: React.FC<MessageDisplayProps> = memo(({ message, user }) => {
  const renderBlockContent = () => {
    if (!message.blockContent) return null;

    if (message.blockContent.type === "card") {
      return (
        <CardBlock
          title={message.blockContent.title}
          cards={message.blockContent.cards}
        />
      );
    } else if (message.blockContent.type === "multimedia") {
      return (
        <MultimediaBlock
          title={message.blockContent.title}
          src={message.blockContent.src}
          mediaType={message.blockContent.mediaType}
          alt={message.blockContent.alt}
        />
      );
    }
    return null;
  };

  if (message.type === "user") {
    return (
      <>
        <div className="col-span-1" />
        <div className="col-span-4">
          <div className="flex items-start justify-end">
            <div className="bg-blue-500 text-white p-4 rounded-2xl">
              {message.content}
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 flex-shrink-0">
              <Avatar user={user ?? defaultUser} />
            </div>
          </div>
        </div>
        {renderBlockContent()}
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
            <div className="bg-gray-100 p-4 rounded-2xl">{message.content}</div>
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
      {renderBlockContent()}
    </>
  );
});

MessageDisplay.displayName = "MessageDisplay";

export default MessageDisplay;