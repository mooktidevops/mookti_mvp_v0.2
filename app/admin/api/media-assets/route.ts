import { NextResponse } from 'next/server';

import { db } from '@/db';
import { mediaAssets } from '@/db/schema';

export async function GET() {
  const assets = await db.select().from(mediaAssets);
  return NextResponse.json(assets);
}

export async function POST(request: Request) {
  const { url, type, altText } = await request.json();
  if (type !== 'image' && type !== 'video') {
    return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
  }

  const [newAsset] = await db
    .insert(mediaAssets)
    .values({ url, type, altText })
    .returning();

  return NextResponse.json(newAsset, { status: 201 });
}