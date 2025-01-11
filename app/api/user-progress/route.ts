import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import {
  ProgressTrackingError,
  ValidationError,
  DatabaseError,
  InvalidStatusTransitionError,
  InvalidTimestampError,
  ContentNotFoundError
} from '@/lib/progress-tracking/errors';
import { getLastAccessedContent } from '@/lib/progress-tracking/last-accessed';
import { ProgressTrackingService, progressQueue } from '@/lib/progress-tracking/progress-service';
import { ProgressStatus } from '@/lib/progress-tracking/types';

const updateProgressSchema = z.object({
  contentChunkId: z.string().uuid(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  updateParents: z.boolean().optional(),
  deferChunkUpdates: z.boolean().optional()
});

const progressService = new ProgressTrackingService();

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const type = searchParams.get('type');

    if (type === 'last_accessed') {
      const content = await getLastAccessedContent(session.user.id);
      return NextResponse.json(content);
    }

    return new NextResponse('Invalid request type', { status: 400 });
  } catch (error) {
    console.error('Error in GET /api/user-progress:', error);
    
    if (error instanceof DatabaseError) {
      return new NextResponse('Database error', { status: 503 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { contentChunkId, status, updateParents, deferChunkUpdates } = updateProgressSchema.parse(body);

    await progressService.updateChunkProgress(session.user.id, contentChunkId, status as ProgressStatus, {
      updateParents,
      deferChunkUpdates
    });

    return new NextResponse('Progress updated', { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/user-progress:', error);

    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }

    if (error instanceof ValidationError) {
      return new NextResponse(error.message, { status: 400 });
    }

    if (error instanceof InvalidStatusTransitionError) {
      return new NextResponse(error.message, { status: 400 });
    }

    if (error instanceof InvalidTimestampError) {
      return new NextResponse(error.message, { status: 400 });
    }

    if (error instanceof ContentNotFoundError) {
      return new NextResponse(error.message, { status: 404 });
    }

    if (error instanceof DatabaseError) {
      return new NextResponse('Database error', { status: 503 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await progressQueue.flush();
    return new NextResponse('Progress queue flushed', { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/user-progress:', error);

    if (error instanceof DatabaseError) {
      return new NextResponse('Database error', { status: 503 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 