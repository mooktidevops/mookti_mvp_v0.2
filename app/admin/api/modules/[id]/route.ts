import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { modules } from '@/db/schema';


export async function GET(request: Request, { params }: { params: { id: string } }) {
  const [mod] = await db.select().from(modules).where(eq(modules.id, params.id));
  if (!mod) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(mod);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { title, description, slug } = await request.json();
  const [updatedModule] = await db
    .update(modules)
    .set({ title, description, slug })
    .where(eq(modules.id, params.id))
    .returning();

  if (!updatedModule) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(updatedModule);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const [deleted] = await db.delete(modules)
    .where(eq(modules.id, params.id))
    .returning();

  if (!deleted) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json({ success: true });
}