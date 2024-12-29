import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { contentChunks } from '@/db/schema';

type RouteContext = {
  params: Promise<{ id: string }>
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const { id: module_id } = await context.params;
  const { chunks: chunkIds } = await request.json();

  try {
    const updates = chunkIds.map((chunkId: string, index: number) =>
      db
        .update(contentChunks)
        .set({ sequence_order: index + 1 })
        .where(eq(contentChunks.id, chunkId))
    );

    await Promise.all(updates);

    const updatedChunks = await db
      .select()
      .from(contentChunks)
      .where(eq(contentChunks.module_id, module_id))
      .orderBy(contentChunks.sequence_order);

    return NextResponse.json(updatedChunks);
  } catch (error) {
    console.error('Error reordering chunks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}