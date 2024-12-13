import { NextResponse } from 'next/server';

import { db } from '@/db';
import { learningPaths } from '@/db/schema';

export async function GET() {
  const paths = await db.select().from(learningPaths);
  return NextResponse.json(paths);
}

export async function POST(request: Request) {
  const { title, description, slug } = await request.json();
  const [newPath] = await db
    .insert(learningPaths)
    .values({ title, description, slug })
    .returning();

  return NextResponse.json(newPath, { status: 201 });
}