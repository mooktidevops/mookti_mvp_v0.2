import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { mediaAssets } from '@/db/schema';


export async function GET(request: Request, { params }: { params: { id: string } }) {
  const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, params.id));
  if (!asset) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(asset);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { url, type, altText } = await request.json();
  const [updatedAsset] = await db
    .update(mediaAssets)
    .set({ url, type, altText })
    .where(eq(mediaAssets.id, params.id))
    .returning();

  if (!updatedAsset) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(updatedAsset);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const [deleted] = await db.delete(mediaAssets)
    .where(eq(mediaAssets.id, params.id))
    .returning();

  if (!deleted) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json({ success: true });
}