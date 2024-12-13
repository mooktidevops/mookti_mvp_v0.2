import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { contentChunks } from '@/db/schema';


export async function GET() {
  const chunks = await db.select().from(contentChunks);
  return NextResponse.json(chunks);
}

export async function POST(request: Request) {
  const { moduleId, order, title, description, type, nextAction, content, mediaAssetId } = await request.json();

  // Validate required fields
  if (!moduleId || !order || !type || !nextAction || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const [newChunk] = await db.insert(contentChunks).values({
    moduleId,
    order,
    title,
    description,
    type,
    nextAction,
    content,
    mediaAssetId,
  }).returning();

  return NextResponse.json(newChunk, { status: 201 });
}