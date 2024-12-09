import { NextResponse } from 'next/server';

import { getNextContentChunk } from '@/lib/content/getNextContentChunk';
import { handleUserCheckIn } from '@/lib/content/handleUserCheckIn';
import { ContentChunk } from '@/lib/types/contentChunk';

export async function POST(req: Request) {
  try {
    const { currentChunk, response }: { currentChunk: ContentChunk; response: 'moveon' | 'tellmemore' } = await req.json();
    console.log('API received:', currentChunk, response);
    
    const action = await handleUserCheckIn(currentChunk, response);
    console.log('Action after check-in:', action);

    let nextChunk: ContentChunk | null = null;
    if (action === 'getNext') {
      nextChunk = await getNextContentChunk(currentChunk);
      console.log('Next chunk fetched:', nextChunk);
    }

    return NextResponse.json({
      action,
      nextChunk
    });
  } catch (error) {
    console.error("Error in nextContentChunk API:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}