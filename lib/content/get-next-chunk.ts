import { InferSelectModel } from 'drizzle-orm';
import { eq, and, asc } from 'drizzle-orm/sql';
import { z } from 'zod';

import { db } from '@/db';
import { contentChunks } from '@/db/schema';
import { ValidationError } from '../progress-tracking/errors';
import { ProgressTrackingService, progressQueue } from '../progress-tracking/progress-service';

const progressService = new ProgressTrackingService();

// Input validation schema
const inputSchema = z.object({
  userId: z.string().uuid(),
  currentChunkId: z.string().uuid().nullable()
});

export class ContentChunkError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'ContentChunkError';
  }
}

export type ContentChunk = InferSelectModel<typeof contentChunks>;

export async function getNextContentChunk(
  userId: string,
  currentChunkId: string | null
): Promise<ContentChunk | null> {
  try {
    // Validate input parameters
    const validatedInput = inputSchema.parse({ userId, currentChunkId });

    // If no current chunk, get the first chunk of the module
    if (!validatedInput.currentChunkId) {
      const firstChunk = await db
        .select()
        .from(contentChunks)
        .orderBy(asc(contentChunks.sequence_order))
        .limit(1);

      if (!firstChunk.length) {
        throw new ContentChunkError('No content chunks found');
      }

      try {
        // Mark as in progress
        await progressService.updateChunkProgress(validatedInput.userId, firstChunk[0].id, 'in_progress', {
          updateParents: true
        });
      } catch (error) {
        throw new ContentChunkError('Failed to update progress for first chunk', error);
      }

      return firstChunk[0];
    }

    // Get current chunk to find its sequence order
    const currentChunk = await db
      .select()
      .from(contentChunks)
      .where(eq(contentChunks.id, validatedInput.currentChunkId))
      .limit(1);

    if (!currentChunk.length) {
      throw new ContentChunkError(`Current chunk not found: ${validatedInput.currentChunkId}`);
    }

    try {
      // Mark current chunk as completed
      await progressService.updateChunkProgress(validatedInput.userId, validatedInput.currentChunkId, 'completed', {
        updateParents: true,
        deferChunkUpdates: true
      });
    } catch (error) {
      throw new ContentChunkError('Failed to update progress for current chunk', error);
    }

    // Get next chunk in sequence
    const nextChunk = await db
      .select()
      .from(contentChunks)
      .where(
        and(
          eq(contentChunks.module_id, currentChunk[0].module_id),
          eq(contentChunks.sequence_order, currentChunk[0].sequence_order + 1)
        )
      )
      .limit(1);

    if (!nextChunk.length) {
      // No more chunks in this module
      // Flush deferred updates since we're at a module boundary
      try {
        await progressQueue.flush();
      } catch (error) {
        throw new ContentChunkError('Failed to flush progress queue', error);
      }
      return null;
    }

    try {
      // Mark next chunk as in progress
      await progressService.updateChunkProgress(validatedInput.userId, nextChunk[0].id, 'in_progress', {
        updateParents: true
      });
    } catch (error) {
      throw new ContentChunkError('Failed to update progress for next chunk', error);
    }

    return nextChunk[0];
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(`Invalid input parameters: ${error.errors.map(e => e.message).join(', ')}`);
    }
    if (error instanceof ContentChunkError || error instanceof ValidationError) {
      throw error;
    }
    throw new ContentChunkError('Failed to get next content chunk', error);
  }
} 