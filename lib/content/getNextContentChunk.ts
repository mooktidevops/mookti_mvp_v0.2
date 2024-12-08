import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { contentChunk } from '@/db/schema';
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
        .from(contentChunk)
        .where(and(
          eq(contentChunk.moduleId, currentChunk.moduleId),
          eq(contentChunk.chunkId, currentChunk.chunkId + 1)
        ))
        .limit(1);

      if (result.length > 0) {
        nextChunk = result[0] as ContentChunk;
      }
    } else if (currentChunk.nextAction === 'nextModule') {
      // Fetch the first chunk of the next module
      const result = await db.select()
        .from(contentChunk)
        .where(and(
          eq(contentChunk.moduleId, currentChunk.moduleId + 1),
          eq(contentChunk.chunkId, 1)
        ))
        .limit(1);

      if (result.length > 0) {
        nextChunk = result[0] as ContentChunk;
      }
    } else {
      console.warn(`Unexpected nextAction: ${currentChunk.nextAction}`);
      return null;
    }

    return nextChunk;
  } catch (error) {
    console.error("Error fetching next content chunk:", error);
    return null;
  } finally {
    await connection.end();
  }
}