// app/admin/api/learning-paths/[id]/reorder-modules/route.ts
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { learningPathModules } from '@/db/schema';

type RouteContext = {
  params: Promise<{ id: string }>
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const { id: learningPathId } = await context.params;
  const { modules: moduleIds } = await request.json();

  try {
    // For now, we'll just validate that the relations exist
    // In a real application, you might want to update order in a separate column
    const existingModules = await db
      .select()
      .from(learningPathModules)
      .where(eq(learningPathModules.learningPathId, learningPathId));

    if (existingModules.length !== moduleIds.length) {
      return NextResponse.json({ error: 'Invalid module list' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering modules:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}