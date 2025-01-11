import { NextResponse } from 'next/server';
import { z } from 'zod';

export function errorResponse(
  error: unknown,
  defaultMessage = 'Internal server error',
  context = 'API'
): NextResponse<{ error: string; details?: z.ZodError['errors'] }> {
  console.error(`${context} Error:`, error);

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation error', details: error.errors },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message || defaultMessage },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: defaultMessage },
    { status: 500 }
  );
} 