import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { learningPaths } from '@/db/schema';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const [path] = await db.select().from(learningPaths).where(eq(learningPaths.id, params.id));
  if (!path) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(path);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { title, description, slug } = await request.json();
  const [updatedPath] = await db
    .update(learningPaths)
    .set({ title, description, slug })
    .where(eq(learningPaths.id, params.id))
    .returning();

  if (!updatedPath) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(updatedPath);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const [deleted] = await db.delete(learningPaths)
    .where(eq(learningPaths.id, params.id))
    .returning();

  if (!deleted) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json({ success: true });
}