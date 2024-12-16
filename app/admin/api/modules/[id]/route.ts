// app/admin/api/modules/[id]/route.ts
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { modules, contentChunks } from '@/db/schema';

export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  
  try {
    // First get the module
    const [mod] = await db
      .select()
      .from(modules)
      .where(eq(modules.id, id));

    if (!mod) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    // Then get its chunks
    const chunks = await db
      .select()
      .from(contentChunks)
      .where(eq(contentChunks.moduleId, id))
      .orderBy(contentChunks.order);

    // Combine and return the data
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
  request: Request, 
  { params }: { params: { id: string } }
) {
  const { id } = await params;
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
  request: Request, 
  { params }: { params: { id: string } }
) {
  const { id } = await params;
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