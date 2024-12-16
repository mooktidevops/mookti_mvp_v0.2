// app/admin/api/learning-path-modules/[id]/route.ts
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { learningPathModules } from '@/db/schema';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: moduleId } = await params;
  const { searchParams } = new URL(request.url);
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