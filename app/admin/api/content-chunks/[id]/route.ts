import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { contentChunks } from '@/db/schema';


export async function GET(request: Request, { params }: { params: { id: string } }) {
  const [chunk] = await db.select().from(contentChunks).where(eq(contentChunks.id, params.id));
  if (!chunk) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
  return NextResponse.json(chunk);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { moduleId, order, title, description, type, nextAction, content, mediaAssetId } = await request.json();

  const [updatedChunk] = await db
    .update(contentChunks)
    .set({ moduleId, order, title, description, type, nextAction, content, mediaAssetId })
    .where(eq(contentChunks.id, params.id))
    .returning();

  if (!updatedChunk) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  return NextResponse.json(updatedChunk);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const [deleted] = await db.delete(contentChunks).where(eq(contentChunks.id, params.id)).returning();
  if (!deleted) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}