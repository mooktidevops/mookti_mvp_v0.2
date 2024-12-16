// app/admin/api/learning-path-modules/route.ts
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { learningPathModules, modules } from '@/db/schema';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const learningPathId = searchParams.get('learningPathId');

  if (!learningPathId) {
    return NextResponse.json({ error: 'Learning path ID is required' }, { status: 400 });
  }

  try {
    // Join with modules table to get full module information
    const pathModules = await db
      .select({
        id: modules.id,
        title: modules.title,
        description: modules.description,
        slug: modules.slug,
      })
      .from(learningPathModules)
      .innerJoin(modules, eq(learningPathModules.moduleId, modules.id))
      .where(eq(learningPathModules.learningPathId, learningPathId));

    return NextResponse.json(pathModules);
  } catch (error) {
    console.error('Error fetching learning path modules:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log('POST /admin/api/learning-path-modules - Creating new module relation');
  try {
    const { learningPathId, moduleId } = await request.json();

    if (!learningPathId || !moduleId) {
      console.log('POST /admin/api/learning-path-modules - Validation failed: Missing required fields');
      return NextResponse.json(
        { error: 'Learning path ID and module ID are required' },
        { status: 400 }
      );
    }

    await db
      .insert(learningPathModules)
      .values({
        learningPathId,
        moduleId,
      });

    console.log('POST /admin/api/learning-path-modules - Relation created successfully');
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /admin/api/learning-path-modules - Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}