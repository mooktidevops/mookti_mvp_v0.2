import { NextResponse } from 'next/server';

import { db } from '@/db';
import { modules } from '@/db/schema';

export async function GET() {
  const allModules = await db.select().from(modules);
  return NextResponse.json(allModules);
}

export async function POST(request: Request) {
  const { title, description, slug } = await request.json();
  const [newModule] = await db
    .insert(modules)
    .values({ title, description, slug })
    .returning();
  return NextResponse.json(newModule, { status: 201 });
}