// app/admin/api/learning-paths/[id]/reorder-modules/route.ts
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { learningPathModules } from '@/db/schema';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: learningPathId } = await params;
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