import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { contentChunks } from '@/db/schema';
import { ContentChunk } from '@/lib/types/contentChunk';

export async function getInitialContentChunk(): Promise<ContentChunk | null> {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  const connection = postgres(process.env.POSTGRES_URL);
  const db = drizzle(connection);

  try {
    // Replace with the actual UUID of a known module in your DB
    const targetModuleId = '00000000-0000-0000-0000-000000000000';

    const result = await db.select().from(contentChunks)
      .where(and(
        eq(contentChunks.moduleId, targetModuleId),
        eq(contentChunks.order, 1)
      ))
      .limit(1);

    await connection.end();

    if (result.length > 0) {
      return result[0] as ContentChunk;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching initial content chunk:", error);
    await connection.end();
    return null;
  }
}