// app/admin/api/learning-path-modules/[id]/route.ts
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { learningPathModules } from '@/db/schema';

type RouteContext = {
  params: Promise<{ id: string }>
};

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { id: moduleId } = await context.params;
  const { searchParams } = request.nextUrl; // Using NextRequest's nextUrl property
  const learningPathId = searchParams.get('learningPathId');

  if (!learningPathId) {
    return NextResponse.json({ error: 'Learning path ID is required' }, { status: 400 });
  }

  try {
    await db
      .delete(learningPathModules)
      .where(
        and(
          eq(learningPathModules.moduleId, moduleId),
          eq(learningPathModules.learningPathId, learningPathId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting learning path module relation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}