import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { learningPaths } from '@/db/schema';

type RouteContext = {
  params: Promise<{ id: string }>
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  console.log(`GET /admin/api/learning-paths/${id} - Fetching learning path`);
  try {
    const [path] = await db
      .select()
      .from(learningPaths)
      .where(eq(learningPaths.id, id));
    if (!path) {
      console.log(`GET /admin/api/learning-paths/${id} - Learning path not found`);
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    console.log(`GET /admin/api/learning-paths/${id} - Learning path fetched successfully`);
    return NextResponse.json(path);
  } catch (error) {
    console.error(`GET /admin/api/learning-paths/${id} - Error:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const { title, description, slug } = await request.json();
  // ... rest of the code
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  // ... rest of the code
}