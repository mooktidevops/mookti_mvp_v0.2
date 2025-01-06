'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContentCardProps {
  title?: string;
  content: string;
}

export function ContentCard({ title, content }: ContentCardProps) {
  return (
    <div className="w-full max-w-4xl">
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p>{content}</p>
        </CardContent>
      </Card>
    </div>
  );
} 