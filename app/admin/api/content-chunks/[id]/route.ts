import { eq } from 'drizzle-orm/sql';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/db';
import { contentChunks, type ContentChunk } from '@/db/schema';
import { ChunkType, NextAction, DisplayType, type ApiResponse } from '@/lib/types/content';
import { errorResponse } from '@/lib/utils/api';

// Define the params type according to Next.js 15 docs
type RouteContext = {
  params: Promise<{ id: string }>
};

// Validation schema for route parameters
const routeParamsSchema = z.object({
  id: z.string().uuid('Invalid ID format')
});

// Validation schema for PUT request
const updateChunkSchema = z.object({
  module_id: z.string().uuid('Invalid module ID format'),
  sequence_order: z.number().int('Sequence order must be an integer').optional(),
  title: z.string().min(1, 'Title must not be empty').optional().nullable(),
  description: z.string().optional().nullable(),
  type: z.enum(ChunkType, {
    errorMap: () => ({ message: `Type must be one of: ${ChunkType.join(', ')}` })
  }),
  nextAction: z.enum(NextAction, {
    errorMap: () => ({ message: `Next action must be one of: ${NextAction.join(', ')}` })
  }),
  content: z.string().min(1, 'Content must not be empty'),
  mediaAssetId: z.string().uuid('Invalid media asset ID format').optional().nullable(),
  display_type: z.enum(DisplayType, {
    errorMap: () => ({ message: `Display type must be one of: ${DisplayType.join(', ')}` })
  })
});

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<ContentChunk>>> {
  try {
    const { id } = routeParamsSchema.parse(await context.params);

    const [chunk] = await db
      .select()
      .from(contentChunks)
      .where(eq(contentChunks.id, id));

    if (!chunk) {
      return NextResponse.json(
        { error: `Content chunk not found: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(chunk);
  } catch (error) {
    return errorResponse(error, 'Error fetching content chunk', 'Content Chunks API');
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<ContentChunk>>> {
  try {
    const { id } = routeParamsSchema.parse(await context.params);

    const payload = await request.json();
    const validatedData = updateChunkSchema.parse(payload);

    // Check if the chunk exists before updating
    const [existingChunk] = await db
      .select()
      .from(contentChunks)
      .where(eq(contentChunks.id, id));

    if (!existingChunk) {
      return NextResponse.json(
        { error: `Content chunk not found: ${id}` },
        { status: 404 }
      );
    }

    const [updatedChunk] = await db
      .update(contentChunks)
      .set({
        module_id: validatedData.module_id,
        sequence_order: validatedData.sequence_order ?? existingChunk.sequence_order,
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        nextAction: validatedData.nextAction,
        content: validatedData.content,
        mediaAssetId: validatedData.mediaAssetId,
        display_type: validatedData.display_type,
        updatedAt: new Date()
      })
      .where(eq(contentChunks.id, id))
      .returning();

    return NextResponse.json(updatedChunk);
  } catch (error) {
    return errorResponse(error, 'Error updating content chunk', 'Content Chunks API');
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  try {
    const { id } = routeParamsSchema.parse(await context.params);

    const [deletedChunk] = await db
      .delete(contentChunks)
      .where(eq(contentChunks.id, id))
      .returning();

    if (!deletedChunk) {
      return NextResponse.json(
        { error: `Content chunk not found: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: `Content chunk deleted successfully: ${id}` }
    );
  } catch (error) {
    return errorResponse(error, 'Error deleting content chunk', 'Content Chunks API');
  }
}