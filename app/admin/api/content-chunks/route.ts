import { eq } from 'drizzle-orm/sql';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/db';
import { contentChunks, type ContentChunk } from '@/db/schema';
import { ChunkType, NextAction, DisplayType, type ApiResponse } from '@/lib/types/content';
import { errorResponse } from '@/lib/utils/api';

// Validation schema for POST request
const createChunkSchema = z.object({
  module_id: z.string().uuid(),
  type: z.enum(ChunkType),
  content: z.string(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  mediaAssetId: z.string().uuid().optional().nullable(),
  nextAction: z.enum(NextAction).default('getNext'),
  display_type: z.enum(DisplayType).default('message')
});

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<ContentChunk>>> {
  try {
    const payload = await request.json();
    const validatedData = createChunkSchema.parse(payload);

    // Determine next order
    const existingChunks = await db
      .select()
      .from(contentChunks)
      .where(eq(contentChunks.module_id, validatedData.module_id));

    const nextOrder =
      existingChunks.length > 0
        ? Math.max(...existingChunks.map((c) => c.sequence_order)) + 1
        : 1;

    const [newChunk] = await db
      .insert(contentChunks)
      .values({
        module_id: validatedData.module_id,
        sequence_order: nextOrder,
        title: validatedData.title,
        description: validatedData.description,
        content: validatedData.content,
        type: validatedData.type,
        nextAction: validatedData.nextAction,
        display_type: validatedData.display_type,
        mediaAssetId: validatedData.mediaAssetId
      })
      .returning();

    return NextResponse.json(newChunk, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Error creating content chunk', 'Content Chunks API');
  }
}