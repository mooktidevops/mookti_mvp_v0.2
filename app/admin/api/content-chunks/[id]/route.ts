import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { contentChunks } from '@/db/schema';

export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const [chunk] = await db.select().from(contentChunks).where(eq(contentChunks.id, params.id));
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
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const payload = await request.json();
    const { moduleId, order, title, description, type, nextAction, content, mediaAssetId } = payload;

    // Validate required fields
    if (!moduleId || !type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: moduleId, type, content' },
        { status: 400 }
      );
    }

    // Update the chunk
    const [updatedChunk] = await db
      .update(contentChunks)
      .set({
        moduleId,
        order: typeof order === 'number' ? order : undefined,
        title: title || null,
        description: description || null,
        type,
        nextAction: nextAction || 'getNext',
        content,
        mediaAssetId: mediaAssetId || null,
      })
      .where(eq(contentChunks.id, params.id))
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
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const [deletedChunk] = await db
      .delete(contentChunks)
      .where(eq(contentChunks.id, params.id))
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