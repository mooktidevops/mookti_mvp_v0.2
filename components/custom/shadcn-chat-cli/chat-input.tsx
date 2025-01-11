'use client';

import * as React from "react";

import { Textarea } from "@/components/ui/textarea";
import { useWindowSize } from "@/hooks/use-window-size";
import { cn } from "@/lib/utils";

interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>{}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const scrollTimeoutRef = React.useRef<NodeJS.Timeout>();
    const { width } = useWindowSize();
    const isMobile = width ? width < 768 : false;
    const maxHeight = isMobile ? '60vh' : '30vh';

    const handleTextareaResize = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate new height
      const newHeight = Math.min(
        textarea.scrollHeight,
        (parseInt(maxHeight) * window.innerHeight) / 100
      );
      textarea.style.height = `${newHeight}px`;
    }, [maxHeight]);

    const handleScroll = (e: Event) => {
      const textarea = e.target as HTMLTextAreaElement;
      if (!textarea) return;

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Add scrolling class
      textarea.classList.add('scrolling');

      // Set new timeout to remove scrolling class
      scrollTimeoutRef.current = setTimeout(() => {
        textarea.classList.remove('scrolling');
      }, 1000);
    };

    React.useEffect(() => {
      handleTextareaResize();
      
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.addEventListener('scroll', handleScroll);
        return () => {
          textarea.removeEventListener('scroll', handleScroll);
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
        };
      }
    }, [props.value, handleTextareaResize]);

    return (
      <Textarea
        autoComplete="off"
        ref={(element) => {
          // Handle both refs
          textareaRef.current = element;
          if (typeof ref === 'function') {
            ref(element);
          } else if (ref) {
            ref.current = element;
          }
        }}
        name="message"
        className={cn(
          "min-h-[48px] w-full rounded-md",
          "px-4 py-3 resize-none",
          "bg-background text-sm",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          "overflow-auto",
          className
        )}
        style={{
          maxHeight: maxHeight
        }}
        onInput={handleTextareaResize}
        {...props}
      />
    );
  }
);
ChatInput.displayName = "ChatInput";

export { ChatInput };
