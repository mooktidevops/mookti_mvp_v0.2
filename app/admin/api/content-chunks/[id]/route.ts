import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { contentChunks } from '@/db/schema';

// Define the params type according to Next.js 15 docs
type RouteContext = {
  params: Promise<{ id: string }>
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  try {
    const [chunk] = await db.select().from(contentChunks).where(eq(contentChunks.id, id));
    if (!chunk) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    return NextResponse.json(chunk, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching chunk:', error);
    return NextResponse.json({ error: 'Failed to fetch chunk' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  try {
    const payload = await request.json();
    const { module_id, order, title, description, type, nextAction, content, mediaAssetId } = payload;

    if (!module_id || !type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: module_id, type, content' },
        { status: 400 }
      );
    }

    const [updatedChunk] = await db
      .update(contentChunks)
      .set({
        module_id,
        sequence_order: typeof order === 'number' ? order : undefined,
        title: title || null,
        description: description || null,
        type,
        nextAction: nextAction || 'getNext',
        content,
        mediaAssetId: mediaAssetId || null,
      })
      .where(eq(contentChunks.id, id))
      .returning();

    if (!updatedChunk) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    return NextResponse.json(updatedChunk, { status: 200 });
  } catch (error: any) {
    console.error('Error updating chunk:', error);
    return NextResponse.json({ error: 'Failed to update chunk' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  try {
    const [deletedChunk] = await db
      .delete(contentChunks)
      .where(eq(contentChunks.id, id))
      .returning();

    if (!deletedChunk) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting chunk:', error);
    return NextResponse.json({ error: 'Failed to delete chunk' }, { status: 500 });
  }
}