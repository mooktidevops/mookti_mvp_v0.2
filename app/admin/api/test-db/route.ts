import { sql } from 'drizzle-orm';import { NextResponse } from 'next/server';

import { db } from '@/db';


export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ status: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}