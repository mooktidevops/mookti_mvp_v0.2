// app/admin/api/modules/[id]/chunks/reorder/route.ts
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { contentChunks } from '@/db/schema';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: moduleId } = await params;
  const { chunks: chunkIds } = await request.json();

  try {
    // Update each chunk's order based on its position in the array
    const updates = chunkIds.map((chunkId: string, index: number) =>
      db
        .update(contentChunks)
        .set({ order: index + 1 })
        .where(eq(contentChunks.id, chunkId))
    );

    await Promise.all(updates);

    // Fetch and return the updated chunks
    const updatedChunks = await db
      .select()
      .from(contentChunks)
      .where(eq(contentChunks.moduleId, moduleId))
      .orderBy(contentChunks.order);

    return NextResponse.json(updatedChunks);
  } catch (error) {
    console.error('Error reordering chunks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}