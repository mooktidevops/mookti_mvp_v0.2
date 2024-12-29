import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { modules, contentChunks } from '@/db/schema';

type RouteContext = {
  params: Promise<{ id: string }>
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  
  try {
    const [mod] = await db
      .select()
      .from(modules)
      .where(eq(modules.id, id));

    if (!mod) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    const chunks = await db
      .select()
      .from(contentChunks)
      .where(eq(contentChunks.module_id, id))
      .orderBy(contentChunks.sequence_order);

    return NextResponse.json({
      ...mod,
      chunks
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  try {
    const { title, description, slug } = await request.json();
    const [updatedModule] = await db
      .update(modules)
      .set({ title, description, slug })
      .where(eq(modules.id, id))
      .returning();

    if (!updatedModule) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  try {
    const [deleted] = await db
      .delete(modules)
      .where(eq(modules.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}