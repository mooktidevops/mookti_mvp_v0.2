'use client';

import { cn } from '@/lib/utils';

interface CodeDisplayBlockProps {
  code: string;
  lang?: string;
  className?: string;
}

export default function CodeDisplayBlock({
  code,
  lang = '',
  className,
}: CodeDisplayBlockProps) {
  return (
    <code
      className={cn(
        'block w-full rounded-md bg-muted p-4 text-sm',
        'font-mono text-muted-foreground',
        className
      )}
    >
      {code}
    </code>
  );
} 