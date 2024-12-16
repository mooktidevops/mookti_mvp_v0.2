// app/admin/api/modules/route.ts
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { modules } from '@/db/schema';

export async function GET() {
 console.log('GET /admin/api/modules - Fetching all modules');
 try {
   const allModules = await db.select().from(modules);
   console.log(`GET /admin/api/modules - Fetched ${allModules.length} modules`);
   return NextResponse.json(allModules);
 } catch (error) {
   console.error('GET /admin/api/modules - Error:', error);
   return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 }
}

export async function POST(request: Request) {
 console.log('POST /admin/api/modules - Creating new module');
 try {
   const { title, description, slug } = await request.json();

   // Basic validation
   if (!title || !slug) {
     console.log('POST /admin/api/modules - Validation failed: Missing required fields');
     return NextResponse.json(
       { error: 'Title and slug are required' }, 
       { status: 400 }
     );
   }

   const [newModule] = await db
     .insert(modules)
     .values({ title, description, slug })
     .returning();

   console.log('POST /admin/api/modules - Module created successfully:', newModule.id);
   return NextResponse.json(newModule, { status: 201 });
 } catch (error) {
   console.error('POST /admin/api/modules - Error:', error);
   return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 }
}