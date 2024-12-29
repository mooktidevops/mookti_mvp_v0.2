import { eq, and, gt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { contentChunks } from '@/db/schema';
import { ContentChunk } from '@/lib/types/contentChunk';

export async function getNextContentChunk(currentChunk: ContentChunk): Promise<ContentChunk | null> {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  const connection = postgres(process.env.POSTGRES_URL);
  const db = drizzle(connection);

  try {
    let nextChunk: ContentChunk | null = null;

    if (currentChunk.nextAction === 'getNext') {
      // Fetch the next chunk in the same module
      const result = await db.select()
        .from(contentChunks)
        .where(and(
          eq(contentChunks.module_id, currentChunk.module_id),
          gt(contentChunks.sequence_order, currentChunk.sequence_order)
        ))
        .orderBy(contentChunks.sequence_order)
        .limit(1);

      if (result.length > 0) {
        nextChunk = result[0] as ContentChunk;
      }
    }

    return nextChunk;
  } finally {
    await connection.end();
  }
}