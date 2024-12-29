import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/db';
import { contentChunks } from '@/db/schema';


export async function POST(request: Request) {
  try {
    const { moduleId, type, content, title, description, mediaAssetId } = await request.json();

    if (!moduleId || !type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: moduleId, type, content' },
        { status: 400 }
      );
    }

    const newId = uuidv4();

    // Determine next order
    const existingChunks = await db
      .select()
      .from(contentChunks)
      .where(eq(contentChunks.moduleId, moduleId));

    const nextOrder =
      existingChunks.length > 0
        ? Math.max(...existingChunks.map((c) => c.sequence_order)) + 1
        : 1;

    const [newChunk] = await db
      .insert(contentChunks)
      .values({
        id: newId,
        moduleId,
        sequence_order: nextOrder,
        title: title || null,
        description: description || null,
        content,
        type,
        nextAction: 'getNext',
        mediaAssetId: mediaAssetId || null,
      })
      .returning();

    return NextResponse.json(newChunk, { status: 201 });
  } catch (error: any) {
    console.error('Error creating chunk:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create chunk' },
      { status: 500 }
    );
  }
}