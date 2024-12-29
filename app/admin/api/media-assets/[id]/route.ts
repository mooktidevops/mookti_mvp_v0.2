import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { mediaAssets } from '@/db/schema';

type RouteContext = {
  params: Promise<{ id: string }>
};

export async function GET(
  request: NextRequest, 
  context: RouteContext
) {
  const { id } = await context.params;
  const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
  if (!asset) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(asset);
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const { url, type, altText } = await request.json();
  const [updatedAsset] = await db
    .update(mediaAssets)
    .set({ url, type, altText })
    .where(eq(mediaAssets.id, id))
    .returning();

  if (!updatedAsset) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json(updatedAsset);
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const [deleted] = await db.delete(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .returning();

  if (!deleted) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  return NextResponse.json({ success: true });
}