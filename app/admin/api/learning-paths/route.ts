import { NextResponse } from 'next/server';

import { db } from '@/db';
import { learningPaths } from '@/db/schema';

export async function GET() {
  console.log('GET /api/learning-paths - Fetching learning paths');
  try {
    const paths = await db.select().from(learningPaths);
    console.log(`GET /api/learning-paths - Fetched ${paths.length} learning paths`);
    return NextResponse.json(paths);
  } catch (error) {
    console.error('GET /api/learning-paths - Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { title, description, slug } = await request.json();
  const [newPath] = await db
    .insert(learningPaths)
    .values({ title, description, slug })
    .returning();

  return NextResponse.json(newPath, { status: 201 });
}